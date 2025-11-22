-- Database Users and Privileges for Ticket Booking System
-- Demonstrates varied privileges per rubric

USE ticket_booking_system;

-- Drop users if they exist (ignore errors if not present)
DROP USER IF EXISTS 'app_admin'@'localhost';
DROP USER IF EXISTS 'app_user'@'localhost';

-- Create users
CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'Admin@123';
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'User@123';

-- Grant privileges
-- Admin: full access to this schema
GRANT ALL PRIVILEGES ON ticket_booking_system.* TO 'app_admin'@'localhost';

-- App user: limited CRUD on core tables + EXECUTE on procedures + SELECT on views
GRANT SELECT, INSERT, UPDATE ON ticket_booking_system.users TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.event_categories TO 'app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_booking_system.events TO 'app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_booking_system.shows TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.seats TO 'app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON ticket_booking_system.bookings TO 'app_user'@'localhost';
GRANT SELECT, INSERT, DELETE ON ticket_booking_system.booking_seats TO 'app_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_booking_system.reviews TO 'app_user'@'localhost';

-- Views
GRANT SELECT ON ticket_booking_system.event_summary TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.show_details TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.user_booking_history TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.venue_performance TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.category_statistics TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.daily_revenue TO 'app_user'@'localhost';
GRANT SELECT ON ticket_booking_system.popular_events TO 'app_user'@'localhost';

-- Procedures
GRANT EXECUTE ON PROCEDURE ticket_booking_system.CreateBooking TO 'app_user'@'localhost';
GRANT EXECUTE ON PROCEDURE ticket_booking_system.CancelBooking TO 'app_user'@'localhost';
GRANT EXECUTE ON PROCEDURE ticket_booking_system.GetBookingDetails TO 'app_user'@'localhost';
GRANT EXECUTE ON PROCEDURE ticket_booking_system.ConfirmBooking TO 'app_user'@'localhost';
GRANT EXECUTE ON PROCEDURE ticket_booking_system.GetAvailableSeats TO 'app_user'@'localhost';

-- Restrict access to audit log table to admins only (no grant for app_user)
-- booking_history_log will still be queryable via an admin-only API if needed
GRANT SELECT ON ticket_booking_system.booking_history_log TO 'app_admin'@'localhost';

FLUSH PRIVILEGES;
