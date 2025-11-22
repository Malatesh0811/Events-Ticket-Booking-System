-- Ticket Booking System Database Schema
-- Supports multiple event types: Movies, Concerts, Sports, Standup Comedy, etc.

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS ticket_booking_system;
CREATE DATABASE ticket_booking_system;
USE ticket_booking_system;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Event Categories Table
CREATE TABLE event_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues/Theaters Table
CREATE TABLE venues (
    venue_id INT PRIMARY KEY AUTO_INCREMENT,
    venue_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    pincode VARCHAR(10),
    capacity INT NOT NULL,
    contact_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table (Movies, Concerts, Sports, Comedy, etc.)
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_name VARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    duration_minutes INT,
    release_date DATE,
    language VARCHAR(50),
    rating DECIMAL(2,1),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES event_categories(category_id) ON DELETE RESTRICT
);

-- Shows Table (Specific showtimes for events at venues)
CREATE TABLE shows (
    show_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    venue_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    available_seats INT NOT NULL,
    total_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_show (event_id, venue_id, show_date, show_time)
);

-- Seat Layout for Venues
CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    venue_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    `row_number` VARCHAR(5) NOT NULL,
    seat_type ENUM('regular', 'premium', 'vip') DEFAULT 'regular',
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (venue_id, seat_number, `row_number`)
);

-- Bookings Table
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    show_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE RESTRICT
);

-- Booking Seats Table (Many-to-Many relationship)
CREATE TABLE booking_seats (
    booking_seat_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_booking_seat (booking_id, seat_id)
);

-- Reviews Table
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_event_review (user_id, event_id)
);

-- Insert Default Data
INSERT INTO event_categories (category_name, description) VALUES
('Movie', 'Cinema and film screenings'),
('Concert', 'Live music performances'),
('Sports', 'Sports events and matches'),
('Standup Comedy', 'Comedy shows and standup performances'),
('Theater', 'Drama and theatrical performances'),
('Workshop', 'Educational and training workshops'),
('Festival', 'Cultural and music festivals');

-- Insert Sample Venues
INSERT INTO venues (venue_name, address, city, state, pincode, capacity, contact_phone) VALUES
('PVR Cinemas', '123 Mall Road', 'Mumbai', 'Maharashtra', '400001', 300, '9876543210'),
('Inox Theater', '456 Entertainment Hub', 'Delhi', 'Delhi', '110001', 250, '9876543211'),
('Sports Arena', '789 Stadium Road', 'Bangalore', 'Karnataka', '560001', 5000, '9876543212'),
('Comedy Club', '321 Laugh Street', 'Pune', 'Maharashtra', '411001', 200, '9876543213'),
('Concert Hall', '654 Music Avenue', 'Chennai', 'Tamil Nadu', '600001', 2000, '9876543214');


