const { query } = require('../config/database');

// Action Center: Get all pending actionable items for the logged-in employee
const getActionCenterItems = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, title, description, category, priority, deadline, action_link, status, created_at
      FROM action_items
      WHERE employee_id = $1
      ORDER BY 
        CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        deadline ASC NULLS LAST
    `, [req.user.id]);

    const items = result.rows;
    const pendingCount = items.filter(i => i.status === 'pending').length;

    res.json({
      items,
      pendingCount,
      completedCount: items.length - pendingCount
    });
  } catch (err) {
    console.error('Action Center error:', err);
    res.status(500).json({ message: 'Server error retrieving action items' });
  }
};

// Complete an action item
const completeActionItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      UPDATE action_items
      SET status = 'completed', completed_at = NOW()
      WHERE id = $1 AND employee_id = $2
      RETURNING *
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Action item not found or unauthorized' });
    }

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error('Complete action error:', err);
    res.status(500).json({ message: 'Server error completing action item' });
  }
};

// Policies: List with acknowledgement status for the current employee
const getPoliciesWithAcknowledgement = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.*,
        CASE WHEN pa.id IS NOT NULL THEN true ELSE false END as is_acknowledged,
        pa.acknowledged_at,
        pa.signature_data
      FROM policy_documents p
      LEFT JOIN policy_acknowledgements pa 
        ON p.id = pa.policy_id AND pa.employee_id = $1
      WHERE p.status = 'published'
      ORDER BY p.title ASC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get policies error:', err);
    res.status(500).json({ message: 'Server error fetching policies' });
  }
};

// Acknowledge / E-Sign a policy
const acknowledgePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { signature } = req.body;

    await query(`
      INSERT INTO policy_acknowledgements (policy_id, employee_id, signature_data, ip_address)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (policy_id, employee_id) DO UPDATE
      SET acknowledged_at = NOW(), signature_data = $3, ip_address = $4
    `, [policyId, req.user.id, signature || `Confirmed by ${req.user.email}`, req.ip || '127.0.0.1']);

    // Mark corresponding action item as completed if present
    await query(`
      UPDATE action_items
      SET status = 'completed', completed_at = NOW()
      WHERE employee_id = $1 AND category = 'policy' AND status = 'pending'
    `, [req.user.id]);

    res.json({ success: true, message: 'Policy acknowledged and electronically confirmed.' });
  } catch (err) {
    console.error('Acknowledge policy error:', err);
    res.status(500).json({ message: 'Server error acknowledging policy' });
  }
};

module.exports = {
  getActionCenterItems,
  completeActionItem,
  getPoliciesWithAcknowledgement,
  acknowledgePolicy
};
