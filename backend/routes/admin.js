const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DEFAULT_POSTER_URL = 'https://placehold.co/800x450?text=Event+Poster';

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [dailyRevenue] = await db.execute('SELECT * FROM daily_revenue LIMIT 7');
    const [categoryStats] = await db.execute('SELECT * FROM category_statistics');
    const [venuePerformance] = await db.execute('SELECT * FROM venue_performance');
    const [popularEvents] = await db.execute('SELECT * FROM popular_events LIMIT 10');

    // Get total statistics
    const [totalStats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM events) as total_events,
        (SELECT COUNT(*) FROM bookings WHERE booking_status = 'confirmed') as total_bookings,
        (SELECT SUM(total_amount) FROM bookings WHERE booking_status = 'confirmed') as total_revenue
    `);

    res.json({
      dailyRevenue,
      categoryStats,
      venuePerformance,
      popularEvents,
      totals: totalStats[0]
    });

// Ensure booking history log table and triggers exist (for recent activity)
router.post('/maintenance/ensure-triggers', async (req, res) => {
  try {
    // Create booking_history_log table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS booking_history_log (
        log_id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT,
        action VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
      )
    `);

    // Drop and recreate triggers with a single AFTER UPDATE trigger compatible with older MySQL
    const drop = (name) => db.query(`DROP TRIGGER IF EXISTS ${name}`).catch(() => {});
    await drop('after_booking_confirmed');
    await drop('after_booking_status_change');
    await drop('booking_status_changed_log');
    await drop('payment_status_changed_log');
    await drop('booking_update_log');

    // Single trigger inserting up to 3 rows via UNION ALL, zero rows when conditions false
    await db.query(`
      CREATE TRIGGER booking_update_log
      AFTER UPDATE ON bookings
      FOR EACH ROW
      INSERT INTO booking_history_log (booking_id, action, timestamp)
      (
        SELECT NEW.booking_id, 'confirmed', NOW()
        FROM DUAL
        WHERE NEW.booking_status = 'confirmed' AND (OLD.booking_status IS NULL OR OLD.booking_status <> 'confirmed')
        UNION ALL
        SELECT NEW.booking_id, CONCAT('status_changed_', NEW.booking_status), NOW()
        FROM DUAL
        WHERE (OLD.booking_status IS NULL OR NEW.booking_status <> OLD.booking_status)
        UNION ALL
        SELECT NEW.booking_id, CONCAT('payment_', NEW.payment_status), NOW()
        FROM DUAL
        WHERE (OLD.payment_status IS NULL OR NEW.payment_status <> OLD.payment_status)
      );
    `);

    res.json({ message: 'Triggers ensured' });
  } catch (error) {
    console.error('Ensure triggers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure every event has a poster and at least one future show
router.post('/maintenance/ensure-posters-and-shows', async (req, res) => {
  try {
    // 1) Backfill posters where missing/blank
    const [posterResult] = await db.execute(
      `UPDATE events 
       SET image_url = ? 
       WHERE image_url IS NULL OR TRIM(image_url) = ''`,
      [DEFAULT_POSTER_URL]
    );

    // 2) Create one default show for any active event that lacks a future show
    const [venues] = await db.execute('SELECT venue_id, capacity FROM venues ORDER BY capacity DESC LIMIT 1');
    if (venues.length === 0) {
      return res.status(400).json({ error: 'No venues available to create shows' });
    }
    const defaultVenue = venues[0];

    const [events] = await db.execute(
      `SELECT e.event_id
       FROM events e
       WHERE e.is_active = TRUE AND NOT EXISTS (
         SELECT 1 FROM shows s
         WHERE s.event_id = e.event_id AND CONCAT(s.show_date, ' ', s.show_time) >= NOW()
       )`
    );

    let created = 0;
    if (events.length > 0) {
      const basePrice = 300.0;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const show_date = `${yyyy}-${mm}-${dd}`;
      const show_time = '19:00:00';

      for (const ev of events) {
        const [capRows] = await db.execute('SELECT capacity FROM venues WHERE venue_id = ?', [defaultVenue.venue_id]);
        const cap = capRows[0]?.capacity || 0;
        await db.execute(
          `INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [ev.event_id, defaultVenue.venue_id, show_date, show_time, basePrice, cap, cap]
        );
        created++;
      }
    }

    res.json({ message: 'Posters backfilled and shows ensured', postersUpdated: posterResult.affectedRows, showsCreated: created, defaultVenue: defaultVenue.venue_id });
  } catch (error) {
    console.error('Ensure posters and shows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate a more diverse schedule per category (venues, times, prices)
router.post('/maintenance/generate-diverse-schedule', async (req, res) => {
  try {
    // Per-category preferences
    const categoryPrefs = {
      'Movie': {
        venuesByName: ['PVR Cinemas', 'Inox Theater'],
        times: ['10:00:00', '14:00:00', '18:00:00', '21:00:00'],
        basePrice: [180, 400],
        offsets: [3, 7, 10]
      },
      'Concert': {
        venuesByName: ['Concert Hall', 'Sports Arena'],
        times: ['18:00:00', '20:00:00'],
        basePrice: [2000, 6000],
        offsets: [7, 14, 21]
      },
      'Sports': {
        venuesByName: ['Sports Arena'],
        times: ['16:00:00', '19:30:00'],
        basePrice: [800, 3000],
        offsets: [7, 14, 21]
      },
      'Standup Comedy': {
        venuesByName: ['Comedy Club', 'PVR Cinemas'],
        times: ['19:00:00', '21:30:00'],
        basePrice: [400, 1200],
        offsets: [5, 12]
      },
      'Theater': {
        venuesByName: ['Concert Hall', 'Inox Theater'],
        times: ['17:00:00', '20:00:00'],
        basePrice: [700, 2200],
        offsets: [6, 13]
      },
      'Workshop': {
        venuesByName: ['Inox Theater', 'Comedy Club'],
        times: ['11:00:00', '15:00:00'],
        basePrice: [200, 800],
        offsets: [4, 9]
      }
    };

    // Load venues once
    const [venues] = await db.execute('SELECT venue_id, venue_name, capacity FROM venues');
    const venueByName = new Map(venues.map(v => [v.venue_name, v]));

    // Get all active events with category
    const [events] = await db.execute(`
      SELECT e.event_id, e.category_id, ec.category_name
      FROM events e
      JOIN event_categories ec ON e.category_id = ec.category_id
      WHERE e.is_active = TRUE
    `);

    let created = 0;
    const today = new Date();
    // helper to random base price within range
    const randInRange = (min, max) => {
      const val = min + Math.random() * (max - min);
      return Math.round(val / 10) * 10; // round to nearest 10
    };

    for (const ev of events) {
      const pref = categoryPrefs[ev.category_name] || {
        venuesByName: venues.map(v => v.venue_name),
        times: ['18:00:00'],
        basePrice: [250, 500],
        offsets: [7]
      };

      // resolve venues
      const prefVenues = pref.venuesByName
        .map(name => venueByName.get(name))
        .filter(Boolean);
      if (prefVenues.length === 0) continue;

      const baseMin = pref.basePrice[0];
      const baseMax = pref.basePrice[1];

      for (const v of prefVenues) {
        for (const offset of pref.offsets) {
          const date = new Date(today);
          date.setDate(today.getDate() + Number(offset));
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const show_date = `${yyyy}-${mm}-${dd}`;

          for (const t of pref.times) {
            // skip if already exists
            const [exists] = await db.execute(
              'SELECT 1 FROM shows WHERE event_id = ? AND venue_id = ? AND show_date = ? AND show_time = ? LIMIT 1',
              [ev.event_id, v.venue_id, show_date, t]
            );
            if (exists.length > 0) continue;

            const price = randInRange(baseMin, baseMax);
            try {
              await db.execute(
                `INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [ev.event_id, v.venue_id, show_date, t, price, v.capacity, v.capacity]
              );
              created++;
            } catch (e) {
              console.error('Insert diverse show failed', { event: ev.event_id, venue: v.venue_id, show_date, t }, e);
            }
          }
        }
      }
    }

    res.json({ message: 'Diverse schedule generated', created });
  } catch (error) {
    console.error('Generate diverse schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rebuild database views (useful if views are missing columns)
router.post('/maintenance/fix-views', async (req, res) => {
  try {
    const exec = (sql) => db.execute(sql).catch(err => { throw err; });

    // Drop existing views if any
    await exec('DROP VIEW IF EXISTS event_summary');
    await exec('DROP VIEW IF EXISTS show_details');
    await exec('DROP VIEW IF EXISTS user_booking_history');
    await exec('DROP VIEW IF EXISTS venue_performance');
    await exec('DROP VIEW IF EXISTS category_statistics');
    await exec('DROP VIEW IF EXISTS daily_revenue');
    await exec('DROP VIEW IF EXISTS popular_events');

    // Recreate views (aligned with database/fix_views.sql)
    await exec(`CREATE VIEW event_summary AS
      SELECT 
        e.event_id,
        e.event_name,
        ec.category_id,
        ec.category_name,
        e.description,
        e.duration_minutes,
        e.release_date,
        e.language,
        e.rating,
        e.image_url,
        e.is_active,
        COUNT(DISTINCT s.show_id) as total_shows,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed_bookings,
        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as total_revenue
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN shows s ON e.event_id = s.event_id
      LEFT JOIN bookings b ON s.show_id = b.show_id
      GROUP BY e.event_id, e.event_name, ec.category_id, ec.category_name, e.description, 
               e.duration_minutes, e.release_date, e.language, e.rating, e.image_url, e.is_active`);

    await exec(`CREATE VIEW show_details AS
      SELECT 
        s.show_id,
        s.event_id,
        e.event_name,
        ec.category_id,
        ec.category_name,
        v.venue_id,
        v.venue_name,
        v.city,
        v.address,
        s.show_date,
        s.show_time,
        s.base_price,
        s.available_seats,
        s.total_seats,
        ROUND((s.total_seats - s.available_seats) * 100.0 / s.total_seats, 2) as occupancy_percentage,
        CONCAT(s.show_date, ' ', s.show_time) as show_datetime
      FROM shows s
      JOIN events e ON s.event_id = e.event_id
      JOIN event_categories ec ON e.category_id = ec.category_id
      JOIN venues v ON s.venue_id = v.venue_id
      ORDER BY s.show_date, s.show_time`);

    await exec(`CREATE VIEW user_booking_history AS
      SELECT 
        b.booking_id,
        u.user_id,
        u.full_name,
        u.email,
        e.event_name,
        ec.category_name,
        v.venue_name,
        v.city,
        s.show_date,
        s.show_time,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        COUNT(bs.seat_id) as number_of_seats,
        GROUP_CONCAT(CONCAT(seats.\`row_number\`, seats.seat_number) ORDER BY seats.seat_id SEPARATOR ', ') as seat_numbers
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN shows s ON b.show_id = s.show_id
      JOIN events e ON s.event_id = e.event_id
      JOIN event_categories ec ON e.category_id = ec.category_id
      JOIN venues v ON s.venue_id = v.venue_id
      LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
      LEFT JOIN seats ON bs.seat_id = seats.seat_id
      GROUP BY b.booking_id, u.user_id, u.full_name, u.email, e.event_name, ec.category_name, 
               v.venue_name, v.city, s.show_date, s.show_time, b.booking_date, 
               b.total_amount, b.booking_status, b.payment_status`);

    await exec(`CREATE VIEW venue_performance AS
      SELECT 
        v.venue_id,
        v.venue_name,
        v.city,
        v.capacity,
        COUNT(DISTINCT s.show_id) as total_shows,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed_bookings,
        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as total_revenue,
        ROUND(AVG(CASE WHEN b.booking_status = 'confirmed' THEN 
            (s.total_seats - s.available_seats) * 100.0 / s.total_seats 
            ELSE NULL END), 2) as avg_occupancy_rate
      FROM venues v
      LEFT JOIN shows s ON v.venue_id = s.venue_id
      LEFT JOIN bookings b ON s.show_id = b.show_id
      GROUP BY v.venue_id, v.venue_name, v.city, v.capacity`);

    await exec(`CREATE VIEW category_statistics AS
      SELECT 
        ec.category_id,
        ec.category_name,
        COUNT(DISTINCT e.event_id) as total_events,
        COUNT(DISTINCT s.show_id) as total_shows,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as total_revenue,
        ROUND(AVG(e.rating), 2) as avg_rating
      FROM event_categories ec
      LEFT JOIN events e ON ec.category_id = e.category_id
      LEFT JOIN shows s ON e.event_id = s.event_id
      LEFT JOIN bookings b ON s.show_id = b.show_id
      GROUP BY ec.category_id, ec.category_name`);

    await exec(`CREATE VIEW daily_revenue AS
      SELECT 
        DATE(b.booking_date) as booking_date,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COUNT(DISTINCT b.user_id) as unique_customers,
        SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount ELSE 0 END) as revenue,
        SUM(CASE WHEN b.booking_status = 'confirmed' THEN 
            (SELECT COUNT(*) FROM booking_seats WHERE booking_id = b.booking_id) 
            ELSE 0 END) as tickets_sold
      FROM bookings b
      WHERE b.booking_status = 'confirmed'
      GROUP BY DATE(b.booking_date)
      ORDER BY booking_date DESC`);

    await exec(`CREATE VIEW popular_events AS
      SELECT 
        e.event_id,
        e.event_name,
        ec.category_name,
        e.rating,
        COUNT(DISTINCT b.booking_id) as booking_count,
        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as revenue
      FROM events e
      JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN shows s ON e.event_id = s.event_id
      LEFT JOIN bookings b ON s.show_id = b.show_id
      WHERE e.is_active = TRUE
      GROUP BY e.event_id, e.event_name, ec.category_name, e.rating
      HAVING booking_count > 0 OR e.rating IS NOT NULL
      ORDER BY booking_count DESC, e.rating DESC
      LIMIT 20`);

    res.json({ message: 'Views rebuilt successfully' });
  } catch (error) {
    console.error('Fix views error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure multiple future shows for each active event across multiple venues
router.post('/maintenance/ensure-shows-multi', async (req, res) => {
  try {
    // Optional body: { venuesLimit, daysOffsets, times, basePrice }
    const venuesLimit = Math.max(1, Math.min(parseInt(req.body?.venuesLimit || '3', 10), 10));
    const basePrice = parseFloat(req.body?.basePrice ?? 300.0) || 300.0;
    // default schedule: 1 and 2 weeks out, at 18:00 and 21:00
    const defaultOffsets = [7, 14];
    const defaultTimes = ['18:00:00', '21:00:00'];
    const daysOffsets = Array.isArray(req.body?.daysOffsets) && req.body.daysOffsets.length > 0 ? req.body.daysOffsets.map(Number) : defaultOffsets;
    const times = Array.isArray(req.body?.times) && req.body.times.length > 0 ? req.body.times : defaultTimes;

    // Some MySQL setups don't support binding LIMIT. Fetch all and slice in JS.
    const [allVenues] = await db.execute('SELECT venue_id, capacity FROM venues ORDER BY capacity DESC');
    const venues = allVenues.slice(0, venuesLimit);
    if (venues.length === 0) {
      return res.status(400).json({ error: 'No venues available to create shows' });
    }

    const [events] = await db.execute(
      `SELECT e.event_id
       FROM events e
       WHERE e.is_active = TRUE`
    );

    let created = 0;
    const today = new Date();
    for (const ev of events) {
      for (const v of venues) {
        for (const offset of daysOffsets) {
          const date = new Date(today);
          date.setDate(today.getDate() + Number(offset));
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const show_date = `${yyyy}-${mm}-${dd}`;
          for (const t of times) {
            // avoid duplicates
            const [exists] = await db.execute(
              `SELECT 1 FROM shows WHERE event_id = ? AND venue_id = ? AND show_date = ? AND show_time = ? LIMIT 1`,
              [ev.event_id, v.venue_id, show_date, t]
            );
            if (exists.length > 0) continue;
            await db.execute(
              `INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [ev.event_id, v.venue_id, show_date, t, basePrice, v.capacity, v.capacity]
            );
            created++;
          }
        }
      }
    }

    res.json({ message: 'Multi-venue shows ensured', created, venuesUsed: venues.map(v => v.venue_id) });
  } catch (error) {
    console.error('Ensure multi shows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent booking activity logs (from triggers)
router.get('/logs', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit || '25', 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 25;
    if (limit > 200) limit = 200;
    const sql = `SELECT 
         l.log_id,
         l.booking_id,
         l.action,
         l.timestamp,
         b.user_id,
         b.booking_status,
         b.payment_status,
         b.total_amount,
         e.event_name,
         u.full_name as user_name
       FROM booking_history_log l
       JOIN bookings b ON l.booking_id = b.booking_id
       JOIN shows s ON b.show_id = s.show_id
       JOIN events e ON s.event_id = e.event_id
       JOIN users u ON b.user_id = u.user_id
       ORDER BY l.timestamp DESC
       LIMIT ${limit}`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure seats exist for all venues up to capacity
router.post('/maintenance/ensure-seats', async (req, res) => {
  try {
    const [venues] = await db.execute(
      `SELECT v.venue_id, v.capacity,
              (SELECT COUNT(*) FROM seats s WHERE s.venue_id = v.venue_id) AS seat_count
       FROM venues v`
    );

    let totalAdded = 0;
    for (const v of venues) {
      if (v.seat_count >= v.capacity) continue;

      const toAdd = v.capacity - v.seat_count;
      // generate rows with 20 seats per row (A..Z...)
      const perRow = 20;
      // We will insert seats incrementally from current count+1 to capacity
      // Determine starting row and seat number from existing count
      let startIndex = v.seat_count; // 0-based

      // Build values array
      const values = [];
      for (let i = 0; i < toAdd; i++) {
        const idx = startIndex + i; // 0-based across venue
        const seatNumber = (idx % perRow) + 1;
        const rowIndex = Math.floor(idx / perRow);
        const rowLetter = String.fromCharCode(65 + (rowIndex % 26));
        // simple tiering: front/back regular, middle premium/vip
        let seat_type = 'regular';
        if (rowIndex >= 5 && rowIndex < 10) seat_type = 'premium';
        if (rowIndex >= 10) seat_type = 'vip';
        let price_multiplier = 1.0;
        if (seat_type === 'premium') price_multiplier = 1.5;
        if (seat_type === 'vip') price_multiplier = 2.0;
        values.push([v.venue_id, seatNumber, rowLetter, seat_type, price_multiplier]);
      }

      if (values.length > 0) {
        // Insert in chunks to avoid packet/placeholder limits and ignore duplicates
        const chunkSize = 500;
        for (let i = 0; i < values.length; i += chunkSize) {
          const chunk = values.slice(i, i + chunkSize);
          const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(',');
          const flat = chunk.flat();
          try {
            await db.execute(
              `INSERT IGNORE INTO seats (venue_id, seat_number, \`row_number\`, seat_type, price_multiplier)
               VALUES ${placeholders}`,
              flat
            );
            totalAdded += chunk.length;
          } catch (e) {
            console.error('Seat insert chunk failed for venue', v.venue_id, e);
          }
        }
      }
    }

    res.json({ message: 'Seats ensured', added: totalAdded });
  } catch (error) {
    console.error('Ensure seats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure each active event has at least one future show
router.post('/maintenance/ensure-shows', async (req, res) => {
  try {
    // Pick a default venue (first by total capacity desc to maximize seats)
    const [venues] = await db.execute('SELECT venue_id, capacity FROM venues ORDER BY capacity DESC LIMIT 1');
    if (venues.length === 0) {
      return res.status(400).json({ error: 'No venues available to create shows' });
    }
    const defaultVenue = venues[0];

    // Find active events without any future shows
    const [events] = await db.execute(
      `SELECT e.event_id
       FROM events e
       WHERE e.is_active = TRUE AND NOT EXISTS (
         SELECT 1 FROM shows s
         WHERE s.event_id = e.event_id AND CONCAT(s.show_date, ' ', s.show_time) >= NOW()
       )`
    );

    let created = 0;
    if (events.length > 0) {
      // base price heuristic by category could be added; using 300 default
      const basePrice = 300.0;
      // create show date/time: +7 days at 19:00:00
      const date = new Date();
      date.setDate(date.getDate() + 7);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const show_date = `${yyyy}-${mm}-${dd}`;
      const show_time = '19:00:00';

      for (const ev of events) {
        // fetch capacity for totals
        const [capRows] = await db.execute('SELECT capacity FROM venues WHERE venue_id = ?', [defaultVenue.venue_id]);
        const cap = capRows[0]?.capacity || 0;
        await db.execute(
          `INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [ev.event_id, defaultVenue.venue_id, show_date, show_time, basePrice, cap, cap]
        );
        created++;
      }
    }

    res.json({ message: 'Shows ensured', created, defaultVenue: defaultVenue.venue_id });
  } catch (error) {
    console.error('Ensure shows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create venue
router.post('/venues', async (req, res) => {
  try {
    const { venue_name, address, city, state, pincode, capacity, contact_phone } = req.body;

    if (!venue_name || !address || !city || !capacity) {
      return res.status(400).json({ error: 'Venue name, address, city, and capacity are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO venues (venue_name, address, city, state, pincode, capacity, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [venue_name, address, city, state || null, pincode || null, capacity, contact_phone || null]
    );

    const [newVenue] = await db.execute(
      'SELECT * FROM venues WHERE venue_id = ?',
      [result.insertId]
    );

    res.status(201).json(newVenue[0]);
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




