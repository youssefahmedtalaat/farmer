import jwt from 'jsonwebtoken';
import pool from '../db/connection.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const result = await pool.query('SELECT id, email, full_name FROM users WHERE id = ?', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    req.user = {
      id: decoded.userId,
      email: result.rows[0].email,
      fullName: result.rows[0].full_name,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized - Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




