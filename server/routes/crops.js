import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateUUID } from '../db/uuid_helper.js';

const router = express.Router();

// Helper function to check if user has active subscription for crop management
const checkSubscriptionForCropManagement = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      return { allowed: false, reason: 'No subscription found. Please subscribe to manage crops.' };
    }

    const subscription = result.rows[0];
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;

    // Check if subscription has expired
    if (endDate < now) {
      return { allowed: false, reason: 'Your subscription has expired. Please renew to continue managing crops.' };
    }

    // For trial subscriptions, check if trial period has ended
    if (subscription.status === 'trial' && trialEndsAt && trialEndsAt < now) {
      return { allowed: false, reason: 'Your free trial has ended. Please upgrade to continue managing crops.' };
    }

    // Check if subscription is active or in trial
    if (subscription.status === 'active' || subscription.status === 'trial') {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Your subscription is not active. Please subscribe to manage crops.' };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { allowed: false, reason: 'Error checking subscription status.' };
  }
};

// Get all crops for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM crops WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Map database fields to API response format
    const cropsResponse = result.rows.map((crop) => ({
      id: crop.id,
      name: crop.name,
      quantity: crop.quantity || '0',
      stock: crop.stock || 0,
      status: crop.status || 'Good',
      createdAt: crop.created_at,
      updatedAt: crop.updated_at,
    }));

    res.json({ crops: cropsResponse });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Add a new crop
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check subscription status
    const subscriptionCheck = await checkSubscriptionForCropManagement(req.user.id);
    if (!subscriptionCheck.allowed) {
      return res.status(403).json({ error: subscriptionCheck.reason });
    }

    const { name, quantity, stock, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Crop name is required' });
    }

    // Check for existing crop with same name (case-insensitive)
    const existingCrops = await pool.query(
      'SELECT id, name FROM crops WHERE user_id = ?',
      [req.user.id]
    );

    const duplicate = existingCrops.rows.find(
      (crop) => crop.name?.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      return res.status(400).json({ error: 'A crop with this name already exists' });
    }

    const cropId = generateUUID();
    await pool.query(
      `INSERT INTO crops (id, user_id, name, quantity, stock, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cropId, req.user.id, name, quantity || '0', stock || 0, status || 'Good']
    );

    // Fetch the created crop (MySQL doesn't support RETURNING)
    const result = await pool.query(
      'SELECT * FROM crops WHERE id = ?',
      [cropId]
    );

    const newCrop = result.rows[0];

    // Map to API format
    const cropResponse = {
      id: newCrop.id,
      name: newCrop.name,
      quantity: newCrop.quantity || '0',
      stock: newCrop.stock || 0,
      status: newCrop.status || 'Good',
      createdAt: newCrop.created_at,
      updatedAt: newCrop.updated_at,
    };

    res.status(201).json({ success: true, crop: cropResponse });
  } catch (error) {
    console.error('Error adding crop:', error);
    res.status(500).json({ error: 'Failed to add crop' });
  }
});

// Update a crop
router.put('/:cropId', authenticateToken, async (req, res) => {
  try {
    // Check subscription status
    const subscriptionCheck = await checkSubscriptionForCropManagement(req.user.id);
    if (!subscriptionCheck.allowed) {
      return res.status(403).json({ error: subscriptionCheck.reason });
    }

    const cropId = req.params.cropId;
    const updates = req.body;

    // Verify the crop belongs to the user
    const existingCrop = await pool.query(
      'SELECT id, user_id FROM crops WHERE id = ? AND user_id = ?',
      [cropId, req.user.id]
    );

    if (existingCrop.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or unauthorized' });
    }

    // Prepare updates
    const dbUpdates = {};
    const allowedFields = ['name', 'quantity', 'stock', 'status'];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        dbUpdates[field] = updates[field];
      }
    });

    if (Object.keys(dbUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Build dynamic update query
    const setClause = Object.keys(dbUpdates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(dbUpdates);
    values.push(cropId, req.user.id);

    await pool.query(
      `UPDATE crops SET ${setClause}, updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      values
    );

    // Fetch the updated crop (MySQL doesn't support RETURNING)
    const result = await pool.query(
      'SELECT * FROM crops WHERE id = ? AND user_id = ?',
      [cropId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const updatedCrop = result.rows[0];

    // Map to API format
    const cropResponse = {
      id: updatedCrop.id,
      name: updatedCrop.name,
      quantity: updatedCrop.quantity || '0',
      stock: updatedCrop.stock || 0,
      status: updatedCrop.status || 'Good',
      createdAt: updatedCrop.created_at,
      updatedAt: updatedCrop.updated_at,
    };

    res.json({ success: true, crop: cropResponse });
  } catch (error) {
    console.error('Error updating crop:', error);
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

// Delete a crop
router.delete('/:cropId', authenticateToken, async (req, res) => {
  try {
    // Check subscription status
    const subscriptionCheck = await checkSubscriptionForCropManagement(req.user.id);
    if (!subscriptionCheck.allowed) {
      return res.status(403).json({ error: subscriptionCheck.reason });
    }

    const cropId = req.params.cropId;

    // Verify the crop belongs to the user and delete
    const result = await pool.query(
      'DELETE FROM crops WHERE id = ? AND user_id = ?',
      [cropId, req.user.id]
    );

    if (result.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'Crop not found or unauthorized' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting crop:', error);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

// Delete all crops for a user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    // Check subscription status
    const subscriptionCheck = await checkSubscriptionForCropManagement(req.user.id);
    if (!subscriptionCheck.allowed) {
      return res.status(403).json({ error: subscriptionCheck.reason });
    }

    // Delete all crops belonging to the user
    const result = await pool.query(
      'DELETE FROM crops WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ 
      success: true, 
      message: `Deleted ${result.rows.affectedRows || 0} crops` 
    });
  } catch (error) {
    console.error('Error deleting all crops:', error);
    res.status(500).json({ error: 'Failed to delete all crops' });
  }
});

// Get crops for a specific user (admin only)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const targetUserId = req.params.userId;

    // Get crops for the target user
    const result = await pool.query(
      'SELECT * FROM crops WHERE user_id = ? ORDER BY created_at DESC',
      [targetUserId]
    );

    // Map database fields to API response format
    const cropsResponse = result.rows.map((crop) => ({
      id: crop.id,
      name: crop.name,
      quantity: crop.quantity || '0',
      stock: crop.stock || 0,
      status: crop.status || 'Good',
      createdAt: crop.created_at,
      updatedAt: crop.updated_at,
    }));

    res.json({ crops: cropsResponse });
  } catch (error) {
    console.error('Error fetching user crops:', error);
    res.status(500).json({ error: 'Failed to fetch user crops' });
  }
});

export default router;




