const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/shows', require('./routes/shows'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', async (req, res) => {
  const schema = process.env.DB_NAME || 'ticket_booking_system';
  try {
    await db.query('SELECT 1');
    const [routines] = await db.query(
      "SELECT ROUTINE_TYPE AS type, COUNT(*) AS cnt FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? GROUP BY ROUTINE_TYPE",
      [schema]
    );
    const [triggers] = await db.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ?",
      [schema]
    );
    const procCount = routines.find(r => r.type === 'PROCEDURE')?.cnt || 0;
    const funcCount = routines.find(r => r.type === 'FUNCTION')?.cnt || 0;
    const trigCount = triggers[0]?.cnt || 0;
    res.json({
      status: 'OK',
      message: 'Ticket Booking API is running',
      database: { connected: true, schema },
      routines: { procedures: procCount, functions: funcCount },
      triggers: trigCount
    });
  } catch (e) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      database: { connected: false, schema, error: e.message }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
 
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('DB connection OK');
  } catch (e) {
    console.error('DB connection FAILED:', e.message);
  }
})();




