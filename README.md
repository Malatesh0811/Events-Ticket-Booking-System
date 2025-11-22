# Ticket Booking System

A comprehensive ticket booking system similar to BookMyShow, supporting multiple event types including Movies, Concerts, Sports, Standup Comedy, Theater, Workshops, and Festivals.

## Features

### Database Features (MySQL)
- ✅ **Normalized Database Schema** with multiple tables
- ✅ **Stored Procedures** for complex operations (booking, cancellation, etc.)
- ✅ **Triggers** for automatic seat management, rating updates, and booking history
- ✅ **Views** for analytics and reporting (revenue, venue performance, popular events)
- ✅ **Data Integrity** with foreign keys and constraints

### Backend Features (Node.js + Express)
- ✅ RESTful API with JWT authentication
- ✅ User registration and login
- ✅ Event management (CRUD operations)
- ✅ Show scheduling and management
- ✅ Seat selection and booking system
- ✅ Booking confirmation and cancellation
- ✅ Review system for events
- ✅ Admin dashboard with analytics

### Frontend Features (React)
- ✅ Modern, responsive UI
- ✅ User authentication (Login/Register)
- ✅ Browse events by category
- ✅ View event details and shows
- ✅ Interactive seat selection
- ✅ Booking management
- ✅ Admin dashboard

## Technology Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express, MySQL2
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Project Structure

```
ticketbooking/
├── database/
│   ├── schema.sql              # Database schema with all tables
│   ├── stored_procedures.sql    # Stored procedures
│   ├── triggers.sql             # Database triggers
│   ├── views.sql                # Database views for analytics
│   └── sample_data.sql          # Sample data for testing
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── events.js            # Event routes
│   │   ├── shows.js             # Show routes
│   │   ├── bookings.js          # Booking routes
│   │   ├── reviews.js          # Review routes
│   │   └── admin.js             # Admin routes
│   ├── server.js                # Express server
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/          # React components
    │   ├── pages/               # Page components
    │   ├── context/             # Context API
    │   ├── services/            # API services
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Database Setup

1. **Create MySQL Database:**
   ```bash
   mysql -u root -p
   ```

2. **Run SQL Scripts in Order:**
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/stored_procedures.sql
   mysql -u root -p < database/triggers.sql
   mysql -u root -p < database/views.sql
   mysql -u root -p < database/sample_data.sql
   mysql -u root -p < database/users_privileges.sql
   ```

   Or run them individually:
   ```sql
   source database/schema.sql;
   source database/stored_procedures.sql;
   source database/triggers.sql;
   source database/views.sql;
   source database/sample_data.sql;
   ```

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` file:**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ticket_booking_system
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional):**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

   Frontend will run on `http://localhost:3000`

## Database Schema Details

### Tables
- `users` - User accounts (customers and admins)
- `event_categories` - Event types (Movie, Concert, Sports, etc.)
- `venues` - Theaters and venues
- `events` - Events/Movies/Concerts
- `shows` - Specific showtimes for events
- `seats` - Seat layout for venues
- `bookings` - Booking records
- `booking_seats` - Many-to-many: bookings and seats
- `reviews` - User reviews for events
- `booking_history_log` - Audit log for bookings

### Stored Procedures
1. `CreateBooking` - Creates a new booking with seat validation
2. `CancelBooking` - Cancels a booking and updates seat availability
3. `GetBookingDetails` - Retrieves complete booking information
4. `ConfirmBooking` - Confirms booking after payment
5. `GetAvailableSeats` - Gets available seats for a show

### Triggers
1. `after_booking_confirmed` - Logs booking confirmation
2. `after_review_insert/update` - Auto-updates event rating
3. `before_booking_seat_insert` - Prevents double booking
4. `after_booking_cancelled` - Updates seat availability on cancellation
5. `before_booking_insert` - Prevents booking past shows
6. `after_booking_status_change` - Logs all booking status changes

### Users & Privileges
- `app_admin` (full privileges on schema) — password: `Admin@123`
- `app_user` (limited CRUD + EXECUTE on procedures, SELECT on views) — password: `User@123`

Use these to demonstrate varied privileges per rubric. Change passwords in production.

### Views
1. `event_summary` - Events with statistics
2. `show_details` - Shows with availability
3. `user_booking_history` - User booking history
4. `venue_performance` - Venue analytics
5. `category_statistics` - Category-wise stats
6. `daily_revenue` - Daily revenue report
7. `popular_events` - Top events by bookings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `GET /api/events/categories/list` - Get all categories

### Shows
- `GET /api/shows` - Get all shows (with filters)
- `GET /api/shows/:id` - Get show details
- `GET /api/shows/:id/seats` - Get available seats
- `POST /api/shows` - Create show (Admin)
- `GET /api/shows/venues/list` - Get all venues

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings/my-bookings` - Get user bookings (Protected)
- `GET /api/bookings/:id` - Get booking details (Protected)
- `POST /api/bookings/:id/confirm` - Confirm booking (Protected)
- `POST /api/bookings/:id/cancel` - Cancel booking (Protected)

### Reviews
- `POST /api/reviews` - Add review (Protected)
- `GET /api/reviews/event/:event_id` - Get reviews for event

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)
- `GET /api/admin/logs?limit=25` - Recent booking activity from trigger log (Admin)
- `POST /api/admin/venues` - Create venue (Admin)

## Default Credentials

After running sample_data.sql:
- **Admin**: 
  - Email: `admin123@gmail.com`
  - Password: `password` (change after first login)

## Testing the System

1. **Register/Login** as a customer
2. **Browse Events** and view details
3. **Select a Show** and choose seats
4. **Complete Booking** (auto-confirmed for demo)
5. **View My Bookings** to see booking history
6. **Cancel Booking** if needed
7. **Login as Admin** to view dashboard analytics
8. **Admin Logs**: Open Admin Dashboard to see "Recent Booking Activity" which reads from trigger-driven `booking_history_log` via `/api/admin/logs`.

## Rubric Coverage Checklist
- ER Diagram: Provided by you (external to repo)
- Relational Schema: Included in `database/schema.sql` (correct mapping)
- Normal Form: Tables designed to 3NF (see schema and README notes)
- Users Creation/Varied Privileges: `database/users_privileges.sql` with `app_admin` and `app_user`
- Triggers: Implemented in `database/triggers.sql` and visible via Admin logs
- Procedures/Functions: Implemented in `database/stored_procedures.sql`, used by API with GUI flows
- Create operations: Events, Shows, Bookings, Reviews via GUI/API
- Read operations: Events list/detail, Shows, Seats, Bookings, Dashboard, Logs via GUI
- Update operations: Events, Reviews (upsert), Booking status via procedures (Confirm/Cancel) with GUI
- Delete operations: Reviews (GUI), cascades; admin could be expanded to delete events/shows if needed
- Queries based on functionality: Includes nested queries, joins, and aggregates in `views.sql` and procedures; surfaced in Admin Dashboard and user flows

## Features Demonstrated

### DBMS Concepts
- ✅ Database normalization (3NF)
- ✅ Stored procedures
- ✅ Triggers (BEFORE/AFTER)
- ✅ Views for data abstraction
- ✅ Foreign keys and referential integrity
- ✅ Indexes and constraints
- ✅ Complex queries with JOINs

### Full-Stack Development
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Error handling
- ✅ Responsive UI design
- ✅ State management with Context API

## Future Enhancements

- Payment gateway integration
- Email notifications
- Real-time seat availability updates
- Advanced search and filters
- User profiles and preferences
- Loyalty program
- Mobile app

## License

This project is created for educational purposes (DBMS Project).

## Support

For issues or questions, please check the code comments or database schema documentation.




