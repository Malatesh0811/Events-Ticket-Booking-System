-- Stored Procedures for Ticket Booking System

USE ticket_booking_system;

-- Procedure 1: Create a new booking
DELIMITER //
CREATE PROCEDURE CreateBooking(
    IN p_user_id INT,
    IN p_show_id INT,
    IN p_seat_ids TEXT,
    OUT p_booking_id INT,
    OUT p_status VARCHAR(50),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_total_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_seat_count INT;
    DECLARE v_available_seats INT;
    DECLARE v_base_price DECIMAL(10,2);
    DECLARE v_seat_id INT;
    DECLARE v_seat_price DECIMAL(10,2);
    DECLARE v_done INT DEFAULT 0;
    DECLARE seat_cursor CURSOR FOR 
        SELECT CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_seat_ids, ',', numbers.n), ',', -1)) AS UNSIGNED) as seat_id
        FROM (
            SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
            SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
            SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
            SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
        ) numbers
        WHERE CHAR_LENGTH(p_seat_ids) - CHAR_LENGTH(REPLACE(p_seat_ids, ',', '')) >= numbers.n - 1
        ORDER BY seat_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    -- Check if show exists and has available seats
    SELECT available_seats, base_price INTO v_available_seats, v_base_price
    FROM shows WHERE show_id = p_show_id;
    
    IF v_available_seats IS NULL THEN
        SET p_status = 'ERROR';
        SET p_message = 'Show not found';
    ELSEIF v_available_seats < (LENGTH(p_seat_ids) - LENGTH(REPLACE(p_seat_ids, ',', '')) + 1) THEN
        SET p_status = 'ERROR';
        SET p_message = 'Not enough seats available';
    ELSE
        -- Calculate total amount
        OPEN seat_cursor;
        read_loop: LOOP
            FETCH seat_cursor INTO v_seat_id;
            IF v_done THEN
                LEAVE read_loop;
            END IF;
            
            SELECT v_base_price * price_multiplier INTO v_seat_price
            FROM seats WHERE seat_id = v_seat_id;
            
            SET v_total_amount = v_total_amount + v_seat_price;
        END LOOP;
        CLOSE seat_cursor;
        
        -- Create booking
        INSERT INTO bookings (user_id, show_id, total_amount, booking_status, payment_status)
        VALUES (p_user_id, p_show_id, v_total_amount, 'pending', 'pending');
        
        SET p_booking_id = LAST_INSERT_ID();
        
        -- Insert booking seats
        SET v_done = 0;
        OPEN seat_cursor;
        read_loop2: LOOP
            FETCH seat_cursor INTO v_seat_id;
            IF v_done THEN
                LEAVE read_loop2;
            END IF;
            
            SELECT v_base_price * price_multiplier INTO v_seat_price
            FROM seats WHERE seat_id = v_seat_id;
            
            INSERT INTO booking_seats (booking_id, seat_id, price)
            VALUES (p_booking_id, v_seat_id, v_seat_price);
        END LOOP;
        CLOSE seat_cursor;
        
        -- Update show available seats (will also be done by trigger, but keeping here for safety)
        UPDATE shows 
        SET available_seats = available_seats - (LENGTH(p_seat_ids) - LENGTH(REPLACE(p_seat_ids, ',', '')) + 1)
        WHERE show_id = p_show_id;
        
        SET p_status = 'SUCCESS';
        SET p_message = 'Booking created successfully';
    END IF;
END //
DELIMITER ;

-- Procedure 2: Cancel a booking
DELIMITER //
CREATE PROCEDURE CancelBooking(
    IN p_booking_id INT,
    IN p_user_id INT,
    OUT p_status VARCHAR(50),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_booking_status VARCHAR(20);
    DECLARE v_show_id INT;
    DECLARE v_seat_count INT;
    
    SELECT booking_status, show_id INTO v_booking_status, v_show_id
    FROM bookings 
    WHERE booking_id = p_booking_id AND user_id = p_user_id;
    
    IF v_booking_status IS NULL THEN
        SET p_status = 'ERROR';
        SET p_message = 'Booking not found or unauthorized';
    ELSEIF v_booking_status = 'cancelled' THEN
        SET p_status = 'ERROR';
        SET p_message = 'Booking already cancelled';
    ELSE
        -- Get seat count
        SELECT COUNT(*) INTO v_seat_count
        FROM booking_seats
        WHERE booking_id = p_booking_id;
        
        -- Update booking status
        UPDATE bookings
        SET booking_status = 'cancelled',
            payment_status = 'refunded'
        WHERE booking_id = p_booking_id;
        
        -- Update show available seats
        UPDATE shows
        SET available_seats = available_seats + v_seat_count
        WHERE show_id = v_show_id;
        
        SET p_status = 'SUCCESS';
        SET p_message = 'Booking cancelled successfully';
    END IF;
END //
DELIMITER ;

-- Procedure 3: Get booking details
DELIMITER //
CREATE PROCEDURE GetBookingDetails(
    IN p_booking_id INT,
    IN p_user_id INT
)
BEGIN
    SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        e.event_name,
        e.category_id,
        ec.category_name,
        v.venue_name,
        v.city,
        s.show_date,
        s.show_time,
        GROUP_CONCAT(CONCAT(seats.`row_number`, seats.seat_number) ORDER BY seats.seat_id SEPARATOR ', ') as seat_numbers
    FROM bookings b
    JOIN shows s ON b.show_id = s.show_id
    JOIN events e ON s.event_id = e.event_id
    JOIN event_categories ec ON e.category_id = ec.category_id
    JOIN venues v ON s.venue_id = v.venue_id
    JOIN booking_seats bs ON b.booking_id = bs.booking_id
    JOIN seats ON bs.seat_id = seats.seat_id
    WHERE b.booking_id = p_booking_id 
    AND (b.user_id = p_user_id OR EXISTS (
        SELECT 1 FROM users WHERE user_id = p_user_id AND role = 'admin'
    ))
    GROUP BY b.booking_id;
END //
DELIMITER ;

-- Procedure 4: Confirm booking (after payment)
DELIMITER //
CREATE PROCEDURE ConfirmBooking(
    IN p_booking_id INT,
    OUT p_status VARCHAR(50),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_booking_status VARCHAR(20);
    
    SELECT booking_status INTO v_booking_status
    FROM bookings
    WHERE booking_id = p_booking_id;
    
    IF v_booking_status IS NULL THEN
        SET p_status = 'ERROR';
        SET p_message = 'Booking not found';
    ELSEIF v_booking_status = 'cancelled' THEN
        SET p_status = 'ERROR';
        SET p_message = 'Cannot confirm cancelled booking';
    ELSE
        UPDATE bookings
        SET booking_status = 'confirmed',
            payment_status = 'paid'
        WHERE booking_id = p_booking_id;
        
        SET p_status = 'SUCCESS';
        SET p_message = 'Booking confirmed successfully';
    END IF;
END //
DELIMITER ;

-- Procedure 5: Get available seats for a show
DELIMITER //
CREATE PROCEDURE GetAvailableSeats(
    IN p_show_id INT
)
BEGIN
    SELECT 
        s.seat_id,
        s.seat_number,
        s.`row_number`,
        s.seat_type,
        (sh.base_price * s.price_multiplier) as price,
        CASE 
            WHEN bs.booking_id IS NOT NULL AND b.booking_status NOT IN ('cancelled') THEN 'booked'
            ELSE 'available'
        END as seat_status
    FROM seats s
    JOIN shows sh ON s.venue_id = sh.venue_id
    LEFT JOIN booking_seats bs ON s.seat_id = bs.seat_id
    LEFT JOIN bookings b ON bs.booking_id = b.booking_id AND b.show_id = p_show_id
    WHERE sh.show_id = p_show_id
    ORDER BY s.`row_number`, s.seat_number;
END //
DELIMITER ;


