const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all shows with filters
router.get('/', async (req, res) => {
  try {
    const { event_id, venue_id, date, city } = req.query;
    let query = 'SELECT * FROM show_details WHERE 1=1';
    const params = [];

    if (event_id) {
      query += ' AND event_id = ?';
      params.push(event_id);
    }

    if (venue_id) {
      query += ' AND venue_id = ?';
      params.push(venue_id);
    }

    if (date) {
      query += ' AND show_date = ?';
      params.push(date);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    query += ' ORDER BY show_date, show_time';

    const [shows] = await db.execute(query, params);
    res.json(shows);
  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single show by ID
router.get('/:id', async (req, res) => {
  try {
    const [shows] = await db.execute(
      'SELECT * FROM show_details WHERE show_id = ?',
      [req.params.id]
    );

    if (shows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(shows[0]);
  } catch (error) {
    console.error('Get show error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available seats for a show
router.get('/:id/seats', async (req, res) => {
  try {
    // First get show details
    const [shows] = await db.execute(
      'SELECT venue_id, base_price FROM shows WHERE show_id = ?',
      [req.params.id]
    );

    if (shows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const { venue_id, base_price } = shows[0];

    // Get all seats for this venue with booking status
    const [seats] = await db.execute(
      `SELECT 
        s.seat_id,
        s.seat_number,
        s.\`row_number\`,
        s.seat_type,
        (s.price_multiplier * ?) as price,
        CASE 
          WHEN bs.booking_id IS NOT NULL AND b.booking_status NOT IN ('cancelled') THEN 'booked'
          ELSE 'available'
        END as seat_status
      FROM seats s
      LEFT JOIN booking_seats bs ON s.seat_id = bs.seat_id
      LEFT JOIN bookings b ON bs.booking_id = b.booking_id AND b.show_id = ?
      WHERE s.venue_id = ? AND s.is_active = TRUE
      ORDER BY s.\`row_number\`, s.seat_number`,
      [base_price, req.params.id, venue_id]
    );

    res.json(seats);
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new show (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { event_id, venue_id, show_date, show_time, base_price } = req.body;

    if (!event_id || !venue_id || !show_date || !show_time || !base_price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get venue capacity
    const [venues] = await db.execute(
      'SELECT capacity FROM venues WHERE venue_id = ?',
      [venue_id]
    );

    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const capacity = venues[0].capacity;

    const [result] = await db.execute(
      `INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event_id, venue_id, show_date, show_time, base_price, capacity, capacity]
    );

    const [newShow] = await db.execute(
      'SELECT * FROM show_details WHERE show_id = ?',
      [result.insertId]
    );

    res.status(201).json(newShow[0]);
  } catch (error) {
    console.error('Create show error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get venues
router.get('/venues/list', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM venues WHERE 1=1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    query += ' ORDER BY venue_name';

    const [venues] = await db.execute(query, params);
    res.json(venues);
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


