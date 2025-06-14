const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, is_verified, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all server locations
router.get('/server-locations', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM server_locations ORDER BY name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get server locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add server location
router.post('/server-locations', [
  body('name').trim().isLength({ min: 2 }),
  body('region_code').trim().isLength({ min: 2, max: 10 }),
  body('ip_address').isIP()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, region_code, ip_address } = req.body;

    // Check if region code already exists
    const existing = await pool.query(
      'SELECT id FROM server_locations WHERE region_code = $1',
      [region_code]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Region code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO server_locations (name, region_code, ip_address) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, region_code, ip_address]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Add server location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get content pages
router.get('/content', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM content_pages ORDER BY type, lang'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM admin_settings ORDER BY created_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({ google_client_id: null });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update settings
router.post('/settings', [
  body('google_client_id').optional().trim()
], async (req, res) => {
  try {
    const { google_client_id } = req.body;

    // Check if settings exist
    const existing = await pool.query('SELECT id FROM admin_settings LIMIT 1');

    if (existing.rows.length === 0) {
      // Create new settings
      await pool.query(
        'INSERT INTO admin_settings (google_client_id) VALUES ($1)',
        [google_client_id]
      );
    } else {
      // Update existing settings
      await pool.query(
        'UPDATE admin_settings SET google_client_id = $1 WHERE id = $2',
        [google_client_id, existing.rows[0].id]
      );
    }

    res.json({ message: 'Settings updated successfully' });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;