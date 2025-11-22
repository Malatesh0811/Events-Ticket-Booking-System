-- Views for Ticket Booking System

USE ticket_booking_system;

-- View 1: Event Summary with Ratings and Booking Counts
CREATE OR REPLACE VIEW event_summary AS
SELECT 
    e.event_id,
    e.event_name,
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
GROUP BY e.event_id;

-- View 2: Show Details with Availability
CREATE OR REPLACE VIEW show_details AS
SELECT 
    s.show_id,
    e.event_name,
    ec.category_name,
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
WHERE s.show_date >= CURDATE()
ORDER BY s.show_date, s.show_time;

-- View 3: User Booking History
CREATE OR REPLACE VIEW user_booking_history AS
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
    GROUP_CONCAT(CONCAT(seats.`row_number`, seats.seat_number) ORDER BY seats.seat_id SEPARATOR ', ') as seat_numbers
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN shows s ON b.show_id = s.show_id
JOIN events e ON s.event_id = e.event_id
JOIN event_categories ec ON e.category_id = ec.category_id
JOIN venues v ON s.venue_id = v.venue_id
LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
LEFT JOIN seats ON bs.seat_id = seats.seat_id
GROUP BY b.booking_id
ORDER BY b.booking_date DESC;

-- View 4: Venue Performance
CREATE OR REPLACE VIEW venue_performance AS
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
GROUP BY v.venue_id;

-- View 5: Category-wise Statistics
CREATE OR REPLACE VIEW category_statistics AS
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
GROUP BY ec.category_id;

-- View 6: Daily Revenue Report
CREATE OR REPLACE VIEW daily_revenue AS
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
ORDER BY booking_date DESC;

-- View 7: Popular Events (Top rated and booked)
CREATE OR REPLACE VIEW popular_events AS
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
GROUP BY e.event_id
HAVING booking_count > 0 OR e.rating IS NOT NULL
ORDER BY booking_count DESC, e.rating DESC
LIMIT 20;


