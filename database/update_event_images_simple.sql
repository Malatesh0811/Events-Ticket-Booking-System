-- Update Event Images Script (Simple Version)
-- This script updates all existing events with proper image URLs
-- Run this if you already have events in your database
-- 
-- Note: If you get safe update mode errors, either:
-- 1. Run: SET SQL_SAFE_UPDATES = 0; before running this script
-- 2. Or use the update_event_images.sql version with subqueries

USE ticket_booking_system;

-- Temporarily disable safe update mode for this session
SET SQL_SAFE_UPDATES = 0;

-- Update Avengers: Endgame
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=450&fit=crop'
WHERE event_name = 'Avengers: Endgame';

-- Update Taylor Swift Concert
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'
WHERE event_name = 'Taylor Swift Concert';

-- Update IPL Cricket Match
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=450&fit=crop'
WHERE event_name = 'IPL Cricket Match';

-- Update Russell Peters Standup
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop'
WHERE event_name = 'Russell Peters Standup';

-- Update Hamilton Musical
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop'
WHERE event_name = 'Hamilton Musical';

-- Update The Dark Knight
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop'
WHERE event_name = 'The Dark Knight';

-- Update Coldplay Concert
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'
WHERE event_name = 'Coldplay Concert';

-- Update FIFA World Cup Screening
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop'
WHERE event_name = 'FIFA World Cup Screening';

-- Update any events that don't have images yet with a default placeholder
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=450&fit=crop'
WHERE image_url IS NULL OR image_url = '' OR image_url LIKE 'https://example.com%';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;


