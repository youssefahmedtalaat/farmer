import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateUUID } from '../db/uuid_helper.js';

const router = express.Router();

// Get user subscription
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ subscription: null });
    }

    const subscription = result.rows[0];

    // Map to API format
    const subscriptionResponse = {
      userId: subscription.user_id,
      planId: subscription.plan_id,
      planName: subscription.plan_name,
      price: parseFloat(subscription.price),
      duration: subscription.duration,
      status: subscription.status,
      trialEndsAt: subscription.trial_ends_at,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    };

    res.json({ subscription: subscriptionResponse });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Get all subscriptions (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all subscriptions with user info and profile image
    const result = await pool.query(
      `SELECT 
        s.*,
        u.email,
        u.full_name,
        u.farm_name,
        p.profile_image
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN profiles p ON s.user_id = p.id
      ORDER BY s.created_at DESC`
    );

    const subscriptions = result.rows.map((sub) => ({
      id: sub.id,
      userId: sub.user_id,
      email: sub.email || '',
      fullName: sub.full_name || '',
      farmName: sub.farm_name || '',
      profileImage: sub.profile_image || '',
      planId: sub.plan_id,
      planName: sub.plan_name,
      price: parseFloat(sub.price),
      duration: sub.duration,
      status: sub.status,
      trialEndsAt: sub.trial_ends_at,
      startDate: sub.start_date,
      endDate: sub.end_date,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    }));

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Create/Update subscription after payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { planId, planName, price, duration } = req.body;

    if (!planId || !planName) {
      return res.status(400).json({ error: 'Plan details are required' });
    }

    // Check for existing subscription
    const existingSubscription = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    const now = new Date();
    // For free trials, start immediately. For paid plans, start after 7-day trial period
    const isFreeTrial = planId === 'trial' || price === 0;
    const startDate = isFreeTrial 
      ? now 
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial for paid plans
    let endDate = new Date(startDate);

    // Calculate end date based on plan
    if (duration === '2 weeks') {
      endDate.setDate(endDate.getDate() + 14);
    } else if (duration === '1 month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (duration === '6 months') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (duration === '1 year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscriptionId = existingSubscription.rows.length > 0 
      ? existingSubscription.rows[0].id 
      : generateUUID();
    
    const subscriptionData = {
      id: subscriptionId,
      user_id: req.user.id,
      plan_id: planId,
      plan_name: planName,
      price: price || 0,
      duration: duration,
      status: isFreeTrial ? 'trial' : (existingSubscription.rows.length > 0 ? 'active' : 'trial'),
      trial_ends_at: isFreeTrial ? endDate.toISOString() : (existingSubscription.rows.length > 0 ? null : startDate.toISOString()),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    // Upsert subscription (MySQL uses ON DUPLICATE KEY UPDATE)
    await pool.query(
      `INSERT INTO subscriptions (id, user_id, plan_id, plan_name, price, duration, status, trial_ends_at, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         plan_id = VALUES(plan_id),
         plan_name = VALUES(plan_name),
         price = VALUES(price),
         duration = VALUES(duration),
         status = VALUES(status),
         trial_ends_at = VALUES(trial_ends_at),
         start_date = VALUES(start_date),
         end_date = VALUES(end_date),
         updated_at = NOW()`,
      [
        subscriptionData.id,
        subscriptionData.user_id,
        subscriptionData.plan_id,
        subscriptionData.plan_name,
        subscriptionData.price,
        subscriptionData.duration,
        subscriptionData.status,
        subscriptionData.trial_ends_at,
        subscriptionData.start_date,
        subscriptionData.end_date,
      ]
    );

    // Fetch the subscription (MySQL doesn't support RETURNING)
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    const subscription = result.rows[0];

    // Map to API format
    const subscriptionResponse = {
      userId: subscription.user_id,
      planId: subscription.plan_id,
      planName: subscription.plan_name,
      price: parseFloat(subscription.price),
      duration: subscription.duration,
      status: subscription.status,
      trialEndsAt: subscription.trial_ends_at,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    };

    res.status(201).json({ success: true, subscription: subscriptionResponse });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

export default router;




