import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateUUID } from '../db/uuid_helper.js';

const router = express.Router();

// Get user notification preferences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [req.user.id]
    );

    // If no preferences exist, return defaults
    if (result.rows.length === 0) {
      return res.json({
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          stockAlerts: true,
          marketUpdates: true,
          aiRecommendations: true,
        },
      });
    }

    const prefs = result.rows[0];

    // Map database fields to API response format
    const preferencesResponse = {
      emailNotifications: prefs.email_notifications,
      pushNotifications: prefs.push_notifications,
      stockAlerts: prefs.crop_alerts,
      marketUpdates: prefs.market_updates,
      aiRecommendations: prefs.weather_alerts,
    };

    res.json({ preferences: preferencesResponse });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update user notification preferences
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      stockAlerts,
      marketUpdates,
      aiRecommendations,
    } = req.body;

    // Check if preferences exist
    const existingPrefs = await pool.query(
      'SELECT id FROM notification_preferences WHERE user_id = ?',
      [req.user.id]
    );
    
    const prefId = existingPrefs.rows.length > 0 
      ? existingPrefs.rows[0].id 
      : generateUUID();

    // Upsert notification preferences (MySQL uses ON DUPLICATE KEY UPDATE)
    await pool.query(
      `INSERT INTO notification_preferences (id, user_id, email_notifications, push_notifications, crop_alerts, weather_alerts, market_updates)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         email_notifications = VALUES(email_notifications),
         push_notifications = VALUES(push_notifications),
         crop_alerts = VALUES(crop_alerts),
         weather_alerts = VALUES(weather_alerts),
         market_updates = VALUES(market_updates),
         updated_at = NOW()`,
      [
        prefId,
        req.user.id,
        emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications !== undefined ? pushNotifications : true,
        stockAlerts !== undefined ? stockAlerts : true,
        marketUpdates !== undefined ? marketUpdates : true,
        aiRecommendations !== undefined ? aiRecommendations : true,
      ]
    );

    // Fetch the preferences (MySQL doesn't support RETURNING)
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [req.user.id]
    );

    const prefs = result.rows[0];

    // Map to API format
    const preferencesResponse = {
      emailNotifications: prefs.email_notifications,
      pushNotifications: prefs.push_notifications,
      stockAlerts: prefs.crop_alerts,
      marketUpdates: prefs.market_updates,
      aiRecommendations: prefs.weather_alerts,
    };

    res.json({ success: true, preferences: preferencesResponse });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

export default router;


