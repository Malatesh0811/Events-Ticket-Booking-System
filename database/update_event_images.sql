-- Update Event Images Script
-- This script updates all existing events with proper image URLs
-- Run this if you already have events in your database
-- Uses event_id (primary key) to satisfy MySQL safe update mode

USE ticket_booking_system;

-- Update Avengers: Endgame
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'Avengers: Endgame') AS temp);

-- Update Taylor Swift Concert
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'Taylor Swift Concert') AS temp);

-- Update IPL Cricket Match
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'IPL Cricket Match') AS temp);

-- Update Russell Peters Standup
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'Russell Peters Standup') AS temp);

-- Update Hamilton Musical
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'Hamilton Musical') AS temp);

-- Update The Dark Knight
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'The Dark Knight') AS temp);

-- Update Coldplay Concert
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'Coldplay Concert') AS temp);

-- Update FIFA World Cup Screening
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop'
WHERE event_id = (SELECT event_id FROM (SELECT event_id FROM events WHERE event_name = 'FIFA World Cup Screening') AS temp);

-- Update any events that don't have images yet with a default placeholder
-- Using event_id IN subquery to satisfy safe update mode
UPDATE events 
SET image_url = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=450&fit=crop'
WHERE event_id IN (
    SELECT event_id FROM (
        SELECT event_id FROM events 
        WHERE image_url IS NULL OR image_url = '' OR image_url LIKE 'https://example.com%'
    ) AS temp
);

