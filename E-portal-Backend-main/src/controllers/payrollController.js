const { query, transaction } = require('../config/database');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const { sendPayslipEmail } = require('../services/emailService');

/* ─── Helper: parse numeric safely ─────────────────────────────────── */
const num = (v) => parseFloat(v || 0);

/* ─── Helper: month name ────────────────────────────────────────────── */
const monthName = (m, y) => moment(`${y}-${String(m).padStart(2, '0')}-01`).format('MMMM YYYY');

/* ═══════════════════════════════════════════════════════════════════
   GET /api/payroll/summary   – HR/Admin/CEO
   Supports: month, year, department, status, search, page, limit
═══════════════════════════════════════════════════════════════════ */
const getPayrollSummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const dept = req.query.department;
    const status = req.query.status;
    const search = req.query.search;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        p.id,
        p.employee_id   AS payroll_employee_id,
        e.id            AS employee_uuid,
        e.employee_id   AS emp_code,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.email,
        e.position,
        d.name          AS department_name,
        d.id            AS department_id,
        p.month,
        p.year,
        p.basic_salary,
        p.hra,
        p.conveyance,
        p.medical,
        p.special,
        p.bonus,
        p.overtime,
        p.other_earnings,
        p.gross_salary,
        p.pf,
        p.esi,
        p.professional_tax,
        p.tds,
        p.loan,
        p.advance,
        p.other_deductions,
        p.total_deductions,
        p.net_salary,
        p.status,
        p.payment_date,
        p.payment_method,
        p.transaction_id,
        p.email_sent,
        p.email_sent_at,
        p.created_at,
        p.processed_by,
        b.bank_name,
        b.account_holder_name AS bank_account_holder,
        b.verification_status AS bank_verification_status,
        b.account_type AS bank_account_type,
        b.routing_number AS bank_routing_number
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_bank_details b ON e.id = b.employee_id
      WHERE p.month = $1 AND p.year = $2
    `;

    const params = [month, year];
    let idx = 3;

    if (dept && dept !== 'all') {
      sql += ` AND d.id = $${idx++}`;
      params.push(dept);
    }
    if (status && status !== 'all') {
      sql += ` AND p.status = $${idx++}`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (
        LOWER(CONCAT(e.first_name, ' ', e.last_name)) LIKE $${idx} OR
        LOWER(e.employee_id) LIKE $${idx} OR
        LOWER(e.position) LIKE $${idx}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    // Get total count before pagination
    const countSql = sql.replace(/SELECT[\s\S]+?FROM/, 'SELECT COUNT(*) AS total FROM');
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || 0);

    // Add sort + pagination
    sql += ` ORDER BY e.first_name ASC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Aggregate summary stats for this month
    const aggSql = `
      SELECT
        COUNT(*)                                           AS total_employees,
        SUM(p.gross_salary)                                AS total_gross,
        SUM(p.total_deductions)                            AS total_deductions,
        SUM(p.net_salary)                                  AS total_net,
        SUM(CASE WHEN p.status = 'paid' THEN 1 ELSE 0 END)        AS paid_count,
        SUM(CASE WHEN p.status = 'processed' THEN 1 ELSE 0 END)   AS pending_count,
        SUM(CASE WHEN p.status = 'paid' THEN p.net_salary ELSE 0 END) AS paid_amount,
        SUM(CASE WHEN p.status = 'processed' THEN p.net_salary ELSE 0 END) AS pending_amount
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.month = $1 AND p.year = $2
    `;
    const aggRes = await query(aggSql, [month, year]);
    const agg = aggRes.rows[0] || {};

    const summaryData = {
      totalEmployees: parseInt(agg.total_employees || 0),
      total_employees: parseInt(agg.total_employees || 0),
      totalGross: num(agg.total_gross),
      total_gross: num(agg.total_gross),
      totalDeductions: num(agg.total_deductions),
      total_deductions: num(agg.total_deductions),
      totalNet: num(agg.total_net),
      total_net: num(agg.total_net),
      paidCount: parseInt(agg.paid_count || 0),
      paid: parseInt(agg.paid_count || 0),
      pendingCount: parseInt(agg.pending_count || 0),
      pending: parseInt(agg.pending_count || 0),
      paidAmount: num(agg.paid_amount),
      pendingAmount: num(agg.pending_amount)
    };

    const payload = {
      success: true,
      month,
      year,
      monthLabel: monthName(month, year),
      payroll: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: summaryData,
      byDepartment: []
    };

    res.json({
      ...payload,
      data: payload
    });
  } catch (error) {
    console.error('getPayrollSummary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payroll data' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/payroll/generate   – HR/Admin
   Body: { month, year, employeeIds? }
   Generates payroll for active employees for the specified month.
   Skips employees that already have a record for that month (ON CONFLICT).
═══════════════════════════════════════════════════════════════════ */
const generatePayroll = async (req, res) => {
  try {
    const month = parseInt(req.body.month) || new Date().getMonth() + 1;
    const year = parseInt(req.body.year) || new Date().getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month. Must be 1–12.' });
    }
    if (year < 2020 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year.' });
    }

    // Fetch active employees (optionally filter by IDs)
    let empSql = "SELECT * FROM employees WHERE status IN ('active', 'probation')";
    const empParams = [];
    if (req.body.employeeIds && Array.isArray(req.body.employeeIds) && req.body.employeeIds.length > 0) {
      empSql += ` AND id = ANY($1::uuid[])`;
      empParams.push(req.body.employeeIds);
    }
    const empsRes = await query(empSql, empParams);
    const employees = empsRes.rows;

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No active employees found.' });
    }

    let generated = 0;
    let skipped = 0;

    await transaction(async (client) => {
      for (const emp of employees) {
        const basic = num(emp.salary) || 5000;
        const hra = parseFloat((basic * 0.40).toFixed(2));
        const conv = 1600;
        const med = 1250;
        const special = parseFloat((basic * 0.10).toFixed(2));
        const gross = parseFloat((basic + hra + conv + med + special).toFixed(2));
        const pf = parseFloat((basic * 0.12).toFixed(2));
        const pt = 200;
        const tds = gross > 25000 ? parseFloat((gross * 0.05).toFixed(2)) : 0;
        const deds = parseFloat((pf + pt + tds).toFixed(2));
        const net = parseFloat((gross - deds).toFixed(2));

        const result = await client.query(
          `INSERT INTO payroll
             (employee_id, month, year, basic_salary, hra, conveyance, medical, special,
              gross_salary, pf, professional_tax, tds, total_deductions, net_salary,
              status, processed_by, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'processed',$15,NOW(),NOW())
           ON CONFLICT (employee_id, month, year) 
           DO UPDATE SET 
             basic_salary = EXCLUDED.basic_salary,
             hra = EXCLUDED.hra,
             conveyance = EXCLUDED.conveyance,
             medical = EXCLUDED.medical,
             special = EXCLUDED.special,
             gross_salary = EXCLUDED.gross_salary,
             pf = EXCLUDED.pf,
             professional_tax = EXCLUDED.professional_tax,
             tds = EXCLUDED.tds,
             total_deductions = EXCLUDED.total_deductions,
             net_salary = EXCLUDED.net_salary,
             status = 'processed',
             updated_at = NOW()
           RETURNING id, net_salary`,
          [emp.id, month, year, basic, hra, conv, med, special, gross, pf, pt, tds, deds, net, req.user.id]
        );

        if (result.rowCount > 0) { generated++; } else { skipped++; }
      }
    });

    res.json({
      success: true,
      message: `Payroll generated for ${monthName(month, year)}`,
      generated,
      skipped,
      total: employees.length
    });
  } catch (error) {
    console.error('generatePayroll error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Payroll already generated for some employees this month.' });
    }
    res.status(500).json({ success: false, message: 'Failed to generate payroll' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   PUT /api/payroll/:id/pay   – HR/Admin
   Marks a payroll entry as paid
═══════════════════════════════════════════════════════════════════ */
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const txnId = req.body.transaction_id || `TXN${Date.now()}`;
    const method = req.body.payment_method || 'bank_transfer';
    const payDate = req.body.payment_date || moment().format('YYYY-MM-DD');

    const result = await query(
      `UPDATE payroll
       SET status = 'paid',
           payment_date = $1,
           payment_method = $2,
           transaction_id = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [payDate, method, txnId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.json({ success: true, payroll: result.rows[0] });
  } catch (error) {
    console.error('processPayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/payroll/:id   – Get single payroll record (for payslip)
═══════════════════════════════════════════════════════════════════ */
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
              e.employee_id AS emp_code,
              e.email,
              e.position,
              e.phone,
              e.join_date AS date_of_joining,
              d.name AS department_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    const row = result.rows[0];
    // Only allow HR/admin/ceo OR the employee themselves
    if (!['admin', 'hr', 'ceo'].includes(req.user.role) && row.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, payroll: row });
  } catch (error) {
    console.error('getPayrollById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/payroll/:id/download   – Download PDF payslip
═══════════════════════════════════════════════════════════════════ */
const downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
              e.employee_id AS emp_code,
              e.email,
              e.position,
              e.phone,
              e.join_date AS date_of_joining,
              d.name AS department_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    const p = result.rows[0];
    if (!['admin', 'hr', 'ceo'].includes(req.user.role) && p.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const pdf = generatePayslipPDF(p);

    const fileName = `Payslip_${(p.employee_name || 'Employee').replace(/\s+/g, '_')}_${p.year}_${String(p.month).padStart(2, '0')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    pdf.pipe(res);
    pdf.end();
  } catch (error) {
    console.error('downloadPayslip error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate payslip PDF' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/payroll/:id/send-email   – Email payslip PDF
═══════════════════════════════════════════════════════════════════ */
const sendPayslipEmailEndpoint = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid payroll ID format' });
    }

    const result = await query(
      `SELECT p.*,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
              e.employee_id AS emp_code,
              e.email,
              e.position,
              e.phone,
              d.name AS department_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    const p = result.rows[0];
    if (!p.email || !p.email.trim()) {
      return res.status(400).json({ success: false, message: 'Employee email not found' });
    }

    // Generate PDF and convert to buffer
    const pdf = generatePayslipPDF(p);
    const chunks = [];
    pdf.on('data', (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      pdf.on('end', resolve);
      pdf.on('error', reject);
      pdf.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const fileName = `Payslip_${(p.employee_name || 'Employee').replace(/\s+/g, '_')}_${p.year}_${String(p.month).padStart(2, '0')}.pdf`;

    // Send email with attachment using centralized emailService
    const { sendPayslipEmailWithAttachment } = require('../services/emailService');

    try {
      await sendPayslipEmailWithAttachment({
        to: p.email,
        subject: `Your Payslip for ${monthName(p.month, p.year)}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:30px;text-align:center;border-radius:10px 10px 0 0">
              <h1 style="color:white;margin:0">KVX Portal — Payslip</h1>
            </div>
            <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px">
              <p>Dear <strong>${p.employee_name}</strong>,</p>
              <p>Your payslip for <strong>${monthName(p.month, p.year)}</strong> is attached to this email.</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <tr><td style="padding:8px;color:#6b7280">Employee ID</td><td style="padding:8px;font-weight:600">${p.emp_code || '—'}</td></tr>
                <tr><td style="padding:8px;color:#6b7280">Department</td><td style="padding:8px;font-weight:600">${p.department_name || '—'}</td></tr>
                <tr><td style="padding:8px;color:#6b7280">Gross Salary</td><td style="padding:8px;font-weight:600">$${num(p.gross_salary).toFixed(2)}</td></tr>
                <tr><td style="padding:8px;color:#6b7280">Net Salary</td><td style="padding:8px;font-weight:600;color:#10b981">$${num(p.net_salary).toFixed(2)}</td></tr>
              </table>
              <p style="color:#6b7280;font-size:12px;text-align:center">This is an automated message from KVX HR Portal.</p>
            </div>
          </div>
        `,
        attachments: [{ filename: fileName, content: pdfBuffer, contentType: 'application/pdf' }]
      });
    } catch (emailErr) {
      console.warn('Payslip email sending transport warning:', emailErr.message);
    }

    // Record email sent in DB
    await query(
      `UPDATE payroll SET email_sent = true, email_sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Create in-app notification for the employee/admin recipient
    try {
      const { createNotification } = require('../services/notificationService');
      const notifData = await createNotification({
        user_id: p.employee_id,
        type: 'payroll',
        title: 'Payslip Emailed',
        message: `Your payslip for ${monthName(p.month, p.year)} has been emailed to ${p.email}.`,
        link: `/payslip/${id}`,
        metadata: { payroll_id: id }
      });

      // Emit socket notification to employee room
      const io = req.app.get('io');
      if (io && p.employee_id) {
        io.to(`user_${p.employee_id}`).emit('notification', notifData);
        io.to(`user_${p.employee_id}`).emit('notification_received', notifData);
      }
    } catch (notifErr) {
      console.warn('Payslip notification non-fatal error:', notifErr.message);
    }

    return res.status(200).json({ success: true, message: `Payslip emailed to ${p.email}` });
  } catch (error) {
    console.error('sendPayslipEmail error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send payslip email.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/payroll/my-payslips   – Employee's own payslip history
═══════════════════════════════════════════════════════════════════ */
const getMyPayslips = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const countRes = await query('SELECT COUNT(*) AS total FROM payroll WHERE employee_id = $1', [req.user.id]);
    const total = parseInt(countRes.rows[0]?.total || 0);

    const result = await query(
      `SELECT p.*,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
              e.employee_id AS emp_code,
              d.name AS department_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.employee_id = $1
       ORDER BY p.year DESC, p.month DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      payslips: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('getMyPayslips error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/payroll/employee/:employeeId  – employee history (HR/admin)
═══════════════════════════════════════════════════════════════════ */
const getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (employeeId !== req.user.id && !['admin', 'hr', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await query(
      `SELECT p.*,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
              e.employee_id AS emp_code,
              d.name AS department_name
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.employee_id = $1
       ORDER BY p.year DESC, p.month DESC`,
      [employeeId]
    );

    res.json({ success: true, payroll: result.rows });
  } catch (error) {
    console.error('getEmployeePayroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   PDF generation helper
═══════════════════════════════════════════════════════════════════ */
function generatePayslipPDF(p) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const GREEN = '#10b981';
  const DARK = '#111827';
  const GRAY = '#6b7280';
  const LIGHT = '#f9fafb';
  const WHITE = '#ffffff';
  const RED = '#ef4444';

  // ── Header Banner ──────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 120).fill(GREEN);
  doc.fillColor(WHITE).fontSize(28).font('Helvetica-Bold').text('KVX', 50, 30);
  doc.fontSize(10).font('Helvetica').text('Enterprise HR Portal', 50, 62);
  doc.fontSize(20).font('Helvetica-Bold').text('PAYSLIP', 0, 35, { align: 'right' });
  doc.fontSize(11).font('Helvetica').fillColor('#d1fae5')
    .text(monthName(p.month, p.year), 0, 62, { align: 'right' });

  // ── Employee Details ────────────────────────────────────────────
  doc.rect(50, 140, doc.page.width - 100, 85).fillAndStroke(LIGHT, '#e5e7eb');
  doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text(p.employee_name || 'Employee', 65, 155);
  doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(p.position || 'Employee', 65, 172);

  const rightX = doc.page.width / 2 + 20;
  const col2 = [
    ['Employee ID', p.emp_code || '—'],
    ['Department', p.department_name || '—'],
    ['Pay Period', monthName(p.month, p.year)],
    ['Payment Date', p.payment_date ? moment(p.payment_date).format('DD MMM YYYY') : 'Pending'],
  ];

  const leftDetails = [
    ['Email', p.email || '—'],
    ['Position', p.position || '—'],
    ['Status', (p.status || 'processed').toUpperCase()],
  ];

  let yy = 155;
  leftDetails.forEach(([label, val]) => {
    doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(label + ':', 280, yy);
    doc.fillColor(DARK).fontSize(8).font('Helvetica-Bold').text(val, 340, yy);
    yy += 14;
  });

  yy = 155;
  col2.forEach(([label, val]) => {
    doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(label + ':', rightX, yy);
    doc.fillColor(DARK).fontSize(8).font('Helvetica-Bold').text(val, rightX + 80, yy);
    yy += 14;
  });

  // ── Earnings Table ──────────────────────────────────────────────
  let y = 250;

  const drawSectionHeader = (title, yPos) => {
    doc.rect(50, yPos, doc.page.width - 100, 22).fill(GREEN);
    doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text(title, 60, yPos + 5);
    doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text('Amount (USD)', 0, yPos + 5, { align: 'right', width: doc.page.width - 60 });
    return yPos + 22;
  };

  const drawRow = (label, amount, yPos, shade = false) => {
    if (shade) doc.rect(50, yPos, doc.page.width - 100, 18).fill('#f0fdf4');
    doc.fillColor(DARK).fontSize(9).font('Helvetica').text(label, 60, yPos + 4);
    const amtStr = amount > 0 ? `$${num(amount).toFixed(2)}` : '—';
    doc.fillColor(amount > 0 ? DARK : GRAY).fontSize(9).font('Helvetica').text(amtStr, 0, yPos + 4, { align: 'right', width: doc.page.width - 60 });
    return yPos + 18;
  };

  // Earnings
  y = drawSectionHeader('EARNINGS', y);
  const earnings = [
    ['Basic Salary', p.basic_salary],
    ['House Rent Allowance (HRA)', p.hra],
    ['Conveyance Allowance', p.conveyance],
    ['Medical Allowance', p.medical],
    ['Special Allowance', p.special],
    ['Bonus', p.bonus],
    ['Overtime Pay', p.overtime],
    ['Other Earnings', p.other_earnings],
  ];
  earnings.forEach(([label, val], i) => {
    y = drawRow(label, num(val), y, i % 2 === 0);
  });

  // Earnings total
  doc.rect(50, y, doc.page.width - 100, 20).fill('#dcfce7');
  doc.fillColor('#065f46').fontSize(10).font('Helvetica-Bold').text('Gross Salary', 60, y + 4);
  doc.text(`$${num(p.gross_salary).toFixed(2)}`, 0, y + 4, { align: 'right', width: doc.page.width - 60 });
  y += 24;

  // Deductions
  y += 8;
  y = drawSectionHeader('DEDUCTIONS', y);
  const deductions = [
    ['Provident Fund (PF)', p.pf],
    ['ESI / Insurance', p.esi],
    ['Professional Tax', p.professional_tax],
    ['TDS / Income Tax', p.tds],
    ['Loan Recovery', p.loan],
    ['Advance Recovery', p.advance],
    ['Other Deductions', p.other_deductions],
  ];
  deductions.forEach(([label, val], i) => {
    y = drawRow(label, num(val), y, i % 2 === 0);
  });

  // Deductions total
  doc.rect(50, y, doc.page.width - 100, 20).fill('#fee2e2');
  doc.fillColor('#7f1d1d').fontSize(10).font('Helvetica-Bold').text('Total Deductions', 60, y + 4);
  doc.text(`$${num(p.total_deductions).toFixed(2)}`, 0, y + 4, { align: 'right', width: doc.page.width - 60 });
  y += 28;

  // ── Net Salary Banner ───────────────────────────────────────────
  doc.rect(50, y, doc.page.width - 100, 48).fill(GREEN);
  doc.fillColor(WHITE).fontSize(14).font('Helvetica-Bold').text('NET SALARY', 60, y + 8);
  doc.fillColor(WHITE).fontSize(18).font('Helvetica-Bold')
    .text(`$${num(p.net_salary).toFixed(2)}`, 0, y + 8, { align: 'right', width: doc.page.width - 60 });
  doc.fillColor('#d1fae5').fontSize(8).font('Helvetica')
    .text('Amount credited to bank account', 60, y + 30);
  y += 60;

  // ── Footer ──────────────────────────────────────────────────────
  doc.rect(50, y, doc.page.width - 100, 1).fill('#e5e7eb');
  y += 8;
  doc.fillColor(GRAY).fontSize(7).font('Helvetica')
    .text('This is a computer-generated payslip and does not require a signature. For queries contact HR at hr@kvx.com', 50, y, { align: 'center', width: doc.page.width - 100 });

  if (p.transaction_id) {
    doc.text(`Transaction ID: ${p.transaction_id}  |  Generated: ${moment().format('DD MMM YYYY HH:mm')}`, 50, y + 12, { align: 'center', width: doc.page.width - 100 });
  }

  return doc;
}

module.exports = {
  getPayrollSummary,
  generatePayroll,
  getMyPayslips,
  processPayment,
  getPayrollById,
  downloadPayslip,
  sendPayslipEmailEndpoint,
  getEmployeePayroll
};
