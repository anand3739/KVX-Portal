const { query } = require('../config/database');

/**
 * Mask sensitive account number (e.g. •••• •••• •••• 1234)
 */
const maskAccountNumber = (accNumber) => {
  if (!accNumber) return '';
  const str = String(accNumber).trim();
  if (str.length <= 4) return `•••• ${str}`;
  const last4 = str.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

/**
 * Mask routing number (e.g. ******789)
 */
const maskRoutingNumber = (routing) => {
  if (!routing) return '';
  const str = String(routing).trim();
  if (str.length <= 3) return `••• ${str}`;
  return `******${str.slice(-3)}`;
};

/**
 * GET /api/employees/me/bank-details
 * Retrieve authenticated employee's banking details (Masked)
 */
const getMyBankDetails = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await query(
      `SELECT id, employee_id, account_holder_name, bank_name, account_number,
              account_type, routing_number, branch_name, branch_code, swift_code,
              currency, is_primary, verification_status, verification_notes,
              verified_at, created_at, updated_at
       FROM employee_bank_details
       WHERE employee_id = $1`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        has_bank_details: false,
        bank_details: null,
        message: 'No bank details registered yet.'
      });
    }

    const raw = result.rows[0];
    const masked = {
      ...raw,
      account_number_raw_last4: raw.account_number ? String(raw.account_number).slice(-4) : '',
      account_number: maskAccountNumber(raw.account_number),
      account_number_masked: maskAccountNumber(raw.account_number),
      routing_number_masked: maskRoutingNumber(raw.routing_number)
    };

    return res.json({
      success: true,
      has_bank_details: true,
      bank_details: masked
    });
  } catch (error) {
    console.error('Error fetching bank details:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch bank details' });
  }
};

/**
 * PUT /api/employees/me/bank-details
 * Create or update authenticated employee's banking details
 */
const updateMyBankDetails = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      account_holder_name,
      bank_name,
      account_number,
      confirm_account_number,
      account_type = 'Savings',
      routing_number = '',
      branch_name = '',
      branch_code = '',
      swift_code = '',
      currency = 'USD'
    } = req.body;

    // Server-side validations
    if (!account_holder_name || String(account_holder_name).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Account holder name is required (min 2 characters).' });
    }

    if (!bank_name || String(bank_name).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Bank name is required (min 2 characters).' });
    }

    if (!account_number || String(account_number).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Valid account number is required (min 5 characters).' });
    }

    // Check confirmation matching if provided
    if (confirm_account_number && String(confirm_account_number).trim() !== String(account_number).trim()) {
      return res.status(400).json({ success: false, message: 'Confirmation account number does not match.' });
    }

    const cleanHolder = String(account_holder_name).trim();
    const cleanBank = String(bank_name).trim();
    const cleanAcc = String(account_number).trim();
    const cleanType = String(account_type).trim() || 'Savings';
    const cleanRouting = String(routing_number).trim();
    const cleanBranch = String(branch_name).trim();
    const cleanBranchCode = String(branch_code).trim();
    const cleanSwift = String(swift_code).trim();
    const cleanCurrency = String(currency).trim().toUpperCase() || 'USD';

    const upsertSql = `
      INSERT INTO employee_bank_details (
        employee_id, account_holder_name, bank_name, account_number,
        account_type, routing_number, branch_name, branch_code, swift_code,
        currency, verification_status, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending', NOW()
      )
      ON CONFLICT (employee_id) DO UPDATE SET
        account_holder_name = EXCLUDED.account_holder_name,
        bank_name = EXCLUDED.bank_name,
        account_number = EXCLUDED.account_number,
        account_type = EXCLUDED.account_type,
        routing_number = EXCLUDED.routing_number,
        branch_name = EXCLUDED.branch_name,
        branch_code = EXCLUDED.branch_code,
        swift_code = EXCLUDED.swift_code,
        currency = EXCLUDED.currency,
        verification_status = 'Pending',
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await query(upsertSql, [
      employeeId,
      cleanHolder,
      cleanBank,
      cleanAcc,
      cleanType,
      cleanRouting,
      cleanBranch,
      cleanBranchCode,
      cleanSwift,
      cleanCurrency
    ]);

    // Also sync legacy columns in employees table for backward compatibility
    try {
      await query(
        `UPDATE employees SET bank_name = $1, bank_account = $2, ifsc_code = $3, updated_at = NOW() WHERE id = $4`,
        [cleanBank, cleanAcc, cleanRouting, employeeId]
      );
    } catch (e) {
      // Non-fatal if legacy columns differ
    }

    // Safe Audit Log (never log account numbers)
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data)
         VALUES ($1, 'BANK_DETAILS_UPDATED', 'employee_bank_details', $2, '{"message": "Employee bank details updated"}'::jsonb)`,
        [employeeId, result.rows[0].id]
      );
    } catch (logErr) {
      console.error('Audit log write error:', logErr.message);
    }

    const raw = result.rows[0];
    const masked = {
      ...raw,
      account_number: maskAccountNumber(raw.account_number),
      account_number_masked: maskAccountNumber(raw.account_number),
      routing_number_masked: maskRoutingNumber(raw.routing_number)
    };

    return res.json({
      success: true,
      message: 'Bank details saved successfully and submitted for verification.',
      bank_details: masked
    });
  } catch (error) {
    console.error('Error saving bank details:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to save bank details' });
  }
};

/**
 * GET /api/payroll/employees/:employeeId/bank-details
 * Retrieve employee's bank details for HR Payroll processing
 */
const getEmployeeBankDetails = async (req, res) => {
  try {
    const targetEmployeeId = req.params.employeeId || req.params.id;
    const requesterRole = req.user?.role;
    const requesterId = req.user?.id;

    // RBAC: Only HR, Admin, CEO or the Employee themselves can view
    const isAuthorized = ['admin', 'hr', 'ceo'].includes(requesterRole) || requesterId === targetEmployeeId;
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied to employee bank details.' });
    }

    const result = await query(
      `SELECT b.id, b.employee_id, b.account_holder_name, b.bank_name, b.account_number,
              b.account_type, b.routing_number, b.branch_name, b.branch_code, b.swift_code,
              b.currency, b.is_primary, b.verification_status, b.verification_notes,
              b.verified_at, b.created_at, b.updated_at,
              e.first_name, e.last_name, e.email, e.position
       FROM employee_bank_details b
       JOIN employees e ON b.employee_id = e.id
       WHERE b.employee_id = $1`,
      [targetEmployeeId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        has_bank_details: false,
        bank_details: null,
        readiness: 'missing',
        message: 'No bank details on file for this employee.'
      });
    }

    const raw = result.rows[0];
    const masked = {
      ...raw,
      account_number: maskAccountNumber(raw.account_number),
      account_number_masked: maskAccountNumber(raw.account_number),
      routing_number_masked: maskRoutingNumber(raw.routing_number)
    };

    const readiness = raw.verification_status === 'Verified' ? 'ready' : (raw.verification_status === 'Pending' ? 'pending' : 'rejected');

    return res.json({
      success: true,
      has_bank_details: true,
      bank_details: masked,
      readiness
    });
  } catch (error) {
    console.error('Error fetching employee bank details for HR:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee bank details' });
  }
};

/**
 * PUT /api/payroll/employees/:employeeId/bank-details/verify
 * HR verification action (Verify / Reject with notes)
 */
const verifyBankDetails = async (req, res) => {
  try {
    const targetEmployeeId = req.params.employeeId || req.params.id;
    const requesterRole = req.user?.role;
    const requesterId = req.user?.id;

    // RBAC: Only HR and Admin can verify/reject bank details
    if (!['admin', 'hr'].includes(requesterRole)) {
      return res.status(403).json({ success: false, message: 'Only HR and Admin can verify bank details.' });
    }

    const { status, notes = '' } = req.body;
    if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Verified, Rejected, or Pending.' });
    }

    const result = await query(
      `UPDATE employee_bank_details
       SET verification_status = $1,
           verification_notes = $2,
           verified_by = $3,
           verified_at = NOW(),
           updated_at = NOW()
       WHERE employee_id = $4
       RETURNING *;`,
      [status, String(notes).trim(), requesterId, targetEmployeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee bank details record not found.' });
    }

    // Safe Audit Log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data)
         VALUES ($1, 'BANK_DETAILS_VERIFIED', 'employee_bank_details', $2, $3::jsonb)`,
        [requesterId, result.rows[0].id, JSON.stringify({ status, target_employee_id: targetEmployeeId })]
      );
    } catch (logErr) {
      console.error('Verification audit log write error:', logErr.message);
    }

    const raw = result.rows[0];
    const masked = {
      ...raw,
      account_number: maskAccountNumber(raw.account_number),
      account_number_masked: maskAccountNumber(raw.account_number),
      routing_number_masked: maskRoutingNumber(raw.routing_number)
    };

    return res.json({
      success: true,
      message: `Bank details status updated to ${status}.`,
      bank_details: masked
    });
  } catch (error) {
    console.error('Error verifying bank details:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to verify bank details' });
  }
};

module.exports = {
  getMyBankDetails,
  updateMyBankDetails,
  getEmployeeBankDetails,
  verifyBankDetails,
  maskAccountNumber,
  maskRoutingNumber
};
