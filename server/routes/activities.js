import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateUUID } from '../db/uuid_helper.js';

const router = express.Router();

// Get user activities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20',
      [req.user.id]
    );

    // Map to API format
    const activitiesResponse = result.rows.map((activity) => ({
      id: activity.id,
      action: activity.action,
      detail: activity.detail || '',
      timestamp: activity.timestamp,
    }));

    res.json({ activities: activitiesResponse });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Log an activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { action, detail } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const activityId = generateUUID();
    await pool.query(
      `INSERT INTO activities (id, user_id, action, detail)
       VALUES (?, ?, ?, ?)`,
      [activityId, req.user.id, action, detail || '']
    );

    // Fetch the created activity (MySQL doesn't support RETURNING)
    const result = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [activityId]
    );

    const activity = result.rows[0];

    // Map to API format
    const activityResponse = {
      id: activity.id,
      action: activity.action,
      detail: activity.detail || '',
      timestamp: activity.timestamp,
    };

    res.status(201).json({ success: true, activity: activityResponse });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

export default router;




