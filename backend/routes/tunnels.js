const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user tunnels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, sl.name as location_name 
       FROM tunnels t 
       LEFT JOIN server_locations sl ON t.location = sl.region_code 
       WHERE t.user_id = $1 
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tunnels error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create tunnel
router.post('/', authenticateToken, [
  body('subdomain').trim().isLength({ min: 3, max: 50 }).matches(/^[a-z0-9-]+$/),
  body('target_ip').isIP(),
  body('target_port').isInt({ min: 1, max: 65535 }),
  body('location').trim().isLength({ min: 2, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { subdomain, target_ip, target_port, location } = req.body;

    // Check if subdomain is already taken
    const existingTunnel = await pool.query(
      'SELECT id FROM tunnels WHERE subdomain = $1 AND location = $2',
      [subdomain, location]
    );

    if (existingTunnel.rows.length > 0) {
      return res.status(409).json({ 
        message: `Subdomain '${subdomain}' is already taken in ${location}` 
      });
    }

    // Check if location exists
    const locationResult = await pool.query(
      'SELECT id FROM server_locations WHERE region_code = $1',
      [location]
    );

    if (locationResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid server location' });
    }

    // Create tunnel
    const result = await pool.query(
      `INSERT INTO tunnels (user_id, subdomain, target_ip, target_port, location, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') 
       RETURNING *`,
      [req.user.id, subdomain, target_ip, target_port, location]
    );

    const tunnel = result.rows[0];

    // Here you would typically configure the actual tunnel/proxy
    // For now, we'll just return the tunnel data
    
    res.status(201).json({
      ...tunnel,
      tunnel_url: `https://${subdomain}.${location}.${process.env.TUNNEL_BASE_DOMAIN}`
    });

  } catch (error) {
    console.error('Create tunnel error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete tunnel
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tunnel belongs to user
    const tunnel = await pool.query(
      'SELECT * FROM tunnels WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (tunnel.rows.length === 0) {
      return res.status(404).json({ message: 'Tunnel not found' });
    }

    // Delete tunnel
    await pool.query('DELETE FROM tunnels WHERE id = $1', [id]);

    // Here you would typically remove the actual tunnel/proxy configuration

    res.json({ message: 'Tunnel deleted successfully' });

  } catch (error) {
    console.error('Delete tunnel error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tunnel status
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['active', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Check if tunnel belongs to user
    const tunnel = await pool.query(
      'SELECT * FROM tunnels WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (tunnel.rows.length === 0) {
      return res.status(404).json({ message: 'Tunnel not found' });
    }

    // Update status
    const result = await pool.query(
      'UPDATE tunnels SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update tunnel status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;