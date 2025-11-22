-- Simple script to add seats for all venues
USE ticket_booking_system;

-- Add seats for Venue 3 (Sports Arena - 5000 seats, simplified to 100 rows x 50 seats)
SET @row = 0;
INSERT IGNORE INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 3, 
    MOD((@row := @row + 1) - 1, 50) + 1,
    CHAR(65 + FLOOR((@row - 1) / 50)),
    CASE WHEN @row <= 1500 OR @row > 4000 THEN 'regular' WHEN @row > 1500 AND @row <= 3000 THEN 'premium' ELSE 'vip' END,
    CASE WHEN @row <= 1500 OR @row > 4000 THEN 1.00 WHEN @row > 1500 AND @row <= 3000 THEN 1.50 ELSE 2.00 END
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t3
LIMIT 5000;

-- Add seats for Venue 4 (Comedy Club - 200 seats, 20 rows x 10 seats)
SET @row = 0;
INSERT IGNORE INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 4,
    MOD((@row := @row + 1) - 1, 10) + 1,
    CHAR(65 + FLOOR((@row - 1) / 10)),
    CASE WHEN @row <= 60 OR @row > 140 THEN 'regular' WHEN @row > 60 AND @row <= 100 THEN 'premium' ELSE 'vip' END,
    CASE WHEN @row <= 60 OR @row > 140 THEN 1.00 WHEN @row > 60 AND @row <= 100 THEN 1.50 ELSE 2.00 END
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2
LIMIT 200;

-- Add seats for Venue 5 (Concert Hall - 2000 seats, 50 rows x 40 seats)
SET @row = 0;
INSERT IGNORE INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 5,
    MOD((@row := @row + 1) - 1, 40) + 1,
    CHAR(65 + FLOOR((@row - 1) / 40)),
    CASE WHEN @row <= 600 OR @row > 1600 THEN 'regular' WHEN @row > 600 AND @row <= 1200 THEN 'premium' ELSE 'vip' END,
    CASE WHEN @row <= 600 OR @row > 1600 THEN 1.00 WHEN @row > 600 AND @row <= 1200 THEN 1.50 ELSE 2.00 END
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2
CROSS JOIN (SELECT 1 UNION SELECT 2) t3
LIMIT 2000;

-- Check results
SELECT venue_id, COUNT(*) as total_seats FROM seats GROUP BY venue_id;



