-- Quick Data Insert for Ticket Booking System
-- Run this if sample_data.sql didn't work or you need fresh data

USE ticket_booking_system;

-- Clear existing data (optional - only if you want fresh start)
-- DELETE FROM booking_seats;
-- DELETE FROM bookings;
-- DELETE FROM reviews;
-- DELETE FROM shows;
-- DELETE FROM events WHERE event_id > 7;
-- DELETE FROM seats WHERE seat_id > 550;

-- Insert Events if they don't exist
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url, is_active)
SELECT * FROM (
    SELECT 'Avengers: Endgame' as event_name, 1 as category_id, 'The epic conclusion to the Infinity Saga' as description, 
           180 as duration_minutes, '2024-01-15' as release_date, 'English' as language, 
           'https://via.placeholder.com/400x600/667eea/ffffff?text=Avengers' as image_url, TRUE as is_active
    UNION ALL
    SELECT 'Taylor Swift Concert', 2, 'The Eras Tour - Live performance', 180, '2024-02-20', 'English', 
           'https://via.placeholder.com/400x600/f39c12/ffffff?text=Taylor+Swift', TRUE
    UNION ALL
    SELECT 'IPL Cricket Match', 3, 'Mumbai Indians vs Chennai Super Kings', 240, '2024-03-10', 'Hindi/English', 
           'https://via.placeholder.com/400x600/27ae60/ffffff?text=IPL', TRUE
    UNION ALL
    SELECT 'Russell Peters Standup', 4, 'Almost Famous World Tour', 90, '2024-02-25', 'English', 
           'https://via.placeholder.com/400x600/9b59b6/ffffff?text=Comedy', TRUE
    UNION ALL
    SELECT 'Hamilton Musical', 5, 'Award-winning Broadway musical', 165, '2024-03-05', 'English', 
           'https://via.placeholder.com/400x600/e74c3c/ffffff?text=Hamilton', TRUE
    UNION ALL
    SELECT 'The Dark Knight', 1, 'Re-release of the classic Batman film', 152, '2024-01-20', 'English', 
           'https://via.placeholder.com/400x600/34495e/ffffff?text=Dark+Knight', TRUE
    UNION ALL
    SELECT 'Coldplay Concert', 2, 'Music of the Spheres World Tour', 150, '2024-03-15', 'English', 
           'https://via.placeholder.com/400x600/3498db/ffffff?text=Coldplay', TRUE
    UNION ALL
    SELECT 'FIFA World Cup Screening', 3, 'Live screening of championship match', 120, '2024-03-20', 'Multiple', 
           'https://via.placeholder.com/400x600/e67e22/ffffff?text=FIFA', TRUE
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM events WHERE events.event_name = tmp.event_name)
LIMIT 8;

-- Insert Shows with future dates
INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats)
SELECT * FROM (
    SELECT 1 as event_id, 1 as venue_id, DATE_ADD(CURDATE(), INTERVAL 7 DAY) as show_date, '10:00:00' as show_time, 250.00 as base_price, 280 as available_seats, 300 as total_seats
    UNION ALL SELECT 1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '14:00:00', 300.00, 290, 300
    UNION ALL SELECT 1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00:00', 350.00, 250, 300
    UNION ALL SELECT 2, 5, DATE_ADD(CURDATE(), INTERVAL 14 DAY), '19:00:00', 5000.00, 1800, 2000
    UNION ALL SELECT 3, 3, DATE_ADD(CURDATE(), INTERVAL 21 DAY), '19:30:00', 2000.00, 4800, 5000
    UNION ALL SELECT 4, 4, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '20:00:00', 1500.00, 180, 200
    UNION ALL SELECT 5, 5, DATE_ADD(CURDATE(), INTERVAL 12 DAY), '19:00:00', 3000.00, 1900, 2000
    UNION ALL SELECT 6, 2, DATE_ADD(CURDATE(), INTERVAL 8 DAY), '15:00:00', 200.00, 240, 250
    UNION ALL SELECT 6, 2, DATE_ADD(CURDATE(), INTERVAL 8 DAY), '18:00:00', 250.00, 245, 250
    UNION ALL SELECT 7, 5, DATE_ADD(CURDATE(), INTERVAL 15 DAY), '20:00:00', 4000.00, 1950, 2000
    UNION ALL SELECT 8, 3, DATE_ADD(CURDATE(), INTERVAL 22 DAY), '18:00:00', 1500.00, 4900, 5000
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM shows 
    WHERE shows.event_id = tmp.event_id 
    AND shows.venue_id = tmp.venue_id 
    AND shows.show_date = tmp.show_date 
    AND shows.show_time = tmp.show_time
);

-- Verify data
SELECT 'Events' as table_name, COUNT(*) as count FROM events
UNION ALL
SELECT 'Shows', COUNT(*) FROM shows
UNION ALL
SELECT 'Categories', COUNT(*) FROM event_categories
UNION ALL
SELECT 'Venues', COUNT(*) FROM venues
UNION ALL
SELECT 'Seats', COUNT(*) FROM seats;



