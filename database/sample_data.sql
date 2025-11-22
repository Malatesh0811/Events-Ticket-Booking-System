-- Sample Data for Ticket Booking System

USE ticket_booking_system;

-- Insert Sample Users
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('admin', 'admin123@gmail.com', '$2a$10$eQzkMAPmsRoBP2wUuE2ks.yCZ8oxOq8qJucDnMc.vaDKJLyB7Rgca', 'Admin User', '9999999999', 'admin'),
('john_doe', 'john@example.com', '$2b$10$rOzJqH7dGJY7V7v5zK8qZe8qJ5qK8qZe8qJ5qK8qZe8qJ5qK8qZe8', 'John Doe', '9876543210', 'customer'),
('jane_smith', 'jane@example.com', '$2b$10$rOzJqH7dGJY7V7v5zK8qZe8qJ5qK8qZe8qJ5qK8qZe8qJ5qK8qZe8', 'Jane Smith', '9876543211', 'customer'),
('alice_wonder', 'alice@example.com', '$2b$10$rOzJqH7dGJY7V7v5zK8qZe8qJ5qK8qZe8qJ5qK8qZe8qJ5qK8qZe8', 'Alice Wonder', '9876543212', 'customer');

-- Insert Sample Events
-- Category 1: Movie
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url) VALUES
('Avengers: Endgame', 1, 'The epic conclusion to the Infinity Saga', 180, '2024-01-15', 'English', 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=450&fit=crop'),
('The Dark Knight', 1, 'Re-release of the classic Batman film', 152, '2024-01-20', 'English', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop'),
('Inception', 1, 'Mind-bending sci-fi thriller', 148, '2024-02-10', 'English', 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=450&fit=crop'),
('Dune: Part Two', 1, 'Epic science fiction adventure', 166, '2024-02-25', 'English', 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=450&fit=crop');

-- Category 2: Concert
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url) VALUES
('Taylor Swift Concert', 2, 'The Eras Tour - Live performance', 180, '2024-02-20', 'English', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'),
('Coldplay Concert', 2, 'Music of the Spheres World Tour', 150, '2024-03-15', 'English', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'),
('Ed Sheeran Live', 2, 'Mathematics Tour - Acoustic performance', 120, '2024-03-25', 'English', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'),
('Arijit Singh Concert', 2, 'Soulful melodies and romantic hits', 180, '2024-04-05', 'Hindi', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop');

-- Category 3: Sports
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url) VALUES
('IPL Cricket Match', 3, 'Mumbai Indians vs Chennai Super Kings', 240, '2024-03-10', 'Hindi/English', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=450&fit=crop'),
('FIFA World Cup Screening', 3, 'Live screening of championship match', 120, '2024-03-20', 'Multiple', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop'),
('Premier League Live', 3, 'Manchester United vs Liverpool - Live screening', 105, '2024-04-01', 'English', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=450&fit=crop'),
('NBA Finals Screening', 3, 'Championship game live viewing', 150, '2024-04-15', 'English', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop');

-- Category 4: Standup Comedy
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url) VALUES
('Russell Peters Standup', 4, 'Almost Famous World Tour', 90, '2024-02-25', 'English', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop'),
('Trevor Noah Live', 4, 'Back to Abnormal Tour', 90, '2024-03-12', 'English', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop'),
('Vir Das Standup', 4, 'Inside Out - Comedy special', 75, '2024-03-28', 'Hindi/English', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop'),
('Hasan Minhaj Show', 4, 'The King\'s Jester Tour', 90, '2024-04-10', 'English', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop');

-- Category 5: Theater
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url) VALUES
('Hamilton Musical', 5, 'Award-winning Broadway musical', 165, '2024-03-05', 'English', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop'),
('The Lion King', 5, 'Disney\'s spectacular stage adaptation', 150, '2024-03-18', 'English', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop'),
('Romeo and Juliet', 5, 'Shakespeare\'s timeless tragedy', 120, '2024-04-02', 'English', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop'),
('Wicked', 5, 'The untold story of the witches of Oz', 165, '2024-04-20', 'English', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop');

-- Category 7: Festival (excluding Workshop - category 6)
INSERT INTO events (event_name, category_id, description, duration_minutes, release_date, language, image_url) VALUES
('Coachella Music Festival', 7, 'World\'s most famous music and arts festival', 480, '2024-04-12', 'Multiple', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'),
('Sunburn Festival', 7, 'Asia\'s biggest electronic music festival', 360, '2024-04-25', 'English', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'),
('Diwali Festival Celebration', 7, 'Traditional Indian festival with music and dance', 240, '2024-11-01', 'Hindi/English', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=450&fit=crop'),
('Holi Festival', 7, 'Colorful spring festival with live performances', 180, '2024-03-25', 'Hindi/English', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=450&fit=crop');

-- Insert Shows for Events (Using future dates)
-- Note: Event IDs are assigned in order of insertion above
-- Movies (1-4), Concerts (5-8), Sports (9-12), Comedy (13-16), Theater (17-20), Festivals (21-24)

INSERT INTO shows (event_id, venue_id, show_date, show_time, base_price, available_seats, total_seats) VALUES
-- Movies: Avengers (1), Dark Knight (2), Inception (3), Dune (4)
(1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '10:00:00', 250.00, 280, 300),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '14:00:00', 300.00, 290, 300),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00:00', 350.00, 250, 300),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 8 DAY), '15:00:00', 200.00, 240, 250),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 8 DAY), '18:00:00', 250.00, 245, 250),
(3, 1, DATE_ADD(CURDATE(), INTERVAL 9 DAY), '12:00:00', 280.00, 275, 300),
(3, 1, DATE_ADD(CURDATE(), INTERVAL 9 DAY), '20:00:00', 320.00, 270, 300),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '14:00:00', 300.00, 245, 250),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '19:00:00', 350.00, 240, 250),

-- Concerts: Taylor Swift (5), Coldplay (6), Ed Sheeran (7), Arijit Singh (8)
(5, 5, DATE_ADD(CURDATE(), INTERVAL 14 DAY), '19:00:00', 5000.00, 1800, 2000),
(6, 5, DATE_ADD(CURDATE(), INTERVAL 15 DAY), '19:30:00', 4500.00, 1850, 2000),
(7, 5, DATE_ADD(CURDATE(), INTERVAL 16 DAY), '20:00:00', 4000.00, 1900, 2000),
(8, 5, DATE_ADD(CURDATE(), INTERVAL 17 DAY), '19:00:00', 3500.00, 1950, 2000),

-- Sports: IPL (9), FIFA (10), Premier League (11), NBA (12)
(9, 3, DATE_ADD(CURDATE(), INTERVAL 21 DAY), '19:30:00', 2000.00, 4800, 5000),
(10, 3, DATE_ADD(CURDATE(), INTERVAL 22 DAY), '18:00:00', 1500.00, 4900, 5000),
(11, 3, DATE_ADD(CURDATE(), INTERVAL 23 DAY), '20:00:00', 1800.00, 4850, 5000),
(12, 3, DATE_ADD(CURDATE(), INTERVAL 24 DAY), '19:00:00', 2200.00, 4750, 5000),

-- Comedy: Russell Peters (13), Trevor Noah (14), Vir Das (15), Hasan Minhaj (16)
(13, 4, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '20:00:00', 1500.00, 180, 200),
(14, 4, DATE_ADD(CURDATE(), INTERVAL 11 DAY), '20:30:00', 1800.00, 175, 200),
(15, 4, DATE_ADD(CURDATE(), INTERVAL 12 DAY), '19:30:00', 1200.00, 190, 200),
(16, 4, DATE_ADD(CURDATE(), INTERVAL 13 DAY), '21:00:00', 1600.00, 185, 200),

-- Theater: Hamilton (17), Lion King (18), Romeo and Juliet (19), Wicked (20)
(17, 5, DATE_ADD(CURDATE(), INTERVAL 12 DAY), '19:00:00', 3000.00, 1900, 2000),
(18, 5, DATE_ADD(CURDATE(), INTERVAL 13 DAY), '18:30:00', 2800.00, 1920, 2000),
(19, 5, DATE_ADD(CURDATE(), INTERVAL 14 DAY), '19:30:00', 2500.00, 1950, 2000),
(20, 5, DATE_ADD(CURDATE(), INTERVAL 15 DAY), '20:00:00', 3200.00, 1880, 2000),

-- Festivals: Coachella (21), Sunburn (22), Diwali (23), Holi (24)
(21, 3, DATE_ADD(CURDATE(), INTERVAL 18 DAY), '14:00:00', 6000.00, 4500, 5000),
(22, 3, DATE_ADD(CURDATE(), INTERVAL 19 DAY), '16:00:00', 5000.00, 4600, 5000),
(23, 3, DATE_ADD(CURDATE(), INTERVAL 20 DAY), '18:00:00', 3000.00, 4800, 5000),
(24, 3, DATE_ADD(CURDATE(), INTERVAL 21 DAY), '17:00:00', 2500.00, 4900, 5000);

-- Insert Seats for Venues
-- For PVR (300 seats) - Simplified approach
SET @row = 0;
INSERT INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 1, 
    MOD((@row := @row + 1) - 1, 15) + 1,
    CHAR(65 + FLOOR((@row - 1) / 15)),
    CASE 
        WHEN @row <= 90 OR @row > 240 THEN 'regular'
        WHEN @row > 90 AND @row <= 180 THEN 'premium'
        ELSE 'vip'
    END,
    CASE 
        WHEN @row <= 90 OR @row > 240 THEN 1.00
        WHEN @row > 90 AND @row <= 180 THEN 1.50
        ELSE 2.00
    END
FROM information_schema.columns c1
CROSS JOIN information_schema.columns c2
LIMIT 300;

-- For Inox (250 seats) - Simplified approach
SET @row = 0;
INSERT INTO seats (venue_id, seat_number, `row_number`, seat_type, price_multiplier)
SELECT 2, 
    MOD((@row := @row + 1) - 1, 12) + 1,
    CHAR(65 + FLOOR((@row - 1) / 12)),
    CASE 
        WHEN @row <= 75 OR @row > 175 THEN 'regular'
        WHEN @row > 75 AND @row <= 125 THEN 'premium'
        ELSE 'vip'
    END,
    CASE 
        WHEN @row <= 75 OR @row > 175 THEN 1.00
        WHEN @row > 75 AND @row <= 125 THEN 1.50
        ELSE 2.00
    END
FROM information_schema.columns c1
CROSS JOIN information_schema.columns c2
LIMIT 250;

-- Sample Reviews
INSERT INTO reviews (event_id, user_id, rating, review_text) VALUES
(1, 2, 5, 'Amazing movie! Must watch!'),
(1, 3, 4, 'Great conclusion to the series'),
(4, 2, 5, 'Hilarious performance by Russell Peters'),
(5, 3, 5, 'Best musical I have ever seen!');

