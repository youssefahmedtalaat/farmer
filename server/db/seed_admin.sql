-- ============================================
-- Create Default Admin Account
-- ============================================
-- Run this SQL script in phpMyAdmin or MySQL command line
-- to create a default admin account
-- ============================================
-- Default Credentials:
-- Email: admin@farmer.com
-- Password: admin123
-- ============================================
-- IMPORTANT: Change the password after first login!
-- ============================================

USE farmer_assistant;

-- Check if admin already exists
SET @admin_email = 'admin@farmer.com';
SET @admin_exists = (SELECT COUNT(*) FROM users WHERE email = @admin_email);

-- Only create if admin doesn't exist
INSERT INTO users (id, email, password_hash, full_name, farm_name, role, email_verified)
SELECT 
  UUID() as id,
  'admin@farmer.com' as email,
  -- Password hash for 'admin123' (bcrypt with 10 rounds)
  -- Generated using: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h));"
  '$2a$10$uh5MLUE3QPvduilx0oLtQucuRmp6eKYLZbpqUsgqe6C9i1TSdwShW' as password_hash,
  'Admin User' as full_name,
  'Admin Farm' as farm_name,
  'admin' as role,
  true as email_verified
WHERE @admin_exists = 0;

-- Show result
SELECT 
  CASE 
    WHEN @admin_exists > 0 THEN 'Admin account already exists!'
    ELSE 'Admin account created successfully!'
  END as result,
  'admin@farmer.com' as email,
  'admin123' as password,
  'admin' as role;

