const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const ALLOW_ADMIN_SETUP = process.env.ALLOW_ADMIN_SETUP === '1' || process.env.ALLOW_ADMIN_SETUP === 'true';
const SETUP_TOKEN = process.env.SETUP_TOKEN;

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const [existingUser] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone || null]
    );

    const token = jwt.sign(
      { userId: result.insertId, username, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        user_id: result.insertId,
        username,
        email,
        full_name,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT user_id, username, email, full_name, phone, role, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// Bootstrap admin (POST): promote an existing user to admin using a setup token
// Body: { email: string, token: string }
router.post('/bootstrap-admin', async (req, res) => {
  try {
    if (!ALLOW_ADMIN_SETUP || !SETUP_TOKEN) {
      return res.status(403).json({ error: 'Admin setup disabled' });
    }
    const { email, username, token } = req.body || {};
    if ((!email && !username) || !token) {
      return res.status(400).json({ error: 'email or username and token are required' });
    }
    if (token !== SETUP_TOKEN) {
      return res.status(401).json({ error: 'Invalid setup token' });
    }
    let users;
    if (email) {
      [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    } else {
      [users] = await db.execute('SELECT user_id FROM users WHERE username = ?', [username]);
    }
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = users[0].user_id;
    await db.execute("UPDATE users SET role = 'admin' WHERE user_id = ?", [userId]);
    res.json({ message: 'User promoted to admin', user_id: userId, email: email || null, username: username || null });
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bootstrap admin (GET) for convenience from a browser: /api/auth/bootstrap-admin?email=...&token=...
router.get('/bootstrap-admin', async (req, res) => {
  try {
    if (!ALLOW_ADMIN_SETUP || !SETUP_TOKEN) {
      return res.status(403).json({ error: 'Admin setup disabled' });
    }
    const { email, username, token } = req.query;
    if ((!email && !username) || !token) {
      return res.status(400).json({ error: 'email or username and token are required' });
    }
    if (token !== SETUP_TOKEN) {
      return res.status(401).json({ error: 'Invalid setup token' });
    }
    let users;
    if (email) {
      [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    } else {
      [users] = await db.execute('SELECT user_id FROM users WHERE username = ?', [username]);
    }
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = users[0].user_id;
    await db.execute("UPDATE users SET role = 'admin' WHERE user_id = ?", [userId]);
    res.json({ message: 'User promoted to admin', user_id: userId, email: email || null, username: username || null });
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




