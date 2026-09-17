-- ============================================================
-- Yoga Dashboard MySQL Database Schema
-- Converted from Mongoose Models
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Table: students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT '',
  `class_type` ENUM('private', 'group') DEFAULT 'private',
  `group_name` VARCHAR(100) DEFAULT NULL,
  `instructor` VARCHAR(100) DEFAULT 'Rohan Mehta',
  `country` VARCHAR(100) DEFAULT 'India',
  `timezone` VARCHAR(100) DEFAULT 'Asia/Kolkata',
  `duration` VARCHAR(50) DEFAULT '1 Hour',
  `fee` DECIMAL(10,2) DEFAULT 3000.00,
  `class_time_ist` VARCHAR(50) DEFAULT '19:00',
  `schedule_days` JSON DEFAULT NULL,
  `joining_date` VARCHAR(20) DEFAULT '',
  `last_payment_date` VARCHAR(20) DEFAULT '',
  `class_link` VARCHAR(500) DEFAULT '',
  `goals` TEXT DEFAULT NULL,
  `language` VARCHAR(50) DEFAULT 'English',
  `instructor_status` ENUM('assigned', 'matching_in_progress') DEFAULT 'assigned',
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `welcome_email_status` ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  `welcome_email_sent_at` DATETIME DEFAULT NULL,
  `welcome_email_error` TEXT DEFAULT NULL,
  `enrolled_from_booking_id` INT DEFAULT NULL,
  `enrolled_from_enquiry_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_students_username` (`username`),
  INDEX `idx_students_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table: student_attendance (Child table for daily attendance)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_attendance` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `attendance_date` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_date` (`student_id`, `attendance_date`),
  INDEX `idx_attendance_student_id` (`student_id`),
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Table: student_payments (Child table for tuition payment history)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_payments` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `payment_date` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `note` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(100) DEFAULT 'UPI / Bank Transfer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payments_student_id` (`student_id`),
  CONSTRAINT `fk_payments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Table: bookings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `age` VARCHAR(10) DEFAULT '',
  `gender` VARCHAR(50) DEFAULT '',
  `phone` VARCHAR(50) DEFAULT '',
  `country` VARCHAR(100) DEFAULT '',
  `timezone` VARCHAR(100) DEFAULT 'Asia/Kolkata',
  `language` VARCHAR(50) DEFAULT 'English',
  `class_type` ENUM('private', 'group', 'not_sure') DEFAULT 'group',
  `preferred_time` VARCHAR(100) DEFAULT '',
  `preferred_time2` VARCHAR(100) DEFAULT '',
  `instructor_preference` VARCHAR(100) DEFAULT 'Any',
  `group_cohort` VARCHAR(100) DEFAULT '',
  `fee` DECIMAL(10,2) DEFAULT 0.00,
  `goals` TEXT DEFAULT NULL,
  `joining_date` VARCHAR(20) DEFAULT '',
  `message` TEXT DEFAULT NULL,
  `source` VARCHAR(100) DEFAULT 'direct',
  `referral_url` TEXT DEFAULT NULL,
  `booking_ref` VARCHAR(50) UNIQUE DEFAULT NULL,
  `status` ENUM('pending', 'contacted', 'confirmed', 'converted', 'declined') DEFAULT 'pending',
  `admin_notes` TEXT DEFAULT NULL,
  `confirmation_email_sent` TINYINT(1) DEFAULT 0,
  `admin_email_sent` TINYINT(1) DEFAULT 0,
  `enrolled_student_id` INT DEFAULT NULL,
  `enrollment_email_status` ENUM('pending', 'sent', 'failed', 'none') DEFAULT 'none',
  `enrollment_email_error` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bookings_booking_ref` (`booking_ref`),
  INDEX `idx_bookings_status` (`status`),
  INDEX `idx_bookings_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Table: enquiries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `gender` VARCHAR(50) DEFAULT '',
  `age` INT DEFAULT NULL,
  `height_weight` VARCHAR(100) DEFAULT '',
  `phone` VARCHAR(50) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `country` VARCHAR(100) DEFAULT 'India',
  `class_type_interest` ENUM('private', 'group') DEFAULT 'private',
  `preferred_timings` VARCHAR(255) DEFAULT '',
  `demo_date` VARCHAR(50) DEFAULT '',
  `instructor_preference` VARCHAR(100) DEFAULT 'Any',
  `reason` VARCHAR(255) DEFAULT '',
  `other_info` TEXT DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'in_progress', 'accepted', 'declined') DEFAULT 'pending',
  `submitted_date` VARCHAR(20) DEFAULT '',
  `converted_student_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_enquiries_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. Table: payment_settings (Single-row configuration)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` INT NOT NULL PRIMARY KEY DEFAULT 1,
  `upi_id` VARCHAR(255) DEFAULT 'yourbusiness@upi',
  `payee_name` VARCHAR(255) DEFAULT 'Your Tutoring Business',
  `account_name` VARCHAR(255) DEFAULT 'Your Name',
  `account_number` VARCHAR(100) DEFAULT '000000000000',
  `ifsc` VARCHAR(50) DEFAULT 'ABCD0123456',
  `bank_name` VARCHAR(255) DEFAULT 'Your Bank',
  `admin_whats_app` VARCHAR(50) DEFAULT '+91 90000 00000',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Table: payment_settings_group_links (Cohort meet URLs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_settings_group_links` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `cohort_key` VARCHAR(50) NOT NULL UNIQUE,
  `meet_url` VARCHAR(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. Table: instructors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `instructors` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) DEFAULT '',
  `password` VARCHAR(255) DEFAULT '',
  `gender` VARCHAR(50) DEFAULT 'Female',
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `meet_link` VARCHAR(500) DEFAULT '',
  `language` VARCHAR(50) DEFAULT 'Both',
  `profile_image` LONGTEXT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. Table: classes (Schedule entries)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `time_slot` VARCHAR(100) NOT NULL,
  `days` JSON DEFAULT NULL,
  `instructor_id` INT DEFAULT NULL,
  `instructor_name` VARCHAR(255) DEFAULT '',
  `class_type` ENUM('group', 'private') DEFAULT 'group',
  `meeting_link` VARCHAR(500) DEFAULT '',
  `language` VARCHAR(50) DEFAULT 'Both',
  `max_capacity` INT DEFAULT 15,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('assigned', 'free') DEFAULT 'free',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_classes_time_slot` (`time_slot`),
  INDEX `idx_classes_instructor` (`instructor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

