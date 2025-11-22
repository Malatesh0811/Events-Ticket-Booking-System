-- Add seats for all venues that don't have seats yet
-- Run this if seats are missing for some venues

USE ticket_booking_system;

-- Check which venues need seats
SELECT venue_id, venue_name, capacity, 
       (SELECT COUNT(*) FROM seats WHERE seats.venue_id = venues.venue_id) as seat_count
FROM venues;

-- Add seats for Venue 3 (Sports Arena - 5000 capacity)
-- We'll add 5000 seats in rows
SET @row = 0;
INSERT INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 3,
    MOD((@row := @row + 1) - 1, 50) + 1,
    CHAR(65 + FLOOR((@row - 1) / 50)),
    CASE 
        WHEN @row <= 1500 OR @row > 4000 THEN 'regular'
        WHEN @row > 1500 AND @row <= 3000 THEN 'premium'
        ELSE 'vip'
    END,
    CASE 
        WHEN @row <= 1500 OR @row > 4000 THEN 1.00
        WHEN @row > 1500 AND @row <= 3000 THEN 1.50
        ELSE 2.00
    END
FROM information_schema.columns c1
CROSS JOIN information_schema.columns c2
CROSS JOIN information_schema.columns c3
LIMIT 5000;

-- Add seats for Venue 4 (Comedy Club - 200 capacity)
SET @row = 0;
INSERT INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 4,
    MOD((@row := @row + 1) - 1, 10) + 1,
    CHAR(65 + FLOOR((@row - 1) / 10)),
    CASE 
        WHEN @row <= 60 OR @row > 140 THEN 'regular'
        WHEN @row > 60 AND @row <= 100 THEN 'premium'
        ELSE 'vip'
    END,
    CASE 
        WHEN @row <= 60 OR @row > 140 THEN 1.00
        WHEN @row > 60 AND @row <= 100 THEN 1.50
        ELSE 2.00
    END
FROM information_schema.columns c1
CROSS JOIN information_schema.columns c2
LIMIT 200;

-- Add seats for Venue 5 (Concert Hall - 2000 capacity)
SET @row = 0;
INSERT INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 5,
    MOD((@row := @row + 1) - 1, 40) + 1,
    CHAR(65 + FLOOR((@row - 1) / 40)),
    CASE 
        WHEN @row <= 600 OR @row > 1600 THEN 'regular'
        WHEN @row > 600 AND @row <= 1200 THEN 'premium'
        ELSE 'vip'
    END,
    CASE 
        WHEN @row <= 600 OR @row > 1600 THEN 1.00
        WHEN @row > 600 AND @row <= 1200 THEN 1.50
        ELSE 2.00
    END
FROM information_schema.columns c1
CROSS JOIN information_schema.columns c2
LIMIT 2000;

-- Verify seats added
SELECT venue_id, COUNT(*) as total_seats FROM seats GROUP BY venue_id;



