const fs = require('fs');
const path = require('path');
const { pool, query } = require('../config/database');

async function runUpgrade() {
  console.log('🚀 Starting KRAVIX Comprehensive Portal Upgrade Migration...');
  const sqlPath = path.join(__dirname, 'comprehensive_portal_upgrade.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    // 1. Run DDL migration
    await pool.query(sql);
    console.log('✅ All 20 enterprise tables & indexes created successfully.');

    // 2. Fetch active employees to seed representative data
    const empRes = await query(`SELECT id, email, first_name, last_name, role, department_id FROM employees WHERE status = 'active' LIMIT 10`);
    if (empRes.rows.length === 0) {
      console.log('ℹ️ No active employees found for seeding.');
      process.exit(0);
    }
    const employees = empRes.rows;
    const admin = employees.find(e => e.role === 'admin') || employees[0];
    const emp = employees.find(e => e.role === 'employee') || employees[employees.length - 1];

    console.log(`🌱 Seeding verified baseline data for ${employees.length} employees...`);

    // 2A. Seed Approved Policies & SOPs
    const policies = [
      {
        title: 'KRAVIX Standard Overtime & Compensatory Off Policy',
        category: 'Overtime',
        summary: 'Official procedure for pre-approving and claiming overtime hours and compensatory time off.',
        content: `1. Overtime Eligibility: All non-exempt production and engineering personnel qualify for overtime when working beyond 45 hours in a standard work week.
2. Pre-Approval: All overtime must be requested in advance via the KRAVIX Portal and approved by the Department Lead/Manager.
3. Compensation Rate: Approved overtime is paid at 1.5x regular hourly base or accrued as 1.5x compensatory off days upon employee election.
4. Maximum Limit: Overtime shall not exceed 16 hours in any rolling 7-day window to protect employee wellbeing and safety.`,
        dos_and_donts: {
          dos: ['Submit OT pre-approval at least 24 hours in advance', 'Log actual start and end timestamps in portal attendance', 'Check with manager before weekend work'],
          donts: ['Do not work unapproved overtime without prior lead signoff', 'Do not exceed 16 hours OT per week', 'Do not swap shifts informally without portal update']
        }
      },
      {
        title: 'Comprehensive Attendance, Punctuality & Leave Guidelines',
        category: 'Attendance',
        summary: 'Rules governing daily check-in, shift timings, break logging, and planned vs unplanned leave.',
        content: `1. Core Working Hours: Standard business shifts operate between 09:30 AM to 06:30 PM with mandatory 1-hour lunch & recharge break.
2. Grace Period: A 15-minute grace period is allotted for morning check-in. Any clock-in beyond 09:45 AM must have an attendance correction or manager approval.
3. Activity Codes: Employees must accurately select appropriate production/activity codes (Production, Break, Lunch, Meeting, Coaching, Learning, Wellbeing) to ensure transparent time allocation.
4. Leave Notice: Planned annual/casual leave requires minimum 48 hours notice. Sick leave requires intimation within 2 hours of shift start.`,
        dos_and_donts: {
          dos: ['Clock in promptly via portal dashboard', 'Mark proper activity code when on break or in meeting', 'Submit medical certificate for sick leave exceeding 2 consecutive days'],
          donts: ['Do not proxy clock-in for colleagues', 'Do not stay in break code during production hours', 'Do not take unauthorized leaves during project delivery sprints']
        }
      },
      {
        title: 'Information Security & Data Protection Standard (ISMS-01)',
        category: 'Security',
        summary: 'Mandatory information security practices, clean desk policy, credential safety, and incident reporting.',
        content: `1. Password & 2FA: Passwords must be at least 8 characters with upper, lower, numbers, and special characters. 2FA is mandatory for all portal and VPN access.
2. Device Safety: Company assets must remain encrypted. Never connect unauthorized external drives or public unencrypted Wi-Fi without VPN.
3. Clean Desk Policy: Screen must be locked (Win + L) whenever stepping away. Confidential physical documents must be securely locked.
4. Incident Reporting: Any suspected phishing email, lost badge, or potential security breach must be reported immediately via the Safety & Security Portal.`,
        dos_and_donts: {
          dos: ['Always lock computer when leaving desk', 'Report suspicious emails immediately to IT Security', 'Use password manager provided by IT'],
          donts: ['Never share passwords or 2FA OTP codes with anyone', 'Never write passwords on sticky notes', 'Never download unauthorized third-party executables']
        }
      },
      {
        title: 'Code of Conduct & Professional Workplace Ethics',
        category: 'Code of Conduct',
        summary: 'Values, respectful workplace standards, anti-harassment policy, and grievance reporting.',
        content: `1. Zero Tolerance: KRAVIX strictly upholds zero tolerance for harassment, discrimination, or abusive conduct of any form.
2. Mutual Respect: Professional courtesy, constructive feedback, and inclusive communication are non-negotiable standards across all teams.
3. Conflict Resolution: Employees are encouraged to resolve minor interpersonal frictions collegially or approach HR Relations in strict confidentiality.
4. Whistleblower Protection: Any employee reporting ethical violations in good faith is legally and policy-protected from retaliation.`,
        dos_and_donts: {
          dos: ['Treat all colleagues with dignity and respect', 'Speak up if you witness ethical misconduct', 'Use confidential HR relations channel for grievances'],
          donts: ['Never engage in offensive jokes, derogatory remarks, or slurs', 'Never retaliate against someone raising a concern']
        }
      }
    ];

    for (const p of policies) {
      await query(`
        INSERT INTO policy_documents (title, category, summary, content, dos_and_donts, requires_acknowledgement, created_by)
        VALUES ($1, $2, $3, $4, $5, true, $6)
        ON CONFLICT DO NOTHING
      `, [p.title, p.category, p.summary, p.content, JSON.stringify(p.dos_and_donts), admin.id]);
    }
    console.log('✅ Approved company policies & SOPs seeded.');

    // 2B. Seed Skill Catalog & Employee Skills
    const skills = [
      { name: 'React.js & Modern Frontend Architecture', category: 'Technical' },
      { name: 'Node.js & RESTful API Engineering', category: 'Technical' },
      { name: 'PostgreSQL Database Optimization', category: 'Technical' },
      { name: 'Agile Project & Sprint Management', category: 'Domain' },
      { name: 'Team Coaching & Mentorship', category: 'Leadership' },
      { name: 'Client Communication & Stakeholder Alignment', category: 'Communication' },
      { name: 'Cybersecurity & ISMS Compliance', category: 'Technical' }
    ];

    for (const s of skills) {
      await query(`INSERT INTO skill_catalog (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`, [s.name, s.category]);
    }

    for (const e of employees) {
      await query(`
        INSERT INTO employee_skills (employee_id, skill_name, proficiency_level, years_experience, verified)
        VALUES 
          ($1, 'React.js & Modern Frontend Architecture', 'Advanced', 3.5, true),
          ($1, 'Node.js & RESTful API Engineering', 'Advanced', 3.0, true),
          ($1, 'PostgreSQL Database Optimization', 'Intermediate', 2.0, true),
          ($1, 'Agile Project & Sprint Management', 'Intermediate', 2.5, false)
        ON CONFLICT (employee_id, skill_name) DO NOTHING
      `, [e.id]);
    }
    console.log('✅ Skills catalog and employee skill profiles seeded.');

    // 2C. Seed Monthly Scorecards
    for (const e of employees) {
      for (const m of [6, 7, 8]) {
        await query(`
          INSERT INTO employee_scorecards (employee_id, month, year, productivity_score, quality_score, attendance_rate, overall_rating, improvement_areas, strengths, manager_feedback)
          VALUES ($1, $2, 2026, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (employee_id, month, year) DO NOTHING
        `, [
          e.id, m,
          (92 + (m % 3) * 2.5).toFixed(2),
          (95 + (m % 2) * 2.0).toFixed(2),
          (97 + (m % 2) * 1.5).toFixed(2),
          'Exceeds Expectations',
          JSON.stringify(['Expand knowledge on CI/CD pipelines', 'Cross-team documentation']),
          JSON.stringify(['Rapid defect resolution', 'Consistent delivery quality', 'Great team collaboration']),
          'Rishi consistently demonstrates high operational rigor and technical initiative across sprint objectives.'
        ]);
      }
    }
    console.log('✅ Monthly scorecards (productivity, quality, attendance) seeded.');

    // 2D. Seed Employee Awards & Recognitions
    const awards = [
      { title: 'Top Performer of the Month', category: 'Top Performer', period: 'July 2026', citation: 'Recognized for outstanding delivery in enterprise portal integration.' },
      { title: 'Quarterly Star Performer', category: 'Quarterly Star Performer', period: 'Q2 2026', citation: 'Exceptional client satisfaction and zero-defect deployments.' },
      { title: 'Consistent Performer Award', category: 'Consistent Performer', period: 'June 2026', citation: 'Maintaining 98%+ on-time delivery across all critical work streams.' }
    ];

    for (let i = 0; i < employees.length; i++) {
      const a = awards[i % awards.length];
      await query(`
        INSERT INTO employee_awards (employee_id, award_title, category, period, citation, awarded_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [employees[i].id, a.title, a.category, a.period, a.citation, admin.id]);
    }
    console.log('✅ Rewards & recognitions seeded.');

    // 2E. Seed Employee Assets
    const assetTypes = [
      { type: 'Laptop', model: 'MacBook Pro 16" M3 Max / Dell Latitude 7440', code: 'KVX-LAP' },
      { type: 'Headset', model: 'Jabra Evolve2 65 Wireless', code: 'KVX-AUD' },
      { type: 'Access Card', model: 'RFID Secure NFC SmartCard v2', code: 'KVX-SEC' }
    ];

    for (let i = 0; i < employees.length; i++) {
      const e = employees[i];
      for (let j = 0; j < assetTypes.length; j++) {
        const at = assetTypes[j];
        const assetId = `${at.code}-${String(100 + i * 10 + j).padStart(4, '0')}`;
        await query(`
          INSERT INTO employee_assets (asset_id, asset_type, brand_model, serial_number, assigned_employee_id, condition, status)
          VALUES ($1, $2, $3, $4, $5, 'Good', 'assigned')
          ON CONFLICT (asset_id) DO NOTHING
        `, [assetId, at.type, at.model, `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, e.id]);
      }
    }
    console.log('✅ Employee asset allocations seeded.');

    // 2F. Seed Personal Compensation & Benefits
    for (let i = 0; i < employees.length; i++) {
      const e = employees[i];
      const base = 850000 + (i * 75000);
      await query(`
        INSERT INTO compensation_records (employee_id, base_salary, annual_ctc, last_increment_date, last_increment_percentage, performance_bonus, overtime_rate_per_hour)
        VALUES ($1, $2, $3, '2026-04-01', 12.5, 95000.00, 650.00)
        ON CONFLICT (employee_id) DO NOTHING
      `, [e.id, base, base * 1.25]);
    }
    console.log('✅ Personal compensation and benefits records seeded.');

    // 2G. Seed My Action Center items
    for (const e of employees) {
      await query(`
        INSERT INTO action_items (employee_id, title, description, category, priority, deadline, action_link)
        VALUES 
          ($1, 'Submit Monthly Attendance Confirmation', 'Review and confirm your attendance logs for the current pay cycle.', 'attendance', 'high', NOW() + INTERVAL '3 days', '/employee/attendance'),
          ($1, 'Complete Mandatory ISMS Security Training', 'Annual refresher on data protection and clean desk protocols.', 'training', 'critical', NOW() + INTERVAL '5 days', '/employee/learning'),
          ($1, 'Acknowledge Updated Overtime Policy', 'Please review the updated 2026 Overtime & Compensatory Off guidelines.', 'policy', 'medium', NOW() + INTERVAL '7 days', '/employee/documents')
        ON CONFLICT DO NOTHING
      `, [e.id]);
    }
    console.log('✅ Action center initial items seeded.');

    // 2H. Seed Innovation Ideas
    await query(`
      INSERT INTO innovation_ideas (title, description, category, status, submitter_id, submitter_name, department, upvotes)
      VALUES 
        ('Automated AI Code Quality Guardrails in CI/CD', 'Integrate automated static analysis and security scanning into PR workflows to catch OWASP vulnerabilities early.', 'technology', 'Under Review', $1, 'Rishi Akula', 'Engineering', 14),
        ('Peer Recognition Badging via Enterprise Chat', 'Enable employees to give instant kudos and peer awards directly within team chat channels to boost morale.', 'employee_experience', 'Approved', $1, 'Rishi Akula', 'Engineering', 22),
        ('Smart Meeting Scheduler with Timezone Auto-Alignment', 'Reduce double-bookings and off-hour meeting conflicts with automated slot recommendations.', 'productivity', 'Submitted', $1, 'Rishi Akula', 'Operations', 9)
      ON CONFLICT DO NOTHING
    `, [emp.id]);
    console.log('✅ Innovation ideas seeded.');

    // 2I. Seed Change Management Notice
    await query(`
      INSERT INTO change_notices (title, summary, reason, effective_date, affected_teams)
      VALUES 
        ('Migration to Unified KRAVIX 2FA & Single Portal Architecture', 'Consolidation of legacy standalone CEO and Employee tools into a single, high-security enterprise platform.', 'Streamline employee journey, eliminate redundant logins, and enforce strict RBAC across departments.', CURRENT_DATE, '["Engineering", "HR", "Operations", "Sales"]')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Change management notice seeded.');

    console.log('🎉 Comprehensive database upgrade & seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing upgrade migration:', err);
    process.exit(1);
  }
}

runUpgrade();
