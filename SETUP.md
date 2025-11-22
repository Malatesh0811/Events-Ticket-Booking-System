# Quick Setup Guide

## Step 1: Database Setup

### Method 1: Using Command Prompt (Easiest)

1. **Open Command Prompt (CMD)** or **PowerShell**
   - Press `Win + R`, type `cmd`, press Enter
   - OR search "Command Prompt" in Windows

2. **Navigate to your project folder:**
   ```cmd
   cd C:\Users\samar\ticketbooking
   ```

3. **Run each SQL file one by one:**
   ```cmd
   mysql -u root -p < database\schema.sql
   ```
   (Enter your MySQL password when prompted)
   
   Then run the rest:
   ```cmd
   mysql -u root -p < database\stored_procedures.sql
   mysql -u root -p < database\triggers.sql
   mysql -u root -p < database\views.sql
   mysql -u root -p < database\sample_data.sql
   ```

### Method 2: Using MySQL Command Line

1. **Open Command Prompt** and type:
   ```cmd
   mysql -u root -p
   ```
   (Enter your MySQL password)

2. **Once inside MySQL, run:**
   ```sql
   source C:/Users/samar/ticketbooking/database/schema.sql;
   source C:/Users/samar/ticketbooking/database/stored_procedures.sql;
   source C:/Users/samar/ticketbooking/database/triggers.sql;
   source C:/Users/samar/ticketbooking/database/views.sql;
   source C:/Users/samar/ticketbooking/database/sample_data.sql;
   ```
   
   **Important:** Use forward slashes `/` in the path, not backslashes!

3. **Verify it worked:**
   ```sql
   USE ticket_booking_system;
   SHOW TABLES;
   ```
   You should see 9 tables listed.

## Step 2: Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy the example and edit):
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux/Mac:
cp .env.example .env
```

4. Edit `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ticket_booking_system
JWT_SECRET=your_super_secret_jwt_key_change_this
```

5. Start backend:
```bash
npm start
```

## Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend:
```bash
npm start
```

## Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing

1. **Register a new account** or use existing test accounts from sample data
2. **Browse events** and select one
3. **Choose a show** and click "Book Now"
4. **Select seats** on the booking page
5. **Confirm booking** (automatically confirmed for demo)
6. **View bookings** in "My Bookings"
7. **Login as admin** to see dashboard (email: admin123@gmail.com, password: password)

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env` file
- Ensure database `ticket_booking_system` exists

### Port Already in Use
- Change `PORT` in backend `.env` file
- Or stop the process using port 5000/3000

### Module Not Found
- Delete `node_modules` folder
- Run `npm install` again

### Stored Procedure Errors
- Make sure all SQL files are executed in order
- Check MySQL version (8.0+ recommended)

