-- ============================================
-- Farmer Assistant Platform - Database Schema
-- ============================================
-- MySQL/MariaDB Version (for XAMPP)
-- ============================================
-- Run this SQL in phpMyAdmin or MySQL command line
-- ============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS farmer_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmer_assistant;

-- ============================================
-- USERS TABLE (replaces Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  farm_name VARCHAR(255) DEFAULT '',
  role VARCHAR(20) DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  farm_name VARCHAR(255) DEFAULT '',
  farm_size VARCHAR(100) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  address TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CROPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS crops (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity VARCHAR(50) DEFAULT '0',
  stock INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Good',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unique constraint for crops (user_id + lowercase name) - handled in application code
-- MySQL doesn't support functional indexes like PostgreSQL's LOWER(name)

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  plan_id VARCHAR(100) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  duration VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'trial',
  trial_ends_at TIMESTAMP NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  action VARCHAR(255) NOT NULL,
  detail TEXT DEFAULT '',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATION_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  crop_alerts BOOLEAN DEFAULT true,
  weather_alerts BOOLEAN DEFAULT true,
  market_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS crops_user_id_idx ON crops(user_id);
CREATE INDEX IF NOT EXISTS crops_name_idx ON crops(name);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_timestamp_idx ON activities(timestamp DESC);

-- ============================================
-- TRIGGER TO AUTO-CREATE PROFILE ON USER CREATION
-- ============================================
DELIMITER $$

DROP TRIGGER IF EXISTS on_user_created$$

CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO profiles (id, full_name, email, farm_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.full_name, ''),
    NEW.email,
    COALESCE(NEW.farm_name, '')
  )
  ON DUPLICATE KEY UPDATE
    full_name = COALESCE(NEW.full_name, ''),
    email = NEW.email,
    farm_name = COALESCE(NEW.farm_name, '');
END$$

DELIMITER ;

