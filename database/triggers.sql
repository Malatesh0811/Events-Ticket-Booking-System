-- Triggers for Ticket Booking System

USE ticket_booking_system;

-- Trigger 1: Update available seats when a booking is confirmed
DELIMITER //
CREATE TRIGGER after_booking_confirmed
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'confirmed' AND OLD.booking_status != 'confirmed' THEN
        -- Seats are already reduced when booking is created, so no change needed here
        -- This trigger can be used for logging or notifications
        INSERT INTO booking_history_log (booking_id, action, timestamp)
        VALUES (NEW.booking_id, 'confirmed', NOW());
    END IF;
END //
DELIMITER ;

-- Create booking_history_log table for trigger
CREATE TABLE IF NOT EXISTS booking_history_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- Trigger 2: Auto-update event rating when a review is added/updated
DELIMITER //
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE events
    SET rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE event_id = NEW.event_id
    )
    WHERE event_id = NEW.event_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE events
    SET rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE event_id = NEW.event_id
    )
    WHERE event_id = NEW.event_id;
END //
DELIMITER ;

-- Trigger 3: Prevent double booking of seats
DELIMITER //
CREATE TRIGGER before_booking_seat_insert
BEFORE INSERT ON booking_seats
FOR EACH ROW
BEGIN
    DECLARE seat_already_booked INT DEFAULT 0;
    
    -- Check if seat is already booked for the same show
    SELECT COUNT(*) INTO seat_already_booked
    FROM booking_seats bs
    JOIN bookings b ON bs.booking_id = b.booking_id
    WHERE bs.seat_id = NEW.seat_id
    AND b.show_id = (SELECT show_id FROM bookings WHERE booking_id = NEW.booking_id)
    AND b.booking_status != 'cancelled';
    
    IF seat_already_booked > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Seat is already booked for this show';
    END IF;
END //
DELIMITER ;

-- Trigger 4: Update show available seats when booking is cancelled
DELIMITER //
CREATE TRIGGER after_booking_cancelled
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_seat_count INT;
    
    IF NEW.booking_status = 'cancelled' AND OLD.booking_status != 'cancelled' THEN
        SELECT COUNT(*) INTO v_seat_count
        FROM booking_seats
        WHERE booking_id = NEW.booking_id;
        
        UPDATE shows
        SET available_seats = available_seats + v_seat_count
        WHERE show_id = NEW.show_id;
    END IF;
END //
DELIMITER ;

-- Trigger 5: Prevent booking past shows
DELIMITER //
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_show_datetime DATETIME;
    
    SELECT CONCAT(show_date, ' ', show_time) INTO v_show_datetime
    FROM shows
    WHERE show_id = NEW.show_id;
    
    IF v_show_datetime < NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot book tickets for past shows';
    END IF;
END //
DELIMITER ;

-- Trigger 6: Log all booking status changes
DELIMITER //
CREATE TRIGGER after_booking_status_change
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status != OLD.booking_status THEN
        INSERT INTO booking_history_log (booking_id, action, timestamp)
        VALUES (NEW.booking_id, CONCAT('status_changed_', NEW.booking_status), NOW());
    END IF;
    
    IF NEW.payment_status != OLD.payment_status THEN
        INSERT INTO booking_history_log (booking_id, action, timestamp)
        VALUES (NEW.booking_id, CONCAT('payment_', NEW.payment_status), NOW());
    END IF;
END //
DELIMITER ;

-- Trigger 7: Auto-cancel pending bookings after 15 minutes (simulated with a manual trigger)
-- Note: In production, this would be handled by a scheduled job
DELIMITER //
CREATE TRIGGER before_booking_confirm_check
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'confirmed' AND OLD.booking_status = 'pending' THEN
        IF TIMESTAMPDIFF(MINUTE, OLD.booking_date, NOW()) > 1 THEN
            SET NEW.booking_status = 'cancelled';
            SET NEW.payment_status = 'refunded';
        END IF;
    END IF;
END //
DELIMITER ;




