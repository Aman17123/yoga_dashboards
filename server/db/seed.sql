-- ============================================================
-- Yoga Dashboard Complete Database Setup (Schema + Seed Data)
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
-- 2. Table: student_attendance
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
-- 3. Table: student_payments
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
-- 6. Table: payment_settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` INT NOT NULL PRIMARY KEY DEFAULT 1,
  `upi_id` VARCHAR(255) DEFAULT 'yogaonlive@upi',
  `payee_name` VARCHAR(255) DEFAULT 'yogaonlive Studio',
  `account_name` VARCHAR(255) DEFAULT 'yogaonlive',
  `account_number` VARCHAR(100) DEFAULT '000000000000',
  `ifsc` VARCHAR(50) DEFAULT 'ABCD0123456',
  `bank_name` VARCHAR(255) DEFAULT 'State Bank of India',
  `admin_whats_app` VARCHAR(50) DEFAULT '+91 90000 00000',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Table: payment_settings_group_links
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_settings_group_links` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `cohort_key` VARCHAR(50) NOT NULL UNIQUE,
  `meet_url` VARCHAR(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Data Inserts
-- ============================================================

-- ------------------------------------------------------------
-- Seed Payment Settings
-- ------------------------------------------------------------
INSERT INTO payment_settings (id, upi_id, payee_name, account_name, account_number, ifsc, bank_name, admin_whats_app)
VALUES (1, 'yogaonlive@upi', 'yogaonlive Studio', 'yogaonlive', '000000000000', 'ABCD0123456', 'State Bank of India', '+91 90000 00000')
ON DUPLICATE KEY UPDATE upi_id=VALUES(upi_id);

-- ------------------------------------------------------------
-- 2. Seed Payment Settings Group Links
-- ------------------------------------------------------------
INSERT INTO payment_settings_group_links (cohort_key, meet_url) VALUES
('hindi', 'https://meet.google.com/yol-hindi-cohort'),
('english', 'https://meet.google.com/yol-english-cohort'),
('default', 'https://meet.google.com/yol-live-group')
ON DUPLICATE KEY UPDATE meet_url=VALUES(meet_url);

-- ------------------------------------------------------------
-- 3. Seed Students
-- ------------------------------------------------------------
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (1, 'Aarav Sharma', 'aarav.sharma@example.com', '+971 50 123 4567', 'private', NULL, 'Rohan Mehta', 'United Arab Emirates', 'Asia/Dubai', '1 Hour', 4500, '19:00', '[0,1,2,3,4,5,6]', '2026-08-13', '2026-08-13', 'aarav.sharma', '$2b$10$KdmAAKZ2YRt9wWjdXo7JWOtD.5dXwU8FLogS1OKQabj9lO.j.wmJq', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (2, 'Emily Carter', 'emily.carter@example.com', '+1 917 555 0142', 'private', NULL, 'Priya Nair', 'United States', 'America/New_York', '1 Hour', 6000, '20:00', '[0,1,2,3,4,5,6]', '2026-01-27', '2026-07-27', 'emily.carter', '$2b$10$tmDYJTgdAAv9jKj7DH9EkON/PKz.oRCroCX5ivdARwst/K4OQt/q.', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (3, 'Liam Johnson', 'liam.johnson@example.com', '+44 7700 900123', 'group', 'Group A', 'Meera Iyer', 'United Kingdom', 'Europe/London', '1 Hour', 2800, '18:00', '[1,3,5]', '2025-11-26', '2026-07-26', 'liam.johnson', '$2b$10$5FYxUtTm2n/ehdkCAF2cmuouHGgRVcxXr1yOMq8lhG./b7Qd1/WQm', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (4, 'Sophia Wilson', 'sophia.wilson@example.com', '+1 416 555 0110', 'group', 'Group A', 'Meera Iyer', 'Canada', 'America/Toronto', '1 Hour', 2800, '18:00', '[1,3,5]', '2025-12-29', '2026-06-29', 'sophia.wilson', '$2b$10$7XwjlLbUEUt6FS2bOKI/S.8PsD6/ONfvuWlKGRyTAHg1nf0OS0Zuy', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (5, 'Noah Müller', 'noah.mueller@example.com', '+49 151 2345 6789', 'group', 'Group A', 'Meera Iyer', 'Germany', 'Europe/Berlin', '1 Hour', 2800, '18:00', '[1,3,5]', '2026-01-29', '2026-07-29', 'noah.mueller', '$2b$10$I7BTOyohaEKe/zkWNa.0sO169HbT74fJqYk.nO7lme0GaAhcMQa6y', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (6, 'Haruto Sato', 'haruto.sato@example.com', '+81 90 1234 5678', 'private', NULL, 'Kabir Khan', 'Japan', 'Asia/Tokyo', '1 Hour', 5500, '16:00', '[0,1,2,3,4,5,6]', '2026-08-20', '2026-08-20', 'haruto.sato', '$2b$10$cYOvo7R53saXZ9TgJNYU.e.x5L/ZU08Q.SQT1s106c2LR8egPO4JO', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (7, 'Chidinma Okafor', 'chidinma.okafor@example.com', '+234 802 123 4567', 'group', 'Group B', 'Kabir Khan', 'Nigeria', 'Africa/Lagos', '1 Hour', 2500, '17:30', '[2,4,6]', '2026-01-28', '2026-07-28', 'chidinma.okafor', '$2b$10$gYfglRwZfjZcbaDLsRdZM.1D/cldQsM7AB2yD28R7w7GYE6.IH90q', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (8, 'Wei Zhang', 'wei.zhang@example.com', '+65 8123 4567', 'group', 'Group B', 'Kabir Khan', 'Singapore', 'Asia/Singapore', '1 Hour', 2500, '17:30', '[2,4,6]', '2025-11-30', '2026-07-31', 'wei.zhang', '$2b$10$RQMgaq/N2inZi45f4LO8mOJiO8XjvHCRcalAKFzTrjg26EXxuDZe2', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (9, 'Olivia Brown', 'olivia.brown@example.com', '+61 412 345 678', 'private', NULL, 'Rohan Mehta', 'Australia', 'Australia/Sydney', '1 Hour', 5000, '07:00', '[0,1,2,3,4,5,6]', '2026-08-24', '2026-08-24', 'olivia.brown', '$2b$10$um6NcgvNPPRWg3IRhVMZPuDtVc10dybVAHYO.QrnlyV46u4pCEx3e', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);
INSERT INTO students (id, name, email, phone, class_type, group_name, instructor, country, timezone, duration, fee, class_time_ist, schedule_days, joining_date, last_payment_date, username, password, welcome_email_status) VALUES (10, 'Ethan Davis', 'ethan.davis@example.com', '+1 213 555 0176', 'group', 'Group B', 'Kabir Khan', 'United States', 'America/Los_Angeles', '1 Hour', 2500, '17:30', '[2,4,6]', '2025-10-25', '2026-06-25', 'ethan.davis', '$2b$10$NxMkrJhZwUuiNaN7YSDG/eBR7c9ubIzzc1X7BA1AJkoEzU2NSD8YC', 'pending') ON DUPLICATE KEY UPDATE username=VALUES(username);

-- ------------------------------------------------------------
-- 4. Seed Student Attendance
-- ------------------------------------------------------------
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-21', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-26', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-08-31', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-10', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-11', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (1, '2026-09-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-02', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-14', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-06-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-15', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-21', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-07-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-11', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-16', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-21', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-22', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-26', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-08-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-09-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-09-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (2, '2026-09-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-26', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-06-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-07-31', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-10', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-14', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-21', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-26', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-08-31', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-09-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-09-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-09-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-09-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (3, '2026-09-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-26', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-06-29', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-10', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-17', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-07-31', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-03', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-14', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-19', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-21', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-26', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-08-31', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-09-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-09-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-09-07', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-09-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (4, '2026-09-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-19', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-26', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-06-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-06', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-15', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-07-31', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-14', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-17', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-19', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-21', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-26', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-08-31', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-09-02', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-09-04', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-09-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-09-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (5, '2026-09-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-08-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-08-21', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-08-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-08-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-08-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-08-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (6, '2026-09-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-16', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-06-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-14', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-16', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-21', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-07-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-25', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-08-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-09-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-09-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-09-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-09-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (7, '2026-09-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-06', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-16', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-18', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-20', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-25', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-06-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-14', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-16', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-21', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-07-30', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-15', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-20', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-22', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-08-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-09-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-09-05', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-09-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-09-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (8, '2026-09-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-08-24', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-08-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-08-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-08-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-09', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (9, '2026-09-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-16', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-25', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-27', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-06-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-02', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-07', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-09', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-14', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-16', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-21', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-23', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-28', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-07-30', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-01', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-04', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-06', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-11', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-13', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-15', 'absent') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-18', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-20', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-22', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-25', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-27', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-08-29', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-09-01', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-09-03', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-09-05', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-09-08', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-09-10', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (10, '2026-09-12', 'present') ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ------------------------------------------------------------
-- 5. Seed Student Payments
-- ------------------------------------------------------------
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (1, '2026-08-13', 4500, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (2, '2026-07-27', 6000, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (3, '2026-07-26', 2800, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (4, '2026-06-29', 2800, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (5, '2026-07-29', 2800, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (6, '2026-08-20', 5500, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (7, '2026-07-28', 2500, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (8, '2026-07-31', 2500, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (9, '2026-08-24', 5000, 'Initial tuition payment', 'UPI / Bank Transfer');
INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method) VALUES (10, '2026-06-25', 2500, 'Initial tuition payment', 'UPI / Bank Transfer');

-- ------------------------------------------------------------
-- 6. Seed Enquiries
-- ------------------------------------------------------------
INSERT INTO enquiries (id, name, gender, age, height_weight, phone, email, country, class_type_interest, preferred_timings, demo_date, instructor_preference, reason, other_info, message, status, submitted_date, converted_student_id) VALUES (1, 'Priya Desai', 'Female', 34, '5\'4" / 68 kg', '+91 98200 12345', 'priya.desai@example.com', 'India', 'private', 'Mornings, 7–8 AM IST', '2026-08-29', 'Female', 'Weight Loss', 'Has mild knee pain, please advise on modifications.', 'Looking for a private instructor for weight loss, prefer a female teacher.', 'pending', '2026-08-24', NULL) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO enquiries (id, name, gender, age, height_weight, phone, email, country, class_type_interest, preferred_timings, demo_date, instructor_preference, reason, other_info, message, status, submitted_date, converted_student_id) VALUES (2, 'James Whitfield', 'Male', 41, '5\'10" / 82 kg', '+44 7700 900222', 'james.whitfield@example.com', 'United Kingdom', 'group', 'Around 8–9 PM IST works for me', '2026-08-30', 'Any', 'Regular Yoga Practice', '', 'Want to join a group class for general fitness.', 'in_progress', '2026-08-22', NULL) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO enquiries (id, name, gender, age, height_weight, phone, email, country, class_type_interest, preferred_timings, demo_date, instructor_preference, reason, other_info, message, status, submitted_date, converted_student_id) VALUES (3, 'Fatima Al-Sayed', 'Female', 29, '5\'5" / 60 kg', '+971 55 123 9876', 'fatima.alsayed@example.com', 'United Arab Emirates', 'private', 'Late night, ~11 PM IST (I\'m in Dubai)', '2026-09-01', 'Female', 'Pre/Post Natal Yoga', '6 months pregnant, need a prenatal-safe routine.', 'Looking for prenatal yoga with a certified instructor.', 'pending', '2026-08-25', NULL) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO enquiries (id, name, gender, age, height_weight, phone, email, country, class_type_interest, preferred_timings, demo_date, instructor_preference, reason, other_info, message, status, submitted_date, converted_student_id) VALUES (4, 'David Kim', 'Male', 52, '5\'8" / 90 kg', '+1 213 555 0199', 'david.kim@example.com', 'United States', 'private', 'Mornings IST (evening for me, Pacific time)', '2026-08-28', 'Any', 'Yoga for Disease (Type 2 Diabetes, High BP)', 'Doctor recommended yoga for blood pressure management.', 'Need therapeutic yoga for diabetes and blood pressure.', 'declined', '2026-08-18', NULL) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO enquiries (id, name, gender, age, height_weight, phone, email, country, class_type_interest, preferred_timings, demo_date, instructor_preference, reason, other_info, message, status, submitted_date, converted_student_id) VALUES (5, 'Ananya Rao', 'Female', 24, '5\'3" / 55 kg', '+91 90000 45612', 'ananya.rao@example.com', 'India', 'group', 'Weekday evenings, 6–7 PM IST', '2026-08-27', 'Any', 'Regular Yoga Practice', '', 'Want to try group sessions along with a couple of friends.', 'accepted', '2026-08-15', NULL) ON DUPLICATE KEY UPDATE name=VALUES(name);

SET FOREIGN_KEY_CHECKS = 1;
