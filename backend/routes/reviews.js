const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { event_id, rating, review_text } = req.body;

    if (!event_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Event ID and rating (1-5) are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO reviews (event_id, user_id, rating, review_text)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, review_text = ?`,
      [event_id, req.user.userId, rating, review_text || null, rating, review_text || null]
    );

    const [newReview] = await db.execute(
      `SELECT r.*, u.full_name, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.user_id 
       WHERE r.review_id = ?`,
      [result.insertId || (await db.execute('SELECT review_id FROM reviews WHERE event_id = ? AND user_id = ?', [event_id, req.user.userId]))[0][0].review_id]
    );

    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for an event
router.get('/event/:event_id', async (req, res) => {
  try {
    const [reviews] = await db.execute(
      `SELECT r.*, u.full_name, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.user_id 
       WHERE r.event_id = ? 
       ORDER BY r.created_at DESC`,
      [req.params.event_id]
    );

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // If admin, allow deleting any review; otherwise ensure the review belongs to the user
    const isAdmin = req.user && req.user.role === 'admin';
    const [reviews] = isAdmin
      ? await db.execute('SELECT * FROM reviews WHERE review_id = ?', [req.params.id])
      : await db.execute('SELECT * FROM reviews WHERE review_id = ? AND user_id = ?', [req.params.id, req.user.userId]);

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    await db.execute('DELETE FROM reviews WHERE review_id = ?', [req.params.id]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


