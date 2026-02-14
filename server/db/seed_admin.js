import bcrypt from 'bcryptjs';
import pool from './connection.js';
import { generateUUID } from './uuid_helper.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_ADMIN = {
  email: 'admin@farmer.com',
  password: 'admin123',
  fullName: 'Admin User',
  farmName: 'Admin Farm',
  role: 'admin'
};

async function createAdmin() {
  try {
    console.log('🔐 Creating admin account...');

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id, email FROM users WHERE email = ?',
      [DEFAULT_ADMIN.email.toLowerCase()]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin account already exists!');
      console.log(`   Email: ${existingAdmin.rows[0].email}`);
      console.log('   You can use the existing account or reset the password.');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, saltRounds);
    const userId = generateUUID();

    // Create admin user
    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, farm_name, role, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [
        userId,
        DEFAULT_ADMIN.email.toLowerCase(),
        passwordHash,
        DEFAULT_ADMIN.fullName,
        DEFAULT_ADMIN.farmName,
        DEFAULT_ADMIN.role
      ]
    );

    console.log('✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ' + DEFAULT_ADMIN.email);
    console.log('🔑 Password: ' + DEFAULT_ADMIN.password);
    console.log('👤 Role:     ' + DEFAULT_ADMIN.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
createAdmin();

