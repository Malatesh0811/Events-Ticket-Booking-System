const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { show_id, seat_ids } = req.body;

    if (!show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      return res.status(400).json({ error: 'Show ID and seat IDs are required' });
    }

    const seatIdsString = seat_ids.join(',');

    const [result] = await db.execute(
      'CALL CreateBooking(?, ?, ?, @booking_id, @status, @message)',
      [req.user.userId, show_id, seatIdsString]
    );

    const [output] = await db.execute('SELECT @booking_id as booking_id, @status as status, @message as message');
    
    const { booking_id, status, message } = output[0];

    if (status === 'ERROR') {
      return res.status(400).json({ error: message });
    }

    // Get booking details
    const [bookingDetails] = await db.execute(
      'CALL GetBookingDetails(?, ?)',
      [booking_id, req.user.userId]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingDetails[0][0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.execute(
      'SELECT * FROM user_booking_history WHERE user_id = ? ORDER BY booking_date DESC',
      [req.user.userId]
    );

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.execute(
      'CALL GetBookingDetails(?, ?)',
      [req.params.id, req.user.userId]
    );

    if (!bookings[0] || bookings[0].length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(bookings[0][0]);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm booking (after payment simulation)
router.post('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      'CALL ConfirmBooking(?, @status, @message)',
      [req.params.id]
    );

    const [output] = await db.execute('SELECT @status as status, @message as message');
    const { status, message } = output[0];

    if (status === 'ERROR') {
      return res.status(400).json({ error: message });
    }

    // Get updated booking
    const [bookings] = await db.execute(
      'CALL GetBookingDetails(?, ?)',
      [req.params.id, req.user.userId]
    );

    res.json({
      message: 'Booking confirmed successfully',
      booking: bookings[0][0]
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      'CALL CancelBooking(?, ?, @status, @message)',
      [req.params.id, req.user.userId]
    );

    const [output] = await db.execute('SELECT @status as status, @message as message');
    const { status, message } = output[0];

    if (status === 'ERROR') {
      return res.status(400).json({ error: message });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




