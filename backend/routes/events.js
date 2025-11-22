const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DEFAULT_POSTER_URL = 'https://placehold.co/800x450?text=Event+Poster';

// Get all events with filters
router.get('/', async (req, res) => {
  try {
    const { category_id, search, is_active } = req.query;
    let query = 'SELECT * FROM event_summary WHERE 1=1';
    const params = [];

    if (category_id) {
      query += ' AND category_id = ?';
      params.push(category_id);
    }

    if (search) {
      query += ' AND (event_name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY total_bookings DESC, rating DESC';

    const [events] = await db.execute(query, params);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const [events] = await db.execute(
      'SELECT * FROM event_summary WHERE event_id = ?',
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get reviews for this event
    const [reviews] = await db.execute(
      `SELECT r.*, u.full_name, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.user_id 
       WHERE r.event_id = ? 
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...events[0],
      reviews
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new event (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { event_name, category_id, description, duration_minutes, release_date, language, image_url } = req.body;

    if (!event_name || !category_id) {
      return res.status(400).json({ error: 'Event name and category are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event_name, category_id, description || null, duration_minutes || null, release_date || null, language || null, (image_url && String(image_url).trim()) ? image_url : DEFAULT_POSTER_URL]
    );

    // ensure at least one default future show
    const [venues] = await db.execute('SELECT venue_id, capacity FROM venues ORDER BY capacity DESC LIMIT 1');
    if (venues.length > 0) {
      const venue = venues[0];
      const date = new Date();
      date.setDate(date.getDate() + 7);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const show_date = `${yyyy}-${mm}-${dd}`;
      const show_time = '19:00:00';
      const basePrice = 300.0;
      try {
        await db.execute(
          `INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [result.insertId, venue.venue_id, show_date, show_time, basePrice, venue.capacity, venue.capacity]
        );
      } catch (e) {}
    }

    const [newEvent] = await db.execute(
      'SELECT * FROM event_summary WHERE event_id = ?',
      [result.insertId]
    );

    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { event_name, category_id, description, duration_minutes, release_date, language, image_url, is_active } = req.body;

    const [result] = await db.execute(
      `UPDATE events 
       SET event_name = ?, category_id = ?, description = ?, duration_minutes = ?, 
           release_date = ?, language = ?, image_url = ?, is_active = ?
       WHERE event_id = ?`,
      [event_name, category_id, description, duration_minutes, release_date, language, (image_url && String(image_url).trim()) ? image_url : DEFAULT_POSTER_URL, is_active, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const [updatedEvent] = await db.execute(
      'SELECT * FROM event_summary WHERE event_id = ?',
      [req.params.id]
    );

    res.json(updatedEvent[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get event categories
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM event_categories ORDER BY category_name');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




