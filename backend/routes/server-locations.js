const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all server locations
router.get('/', async (req, res) => {
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

module.exports = router;