const { query } = require('../config/database');

// Assets: My Assets
const getMyAssets = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, asset_id, asset_type, brand_model, serial_number, condition, status, issue_date
      FROM employee_assets
      WHERE assigned_employee_id = $1
      ORDER BY issue_date DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('My assets error:', err);
    res.status(500).json({ message: 'Server error retrieving assets' });
  }
};

// Assets: All Assets (Admin/HR Inventory)
const getAllAssets = async (req, res) => {
  try {
    if (!['admin', 'ceo', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin or HR access required.' });
    }

    const result = await query(`
      SELECT a.*, e.first_name, e.last_name, e.email, e.position
      FROM employee_assets a
      LEFT JOIN employees e ON a.assigned_employee_id = e.id
      ORDER BY a.asset_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('All assets error:', err);
    res.status(500).json({ message: 'Server error retrieving asset inventory' });
  }
};

// Assign Asset (Admin only)
const assignAsset = async (req, res) => {
  try {
    if (!['admin', 'ceo', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin or HR access required.' });
    }

    const { asset_id, asset_type, brand_model, employee_id } = req.body;
    const result = await query(`
      INSERT INTO employee_assets (asset_id, asset_type, brand_model, assigned_employee_id, condition, status, issue_date)
      VALUES ($1, $2, $3, $4, 'Good', 'assigned', CURRENT_DATE)
      ON CONFLICT (asset_id) DO UPDATE
      SET assigned_employee_id = $4, status = 'assigned', updated_at = NOW()
      RETURNING *
    `, [asset_id, asset_type, brand_model, employee_id]);

    res.status(201).json({ success: true, asset: result.rows[0] });
  } catch (err) {
    console.error('Assign asset error:', err);
    res.status(500).json({ message: 'Server error assigning asset' });
  }
};

// Facilities: Get Requests
const getFacilityRequests = async (req, res) => {
  try {
    const isStaff = ['admin', 'ceo', 'hr'].includes(req.user.role);
    let result;
    if (isStaff) {
      result = await query(`
        SELECT f.*, e.first_name, e.last_name, e.email, e.position
        FROM facility_requests f
        JOIN employees e ON f.employee_id = e.id
        ORDER BY f.created_at DESC
      `);
    } else {
      result = await query(`
        SELECT * FROM facility_requests
        WHERE employee_id = $1
        ORDER BY created_at DESC
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Facility requests error:', err);
    res.status(500).json({ message: 'Server error retrieving facility requests' });
  }
};

// Facilities: Create Request
const createFacilityRequest = async (req, res) => {
  try {
    const { category, subject, description, priority, location } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ message: 'Category, subject, and description are required.' });
    }

    const ticketId = `FAC-${Date.now().toString().slice(-6)}`;
    const result = await query(`
      INSERT INTO facility_requests (ticket_id, employee_id, category, subject, description, priority, location, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open')
      RETURNING *
    `, [ticketId, req.user.id, category, subject, description, priority || 'Medium', location || 'Hyderabad Campus']);

    res.status(201).json({ success: true, request: result.rows[0] });
  } catch (err) {
    console.error('Create facility request error:', err);
    res.status(500).json({ message: 'Server error creating facility request' });
  }
};

// CSR & Volunteering: List Events & Register
const getVolunteeringEvents = async (req, res) => {
  try {
    const eventsRes = await query(`SELECT * FROM volunteering_events ORDER BY event_date ASC`);
    let events = eventsRes.rows;

    if (events.length === 0) {
      events = [
        {
          id: 'csr-green-drive',
          title: 'KRAVIX Urban Reforestation & Green Drive',
          cause: 'Environment',
          description: 'Planting 500 indigenous trees in Cyberabad ecological corridor with local youth volunteers.',
          event_date: '2026-09-20',
          location: 'Hyderabad Tech Corridor Eco-Park',
          capacity: 40,
          hours_credited: 4.0,
          status: 'upcoming'
        },
        {
          id: 'csr-tech-literacy',
          title: 'STEM & Digital Skills Workshop for High Schoolers',
          cause: 'Education',
          description: 'Mentoring government high school students on foundational Python programming and internet safety.',
          event_date: '2026-10-05',
          location: 'KRAVIX Campus Learning Lab',
          capacity: 25,
          hours_credited: 5.0,
          status: 'upcoming'
        }
      ];
    }

    const signupsRes = await query(`SELECT event_id, hours_logged, status FROM volunteering_signups WHERE employee_id = $1`, [req.user.id]);
    const signedEventIds = new Set(signupsRes.rows.map(s => s.event_id));

    const enriched = events.map(ev => ({
      ...ev,
      isRegistered: signedEventIds.has(ev.id)
    }));

    res.json(enriched);
  } catch (err) {
    console.error('CSR events error:', err);
    res.status(500).json({ message: 'Server error retrieving CSR events' });
  }
};

const registerForVolunteering = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists in DB or insert baseline
    await query(`
      INSERT INTO volunteering_signups (event_id, employee_id, status)
      VALUES ($1, $2, 'registered')
      ON CONFLICT (event_id, employee_id) DO UPDATE SET status = 'registered'
    `, [eventId, req.user.id]);

    res.json({ success: true, message: 'Successfully registered for volunteering initiative.' });
  } catch (err) {
    console.error('Register CSR error:', err);
    res.status(500).json({ message: 'Server error registering for CSR event' });
  }
};

module.exports = {
  getMyAssets,
  getAllAssets,
  assignAsset,
  getFacilityRequests,
  createFacilityRequest,
  getVolunteeringEvents,
  registerForVolunteering
};
