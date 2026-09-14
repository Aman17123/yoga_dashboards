import mongoose from "mongoose";
import dotenv from "dotenv";
import { pool } from "../db/pool.js";

dotenv.config();

async function migrate() {
  console.log("==================================================");
  console.log("   MIGRATING DATA: MongoDB Atlas -> MySQL");
  console.log("==================================================");

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not found in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB Atlas.");

  const db = mongoose.connection.db;

  // Ensure connection to MySQL
  const conn = await pool.getConnection();
  console.log("✅ Connected to MySQL database:", process.env.DB_NAME || "yoga_dashboard");

  try {
    // ─── 1. Migrate Bookings first to build Mongo _id -> MySQL id map ───────
    console.log("\n[1/4] Migrating Bookings...");
    const mongoBookings = await db.collection("bookings").find().sort({ createdAt: 1 }).toArray();
    console.log(`Found ${mongoBookings.length} bookings in MongoDB.`);

    const bookingIdMap = new Map(); // mongo _id (string) -> mysql id (number)

    for (const b of mongoBookings) {
      const stamp = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
      const bookingRef = b.bookingRef || `YOL-${stamp}-${rand}`;

      const [res] = await conn.execute(
        `INSERT INTO bookings (
          name, email, age, gender, phone, country, timezone, language,
          class_type, preferred_time, preferred_time2, instructor_preference,
          group_cohort, fee, goals, joining_date, message, source,
          referral_url, booking_ref, status, admin_notes,
          confirmation_email_sent, admin_email_sent, enrolled_student_id,
          enrollment_email_status, enrollment_email_error, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), status = VALUES(status)`,
        [
          b.name || "",
          b.email || "",
          b.age?.toString() || "",
          b.gender || "",
          b.phone || "",
          b.country || "",
          b.timezone || "Asia/Kolkata",
          b.language || "English",
          b.classType === "private" ? "private" : "group",
          b.preferredTime || "",
          b.preferredTime2 || "",
          b.instructorPreference || "Any",
          b.groupCohort || "",
          Number(b.fee) || 0,
          b.goals || "",
          b.joiningDate || "",
          b.message || "",
          b.source || "direct",
          b.referralUrl || "",
          bookingRef,
          b.status || "pending",
          b.adminNotes || "",
          b.confirmationEmailSent ? 1 : 0,
          b.adminEmailSent ? 1 : 0,
          b.enrolledStudentId || null,
          b.enrollmentEmailStatus || "none",
          b.enrollmentEmailError || null,
          b.createdAt ? new Date(b.createdAt) : new Date(),
          b.updatedAt ? new Date(b.updatedAt) : new Date(),
        ]
      );

      const mysqlId = res.insertId || (await conn.execute("SELECT id FROM bookings WHERE booking_ref = ?", [bookingRef]))[0][0]?.id;
      if (b._id) {
        bookingIdMap.set(b._id.toString(), mysqlId);
      }
    }
    console.log(`✅ Successfully processed ${mongoBookings.length} bookings into MySQL.`);

    // ─── 2. Migrate Enquiries ────────────────────────────────────────────────
    console.log("\n[2/4] Migrating Enquiries...");
    const mongoEnquiries = await db.collection("enquiries").find().sort({ id: 1 }).toArray();
    console.log(`Found ${mongoEnquiries.length} enquiries in MongoDB.`);

    for (const eq of mongoEnquiries) {
      await conn.execute(
        `INSERT INTO enquiries (
          id, name, gender, age, height_weight, phone, email, country,
          class_type_interest, preferred_timings, demo_date, instructor_preference,
          reason, other_info, message, status, submitted_date, converted_student_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          status = VALUES(status),
          converted_student_id = VALUES(converted_student_id)`,
        [
          eq.id,
          eq.name || "",
          eq.gender || "",
          eq.age !== undefined && eq.age !== null ? Number(eq.age) : null,
          eq.heightWeight || "",
          eq.phone || "",
          eq.email || "",
          eq.country || "India",
          eq.classTypeInterest === "group" ? "group" : "private",
          eq.preferredTimings || "",
          eq.demoDate || "",
          eq.instructorPreference || "Any",
          eq.reason || "",
          eq.otherInfo || "",
          eq.message || "",
          eq.status || "pending",
          eq.submittedDate || "",
          eq.convertedStudentId || null,
          eq.createdAt ? new Date(eq.createdAt) : new Date(),
          eq.updatedAt ? new Date(eq.updatedAt) : new Date(),
        ]
      );
    }
    console.log(`✅ Successfully processed ${mongoEnquiries.length} enquiries into MySQL.`);

    // ─── 3. Migrate Students, Attendance, and Payments ───────────────────────
    console.log("\n[3/4] Migrating Students, Attendance, and Payments...");
    const mongoStudents = await db.collection("students").find().sort({ id: 1 }).toArray();
    console.log(`Found ${mongoStudents.length} students in MongoDB.`);

    let totalAttendanceRows = 0;
    let totalPaymentRows = 0;

    for (const s of mongoStudents) {
      const enrolledBookingMysqlId = s.enrolledFromBookingId
        ? bookingIdMap.get(s.enrolledFromBookingId.toString()) || null
        : null;

      const scheduleDays = Array.isArray(s.scheduleDays)
        ? s.scheduleDays
        : [0, 1, 2, 3, 4, 5, 6];

      await conn.execute(
        `INSERT INTO students (
          id, name, email, phone, class_type, group_name, instructor, instructor_status,
          country, timezone, duration, fee, class_time_ist, schedule_days, joining_date,
          last_payment_date, class_link, goals, language, username, password,
          welcome_email_status, welcome_email_sent_at, welcome_email_error,
          enrolled_from_booking_id, enrolled_from_enquiry_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          phone = VALUES(phone),
          password = VALUES(password),
          welcome_email_status = VALUES(welcome_email_status),
          last_payment_date = VALUES(last_payment_date)`,
        [
          s.id,
          s.name || "",
          s.email || "",
          s.phone || "",
          s.classType === "group" ? "group" : "private",
          s.groupName || null,
          s.instructor || "Rohan Mehta",
          s.instructorStatus || "assigned",
          s.country || "India",
          s.timezone || "Asia/Kolkata",
          s.duration || "1 Hour",
          Number(s.fee) || 3000,
          s.classTimeIST || "19:00",
          JSON.stringify(scheduleDays),
          s.joiningDate || "",
          s.lastPaymentDate || "",
          s.classLink || "",
          s.goals || "",
          s.language || "English",
          s.username || `student.${s.id}`,
          s.password,
          s.welcomeEmailStatus || "pending",
          s.welcomeEmailSentAt ? new Date(s.welcomeEmailSentAt) : null,
          s.welcomeEmailError || null,
          enrolledBookingMysqlId,
          s.enrolledFromEnquiryId || null,
          s.createdAt ? new Date(s.createdAt) : new Date(),
          s.updatedAt ? new Date(s.updatedAt) : new Date(),
        ]
      );

      // Attendance
      if (s.attendance && typeof s.attendance === "object") {
        const entries = Object.entries(s.attendance);
        for (const [date, status] of entries) {
          if (date && status) {
            await conn.execute(
              `INSERT INTO student_attendance (student_id, attendance_date, status)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE status = VALUES(status)`,
              [s.id, date, status]
            );
            totalAttendanceRows++;
          }
        }
      }

      // Payments
      if (Array.isArray(s.paymentHistory) && s.paymentHistory.length > 0) {
        for (const p of s.paymentHistory) {
          if (p && p.date && p.amount !== undefined) {
            await conn.execute(
              `INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method)
               VALUES (?, ?, ?, ?, ?)`,
              [
                s.id,
                p.date,
                Number(p.amount) || 0,
                p.note || "",
                p.paymentMethod || "UPI / Bank Transfer",
              ]
            );
            totalPaymentRows++;
          }
        }
      }
    }
    console.log(`✅ Processed ${mongoStudents.length} students, ${totalAttendanceRows} attendance entries, and ${totalPaymentRows} payment records.`);

    // ─── 4. Migrate Payment Settings ─────────────────────────────────────────
    console.log("\n[4/4] Migrating Payment Settings...");
    const mongoSettings = await db.collection("paymentsettings").findOne();
    if (mongoSettings) {
      await conn.execute(
        `INSERT INTO payment_settings (
          id, upi_id, payee_name, account_name, account_number, ifsc, bank_name, admin_whats_app
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          upi_id = VALUES(upi_id),
          payee_name = VALUES(payee_name),
          account_name = VALUES(account_name),
          account_number = VALUES(account_number),
          ifsc = VALUES(ifsc),
          bank_name = VALUES(bank_name),
          admin_whats_app = VALUES(admin_whats_app)`,
        [
          mongoSettings.upiId || "yogaonlive@upi",
          mongoSettings.payeeName || "yogaonlive Studio",
          mongoSettings.accountName || "yogaonlive",
          mongoSettings.accountNumber || "000000000000",
          mongoSettings.ifsc || "ABCD0123456",
          mongoSettings.bankName || "State Bank of India",
          mongoSettings.adminWhatsApp || "+91 90000 00000",
        ]
      );

      if (mongoSettings.groupClassLinks && typeof mongoSettings.groupClassLinks === "object") {
        for (const [key, url] of Object.entries(mongoSettings.groupClassLinks)) {
          if (key && url) {
            await conn.execute(
              `INSERT INTO payment_settings_group_links (cohort_key, meet_url)
               VALUES (?, ?)
               ON DUPLICATE KEY UPDATE meet_url = VALUES(meet_url)`,
              [key, url]
            );
          }
        }
      }
      console.log("✅ Payment settings migrated.");
    }

    // ─── Summary Report ──────────────────────────────────────────────────────
    console.log("\n==================================================");
    console.log("           MIGRATION SUMMARY AUDIT");
    console.log("==================================================");
    const [sAudit] = await conn.execute("SELECT COUNT(*) AS c FROM students");
    const [aAudit] = await conn.execute("SELECT COUNT(*) AS c FROM student_attendance");
    const [pAudit] = await conn.execute("SELECT COUNT(*) AS c FROM student_payments");
    const [bAudit] = await conn.execute("SELECT COUNT(*) AS c FROM bookings");
    const [eAudit] = await conn.execute("SELECT COUNT(*) AS c FROM enquiries");

    console.log(`Students in MySQL:           ${sAudit[0].c}`);
    console.log(`Student Attendance Rows:     ${aAudit[0].c}`);
    console.log(`Student Payments Rows:       ${pAudit[0].c}`);
    console.log(`Bookings in MySQL:           ${bAudit[0].c}`);
    console.log(`Enquiries in MySQL:          ${eAudit[0].c}`);
    console.log("==================================================");
    console.log("🎉 MIGRATION COMPLETE! MySQL database is fully synced with MongoDB Atlas.");
  } finally {
    conn.release();
    await mongoose.disconnect();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
