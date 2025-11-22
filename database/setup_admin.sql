-- Setup Admin User Script
-- This script creates or updates the admin user with email: admin123@gmail.com and password: password

USE ticket_booking_system;

-- Check if admin user exists and update, or insert if not exists
INSERT INTO users (username, email, password_hash, full_name, phone, role) 
VALUES ('admin', 'admin123@gmail.com', '$2a$10$eQzkMAPmsRoBP2wUuE2ks.yCZ8oxOq8qJucDnMc.vaDKJLyB7Rgca', 'Admin User', '9999999999', 'admin')
ON DUPLICATE KEY UPDATE 
    email = 'admin123@gmail.com',
    password_hash = '$2a$10$eQzkMAPmsRoBP2wUuE2ks.yCZ8oxOq8qJucDnMc.vaDKJLyB7Rgca',
    role = 'admin';

-- Alternative: If the above doesn't work, use this approach:
-- First, delete existing admin if exists
-- DELETE FROM users WHERE email = 'admin123@gmail.com' OR (username = 'admin' AND role = 'admin');

-- Then insert the new admin
-- INSERT INTO users (username, email, password_hash, full_name, phone, role) 
-- VALUES ('admin', 'admin123@gmail.com', '$2a$10$eQzkMAPmsRoBP2wUuE2ks.yCZ8oxOq8qJucDnMc.vaDKJLyB7Rgca', 'Admin User', '9999999999', 'admin');


