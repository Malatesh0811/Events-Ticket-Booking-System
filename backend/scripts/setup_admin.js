/**
 * Script to setup/update admin user in the database
 * Usage: node scripts/setup_admin.js
 * 
 * This script will:
 * 1. Check if admin user with email admin123@gmail.com exists
 * 2. If exists, update password and ensure role is admin
 * 3. If not exists, create the admin user
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin123@gmail.com';
const ADMIN_PASSWORD = 'password';
const ADMIN_USERNAME = 'admin';
const ADMIN_FULL_NAME = 'Admin User';
const ADMIN_PHONE = '9999999999';

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Check if admin user exists
    const [existingUsers] = await db.execute(
      'SELECT user_id, email, role FROM users WHERE email = ? OR (username = ? AND role = ?)',
      [ADMIN_EMAIL, ADMIN_USERNAME, 'admin']
    );

    // Hash the password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('Password hashed successfully');

    if (existingUsers.length > 0) {
      // Update existing admin user
      const userId = existingUsers[0].user_id;
      await db.execute(
        'UPDATE users SET email = ?, password_hash = ?, role = ?, username = ?, full_name = ?, phone = ? WHERE user_id = ?',
        [ADMIN_EMAIL, passwordHash, 'admin', ADMIN_USERNAME, ADMIN_FULL_NAME, ADMIN_PHONE, userId]
      );
      console.log(`✅ Admin user updated successfully!`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else {
      // Create new admin user
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [ADMIN_USERNAME, ADMIN_EMAIL, passwordHash, ADMIN_FULL_NAME, ADMIN_PHONE, 'admin']
      );
      console.log(`✅ Admin user created successfully!`);
      console.log(`   User ID: ${result.insertId}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

    console.log('\n🎉 Admin setup complete! You can now login with:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();


