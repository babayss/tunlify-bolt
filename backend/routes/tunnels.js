const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user tunnels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: tunnels, error } = await supabase
      .from('tunnels')
      .select(`
        *,
        server_locations!tunnels_location_fkey(name)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get tunnels error:', error);
      return res.status(500).json({ message: 'Failed to fetch tunnels' });
    }

    // Format response
    const formattedTunnels = tunnels.map(tunnel => ({
      ...tunnel,
      location_name: tunnel.server_locations?.name || tunnel.location
    }));

    res.json(formattedTunnels);
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
    const { data: existingTunnel } = await supabase
      .from('tunnels')
      .select('id')
      .eq('subdomain', subdomain)
      .eq('location', location)
      .single();

    if (existingTunnel) {
      return res.status(409).json({ 
        message: `Subdomain '${subdomain}' is already taken in ${location}` 
      });
    }

    // Check if location exists
    const { data: locationData, error: locationError } = await supabase
      .from('server_locations')
      .select('id')
      .eq('region_code', location)
      .single();

    if (locationError || !locationData) {
      return res.status(400).json({ message: 'Invalid server location' });
    }

    // Create tunnel
    const { data: tunnel, error: createError } = await supabase
      .from('tunnels')
      .insert([{
        user_id: req.user.id,
        subdomain,
        target_ip,
        target_port,
        location,
        status: 'active'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Create tunnel error:', createError);
      return res.status(500).json({ message: 'Failed to create tunnel' });
    }

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
    const { data: tunnel, error: findError } = await supabase
      .from('tunnels')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !tunnel) {
      return res.status(404).json({ message: 'Tunnel not found' });
    }

    // Delete tunnel
    const { error: deleteError } = await supabase
      .from('tunnels')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete tunnel error:', deleteError);
      return res.status(500).json({ message: 'Failed to delete tunnel' });
    }

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
    const { data: tunnel, error: findError } = await supabase
      .from('tunnels')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !tunnel) {
      return res.status(404).json({ message: 'Tunnel not found' });
    }

    // Update status
    const { data: updatedTunnel, error: updateError } = await supabase
      .from('tunnels')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update tunnel status error:', updateError);
      return res.status(500).json({ message: 'Failed to update tunnel status' });
    }

    res.json(updatedTunnel);

  } catch (error) {
    console.error('Update tunnel status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;