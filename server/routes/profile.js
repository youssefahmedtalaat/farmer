import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create profile if it doesn't exist (shouldn't happen due to trigger, but just in case)
      const userResult = await pool.query(
        'SELECT email, full_name, farm_name FROM users WHERE id = ?',
        [req.user.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userResult.rows[0];
      await pool.query(
        'INSERT INTO profiles (id, full_name, email, farm_name) VALUES (?, ?, ?, ?)',
        [req.user.id, user.full_name || '', user.email, user.farm_name || '']
      );
      
      // Fetch the newly created profile
      const newResult = await pool.query(
        'SELECT * FROM profiles WHERE id = ?',
        [req.user.id]
      );
      
      if (newResult.rows.length === 0) {
        return res.status(500).json({ error: 'Failed to create profile' });
      }
      
      const profile = newResult.rows[0];
      
      const profileResponse = {
        fullName: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        farmName: profile.farm_name || '',
        farmSize: profile.farm_size || '',
        location: profile.location || '',
        address: profile.address || '',
        bio: profile.bio || '',
        profileImage: profile.profile_image || '',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
      
      return res.json({ profile: profileResponse });
    }

    const profile = result.rows[0];

    // Map database fields to API response format
    const profileResponse = {
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone || '',
      farmName: profile.farm_name || '',
      farmSize: profile.farm_size || '',
      location: profile.location || '',
      address: profile.address || '',
      bio: profile.bio || '',
      profileImage: profile.profile_image || '',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    res.json({ profile: profileResponse });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;

    // Map API fields to database fields
    const dbUpdates = {};
    const allowedFields = {
      fullName: 'full_name',
      email: 'email',
      phone: 'phone',
      farmName: 'farm_name',
      farmSize: 'farm_size',
      location: 'location',
      address: 'address',
      bio: 'bio',
      profileImage: 'profile_image',
    };

    Object.keys(updates).forEach((key) => {
      if (allowedFields[key]) {
        dbUpdates[allowedFields[key]] = updates[key];
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
    values.push(req.user.id);

    await pool.query(
      `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Fetch the updated profile (MySQL doesn't support RETURNING)
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const updatedProfile = result.rows[0];

    // Map back to API format
    const profileResponse = {
      fullName: updatedProfile.full_name,
      email: updatedProfile.email,
      phone: updatedProfile.phone || '',
      farmName: updatedProfile.farm_name || '',
      farmSize: updatedProfile.farm_size || '',
      location: updatedProfile.location || '',
      address: updatedProfile.address || '',
      bio: updatedProfile.bio || '',
      profileImage: updatedProfile.profile_image || '',
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at,
    };

    res.json({ success: true, profile: profileResponse });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
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

    // Get all users with their profiles (excluding admins)
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.full_name,
        u.farm_name,
        u.role,
        u.created_at,
        p.profile_image
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.role = 'farmer'
      ORDER BY u.created_at DESC`
    );

    const users = result.rows.map((user) => ({
      id: user.id,
      email: user.email || '',
      fullName: user.full_name || '',
      farmName: user.farm_name || '',
      profileImage: user.profile_image || '',
      createdAt: user.created_at,
    }));

    res.json({ users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;




