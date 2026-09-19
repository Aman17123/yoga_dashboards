import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import {
  getFullStudentById,
  getAllFullStudents,
} from "../db/serializer.js";
import { sendStudentWelcomeEmail } from "../utils/emailService.js";

// Helper: generate clean base username
function generateBaseUsername(name, email) {
  if (name && name.trim()) {
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, ".");
    const parts = clean.split(".").filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}.${parts[parts.length - 1]}`;
    if (parts.length === 1) return parts[0];
  }
  return email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") : "student";
}

// Helper: generate secure 10-char temporary password
function generateSecurePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$*";
  let pass = "";
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += digits[Math.floor(Math.random() * digits.length)];
  pass += special[Math.floor(Math.random() * special.length)];
  const all = upper + lower + digits + special;
  for (let i = 0; i < 6; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }
  return pass.split("").sort(() => 0.5 - Math.random()).join("");
}

// Helper: ensure unique username in database
async function getUniqueUsername(base) {
  let candidate = base;
  let counter = 1;
  while (true) {
    const [rows] = await pool.execute(
      "SELECT id FROM students WHERE username = ?",
      [candidate]
    );
    if (rows.length === 0) break;
    counter++;
    candidate = `${base}${counter}`;
  }
  return candidate;
}

export async function getAllStudents(req, res) {
  try {
    const students = await getAllFullStudents(pool);
    return res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ error: "Failed to retrieve student records." });
  }
}

export async function getStudentById(req, res) {
  try {
    const id = Number(req.params.id);
    const student = await getFullStudentById(pool, id);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    return res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({ error: "Failed to retrieve student record." });
  }
}

// ─── Automated Student Enrollment ────────────────────────────────────────────
export async function enrollStudent(req, res) {
  try {
    const { bookingId, enquiryId, ...customData } = req.body || {};

    let targetBooking = null;
    let targetEnquiry = null;

    if (bookingId) {
      const numBookingId = Number(bookingId);
      if (!isNaN(numBookingId)) {
        const [bRows] = await pool.execute(
          "SELECT * FROM bookings WHERE id = ?",
          [numBookingId]
        );
        if (bRows.length > 0) targetBooking = bRows[0];
      }
      if (!targetBooking && typeof bookingId === "string") {
        const [bRows] = await pool.execute(
          "SELECT * FROM bookings WHERE booking_ref = ?",
          [bookingId.trim()]
        );
        if (bRows.length > 0) targetBooking = bRows[0];
      }
      if (!targetBooking) {
        return res.status(404).json({ error: "Associated booking not found." });
      }
    }

    if (enquiryId) {
      const numEnquiryId = Number(enquiryId);
      if (!isNaN(numEnquiryId)) {
        const [eRows] = await pool.execute(
          "SELECT * FROM enquiries WHERE id = ?",
          [numEnquiryId]
        );
        if (eRows.length > 0) targetEnquiry = eRows[0];
      }
      if (!targetEnquiry) {
        return res.status(404).json({ error: "Associated inquiry not found." });
      }
    }

    // Resolve student data
    const name = (customData.name || targetBooking?.name || targetEnquiry?.name || "").trim();
    const email = (customData.email || targetBooking?.email || targetEnquiry?.email || "")
      .trim()
      .toLowerCase();
    const phone = (customData.phone || targetBooking?.phone || targetEnquiry?.phone || "").trim();
    const country = (customData.country || targetBooking?.country || targetEnquiry?.country || "India").trim();
    const timezone = customData.timezone || targetBooking?.timezone || "Asia/Kolkata";
    const classType =
      customData.classType ||
      targetBooking?.class_type ||
      (targetEnquiry?.class_type_interest === "group" ? "group" : "private");
    const groupName =
      classType === "group"
        ? (customData.groupName || targetBooking?.group_cohort || "Standard Cohort").trim()
        : null;

    let instructor = "Matching in Progress";
    let instructorStatus = "matching_in_progress";

    const requestedInstructor = customData.instructor ? String(customData.instructor).trim() : "";
    if (requestedInstructor && requestedInstructor !== "Matching in Progress" && requestedInstructor !== "matching_in_progress") {
      instructor = requestedInstructor;
      instructorStatus = "assigned";
    } else if (customData.instructorStatus === "assigned" && requestedInstructor) {
      instructor = requestedInstructor;
      instructorStatus = "assigned";
    } else if (targetBooking?.instructor_preference && targetBooking.instructor_preference !== "Any" && targetBooking.instructor_preference !== "Matching in Progress") {
      instructor = targetBooking.instructor_preference.trim();
      instructorStatus = "assigned";
    } else if (targetEnquiry?.instructor_preference && targetEnquiry.instructor_preference !== "Any" && targetEnquiry.instructor_preference !== "Matching in Progress") {
      if (targetEnquiry.instructor_preference === "Female") {
        instructor = "Priya Nair";
      } else if (targetEnquiry.instructor_preference === "Male") {
        instructor = "Rohan Mehta";
      } else {
        instructor = targetEnquiry.instructor_preference.trim();
      }
      instructorStatus = "assigned";
    }

    const classLink = (customData.classLink || "").trim();
    const goals = (customData.goals || targetBooking?.goals || targetEnquiry?.reason || targetBooking?.message || "").trim();
    const language = (customData.language || targetBooking?.language || "English").trim();
    const fee =
      Number(customData.fee) ||
      Number(targetBooking?.fee) ||
      (classType === "private" ? 4000 : 2500);
    const classTimeIST =
      customData.classTimeIST ||
      targetBooking?.preferred_time ||
      targetEnquiry?.preferred_timings ||
      "19:00";
    const scheduleDays = Array.isArray(customData.scheduleDays)
      ? customData.scheduleDays
      : [0, 1, 2, 3, 4, 5, 6];
    const joiningDate =
      customData.joiningDate ||
      targetBooking?.joining_date ||
      new Date().toISOString().split("T")[0];

    // Validation
    if (!name) {
      return res.status(400).json({ error: "Student full name is required for enrollment." });
    }
    if (!email) {
      return res.status(400).json({ error: "Student email is required for enrollment." });
    }

    // Duplicate account prevention
    const [existingStudentRows] = await pool.execute(
      "SELECT id, name FROM students WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
      [email]
    );
    if (existingStudentRows.length > 0) {
      const existing = existingStudentRows[0];
      return res.status(409).json({
        error: `A student account with email "${email}" already exists (${existing.name}, ID: #${existing.id}).`,
        existingStudentId: existing.id,
      });
    }

    // Resolve username
    let username;
    if (customData.username && String(customData.username).trim()) {
      const requestedUsername = String(customData.username).trim().toLowerCase();
      const [takenRows] = await pool.execute(
        "SELECT id FROM students WHERE username = ?",
        [requestedUsername]
      );
      if (takenRows.length > 0) {
        return res.status(409).json({
          error: `Username "${requestedUsername}" is already taken. Please choose a different one.`,
        });
      }
      username = requestedUsername;
    } else {
      const baseUsername = generateBaseUsername(name, email);
      username = await getUniqueUsername(baseUsername);
    }

    let temporaryPassword;
    if (customData.password && String(customData.password).trim()) {
      temporaryPassword = String(customData.password).trim();
    } else {
      temporaryPassword = generateSecurePassword();
    }

    console.log(`[Enrollment] Enrolling "${name}": username="${username}", password="${temporaryPassword}", instructor="${instructor}"`);

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Database insertion in transaction
    const conn = await pool.getConnection();
    let nextId = null;

    try {
      await conn.beginTransaction();

      const [insertStudentResult] = await conn.execute(
        `INSERT INTO students (
          name, email, phone, class_type, group_name, instructor, instructor_status,
          country, timezone, duration, fee, class_time_ist, schedule_days, joining_date,
          last_payment_date, class_link, goals, language, username, password,
          welcome_email_status, enrolled_from_booking_id, enrolled_from_enquiry_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          name,
          email,
          phone,
          classType,
          groupName,
          instructor,
          instructorStatus,
          country,
          timezone,
          customData.duration || "1 Hour",
          fee,
          classTimeIST,
          JSON.stringify(scheduleDays),
          joiningDate,
          joiningDate,
          classLink,
          goals,
          language,
          username,
          hashedPassword,
          targetBooking?.id || null,
          targetEnquiry?.id || null,
        ]
      );

      nextId = insertStudentResult.insertId;

      // Add initial payment record
      await conn.execute(
        `INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method)
         VALUES (?, ?, ?, 'Initial enrollment registration', 'UPI / Bank Transfer')`,
        [nextId, joiningDate, fee]
      );

      // Update booking
      if (targetBooking) {
        await conn.execute(
          `UPDATE bookings SET
            status = 'converted',
            enrolled_student_id = ?,
            enrollment_email_status = 'pending'
           WHERE id = ?`,
          [nextId, targetBooking.id]
        );
      }

      // Update enquiry
      if (targetEnquiry) {
        await conn.execute(
          `UPDATE enquiries SET
            status = 'accepted',
            converted_student_id = ?
           WHERE id = ?`,
          [nextId, targetEnquiry.id]
        );
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    // Send automatic welcome email with credentials
    let emailResult = null;
    try {
      emailResult = await sendStudentWelcomeEmail({
        student: { id: nextId, name, email, username },
        temporaryPassword,
        loginUrl: process.env.DASHBOARD_URL || "http://localhost:5173",
      });

      if (emailResult.success) {
        await pool.execute(
          "UPDATE students SET welcome_email_status = 'sent', welcome_email_sent_at = NOW(), welcome_email_error = NULL WHERE id = ?",
          [nextId]
        );
        if (targetBooking) {
          await pool.execute(
            "UPDATE bookings SET enrollment_email_status = 'sent', enrollment_email_error = NULL WHERE id = ?",
            [targetBooking.id]
          );
        }
      } else {
        await pool.execute(
          "UPDATE students SET welcome_email_status = 'failed', welcome_email_error = ? WHERE id = ?",
          [emailResult.error || "Email delivery failed", nextId]
        );
        if (targetBooking) {
          await pool.execute(
            "UPDATE bookings SET enrollment_email_status = 'failed', enrollment_email_error = ? WHERE id = ?",
            [emailResult.error || "Email delivery failed", targetBooking.id]
          );
        }
      }
    } catch (err) {
      console.error("[Enrollment] Error during email dispatch:", err);
      emailResult = { success: false, error: err.message };
      await pool.execute(
        "UPDATE students SET welcome_email_status = 'failed', welcome_email_error = ? WHERE id = ?",
        [err.message, nextId]
      );
      if (targetBooking) {
        await pool.execute(
          "UPDATE bookings SET enrollment_email_status = 'failed', enrollment_email_error = ? WHERE id = ?",
          [err.message, targetBooking.id]
        );
      }
    }

    const studentJson = await getFullStudentById(pool, nextId);

    return res.status(201).json({
      success: true,
      student: studentJson,
      emailStatus: emailResult,
      message: emailResult?.success
        ? "Student enrolled successfully. Login credentials have been sent to the student’s email."
        : "Student enrolled, but welcome email failed to send. You can retry sending credentials from the dashboard.",
    });
  } catch (error) {
    console.error("Error during student enrollment:", error);
    return res.status(500).json({
      error: "Failed to enroll student. Please try again.",
      detail: error.message,
    });
  }
}

// ─── Resend Welcome Email with New Credentials ───────────────────────────────
export async function resendWelcomeEmail(req, res) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.execute("SELECT * FROM students WHERE id = ?", [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Student record not found." });
    }
    const studentRow = rows[0];

    if (!studentRow.email) {
      return res.status(400).json({ error: "Student does not have an email address." });
    }

    // Generate fresh secure temporary password
    const newTempPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);

    await pool.execute(
      "UPDATE students SET password = ?, welcome_email_status = 'pending' WHERE id = ?",
      [hashedPassword, id]
    );

    // Dispatch email
    const emailResult = await sendStudentWelcomeEmail({
      student: { id: studentRow.id, name: studentRow.name, email: studentRow.email, username: studentRow.username },
      temporaryPassword: newTempPassword,
      loginUrl: process.env.DASHBOARD_URL || "http://localhost:5173",
    });

    if (emailResult.success) {
      await pool.execute(
        "UPDATE students SET welcome_email_status = 'sent', welcome_email_sent_at = NOW(), welcome_email_error = NULL WHERE id = ?",
        [id]
      );
      if (studentRow.enrolled_from_booking_id) {
        await pool.execute(
          "UPDATE bookings SET enrollment_email_status = 'sent', enrollment_email_error = NULL WHERE id = ?",
          [studentRow.enrolled_from_booking_id]
        );
      }
    } else {
      await pool.execute(
        "UPDATE students SET welcome_email_status = 'failed', welcome_email_error = ? WHERE id = ?",
        [emailResult.error || "Email delivery failed", id]
      );
      if (studentRow.enrolled_from_booking_id) {
        await pool.execute(
          "UPDATE bookings SET enrollment_email_status = 'failed', enrollment_email_error = ? WHERE id = ?",
          [emailResult.error || "Email delivery failed", studentRow.enrolled_from_booking_id]
        );
      }
    }

    const studentJson = await getFullStudentById(pool, id);

    return res.json({
      success: emailResult.success,
      emailStatus: emailResult,
      student: studentJson,
      message: emailResult.success
        ? `Login credentials successfully resent to ${studentRow.email}.`
        : `Email delivery failed: ${emailResult.error}`,
    });
  } catch (error) {
    console.error("Error resending welcome email:", error);
    return res.status(500).json({ error: "Failed to resend welcome email.", detail: error.message });
  }
}

// ─── Regular CRUD with Real-Time Events & Password Hashing ───────────────────
export async function createStudent(req, res) {
  try {
    const { enquiryId, sendWelcomeEmail: shouldSendEmail, ...formData } = req.body || {};

    if (!formData.username) {
      return res.status(400).json({ error: "Username is required." });
    }

    // Check duplicate username
    const [existingUserRows] = await pool.execute(
      "SELECT id FROM students WHERE username = ?",
      [formData.username]
    );
    if (existingUserRows.length > 0) {
      return res.status(400).json({
        error: "That username is already taken — please choose another.",
      });
    }

    // Check duplicate email
    if (formData.email) {
      const [existingEmailRows] = await pool.execute(
        "SELECT id FROM students WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
        [formData.email]
      );
      if (existingEmailRows.length > 0) {
        return res.status(409).json({
          error: `A student with email "${formData.email}" already exists.`,
        });
      }
    }

    let plainTextPassword = (formData.password || "").trim() || generateSecurePassword();
    let passwordToStore = plainTextPassword;
    if (!passwordToStore.startsWith("$2a$") && !passwordToStore.startsWith("$2b$")) {
      passwordToStore = await bcrypt.hash(passwordToStore, 10);
    } else {
      plainTextPassword = null;
    }

    const scheduleDays = Array.isArray(formData.scheduleDays)
      ? formData.scheduleDays
      : [0, 1, 2, 3, 4, 5, 6];

    const [insertResult] = await pool.execute(
      `INSERT INTO students (
        name, email, phone, class_type, group_name, instructor, instructor_status,
        country, timezone, duration, fee, class_time_ist, schedule_days, joining_date,
        last_payment_date, class_link, goals, language, username, password,
        welcome_email_status, enrolled_from_booking_id, enrolled_from_enquiry_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?)`,
      [
        formData.name ? String(formData.name).trim() : "",
        formData.email ? String(formData.email).trim() : "",
        formData.phone ? String(formData.phone).trim() : "",
        formData.classType === "group" ? "group" : "private",
        formData.groupName || null,
        formData.instructor || "Rohan Mehta",
        formData.instructorStatus || "assigned",
        formData.country || "India",
        formData.timezone || "Asia/Kolkata",
        formData.duration || "1 Hour",
        Number(formData.fee) || 3000,
        formData.classTimeIST || "19:00",
        JSON.stringify(scheduleDays),
        formData.joiningDate || "",
        formData.lastPaymentDate || "",
        formData.classLink || "",
        formData.goals || "",
        formData.language || "English",
        formData.username,
        passwordToStore,
        enquiryId ? Number(enquiryId) : null,
      ]
    );

    const nextId = insertResult.insertId;

    if (formData.lastPaymentDate) {
      await pool.execute(
        `INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method)
         VALUES (?, ?, ?, 'Initial registration payment', 'UPI / Bank Transfer')`,
        [nextId, formData.lastPaymentDate, Number(formData.fee) || 3000]
      );
    }

    // If converted from enquiry, update enquiry status
    if (enquiryId) {
      await pool.execute(
        "UPDATE enquiries SET status = 'accepted', converted_student_id = ? WHERE id = ?",
        [nextId, Number(enquiryId)]
      );
    }

    // Send welcome email with login credentials if requested
    let emailResult = null;
    if (shouldSendEmail && plainTextPassword && formData.email) {
      try {
        emailResult = await sendStudentWelcomeEmail({
          student: { id: nextId, name: formData.name, email: formData.email, username: formData.username },
          temporaryPassword: plainTextPassword,
          loginUrl: process.env.DASHBOARD_URL || "http://localhost:5173",
        });

        if (emailResult.success) {
          await pool.execute(
            "UPDATE students SET welcome_email_status = 'sent', welcome_email_sent_at = NOW(), welcome_email_error = NULL WHERE id = ?",
            [nextId]
          );
        } else {
          await pool.execute(
            "UPDATE students SET welcome_email_status = 'failed', welcome_email_error = ? WHERE id = ?",
            [emailResult.error || "Email delivery failed", nextId]
          );
        }
      } catch (err) {
        console.error("[createStudent] Error during email dispatch:", err);
        emailResult = { success: false, error: err.message };
        await pool.execute(
          "UPDATE students SET welcome_email_status = 'failed', welcome_email_error = ? WHERE id = ?",
          [err.message, nextId]
        );
      }
    }

    const studentJson = await getFullStudentById(pool, nextId);

    return res.status(201).json({
      success: true,
      student: studentJson,
      emailStatus: emailResult,
      message: shouldSendEmail
        ? emailResult?.success
          ? `Student enrolled successfully. Login credentials have been sent to ${formData.email}.`
          : `Student enrolled, but welcome email failed to send: ${emailResult?.error || "Check SMTP settings."}`
        : "Student enrolled successfully.",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({ error: "Failed to create student record." });
  }
}

export async function updateStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const formData = { ...req.body };

    const [existingRows] = await pool.execute("SELECT * FROM students WHERE id = ?", [id]);
    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Check duplicate username if username is changing
    if (formData.username) {
      const [dupRows] = await pool.execute(
        "SELECT id FROM students WHERE username = ? AND id != ?",
        [formData.username, id]
      );
      if (dupRows.length > 0) {
        return res.status(400).json({
          error: "That username is already taken by another student.",
        });
      }
    }

    // Hash password if updating password
    let passwordHash = null;
    if (formData.password && typeof formData.password === "string" && formData.password.trim()) {
      if (!formData.password.startsWith("$2a$") && !formData.password.startsWith("$2b$")) {
        passwordHash = await bcrypt.hash(formData.password.trim(), 10);
      } else {
        passwordHash = formData.password.trim();
      }
    }

    let instructorStatus = undefined;
    if (formData.instructor !== undefined) {
      if (formData.instructor && formData.instructor !== "Matching in Progress") {
        instructorStatus = "assigned";
      } else {
        instructorStatus = "matching_in_progress";
      }
    }

    const fields = [];
    const values = [];

    const fieldMap = {
      name: "name",
      email: "email",
      phone: "phone",
      classType: "class_type",
      groupName: "group_name",
      instructor: "instructor",
      country: "country",
      timezone: "timezone",
      duration: "duration",
      fee: "fee",
      classTimeIST: "class_time_ist",
      joiningDate: "joining_date",
      lastPaymentDate: "last_payment_date",
      classLink: "class_link",
      goals: "goals",
      language: "language",
      username: "username",
      welcomeEmailStatus: "welcome_email_status",
    };

    for (const [jsKey, sqlCol] of Object.entries(fieldMap)) {
      if (formData[jsKey] !== undefined) {
        fields.push(`${sqlCol} = ?`);
        values.push(formData[jsKey]);
      }
    }

    if (formData.scheduleDays !== undefined) {
      fields.push("schedule_days = ?");
      values.push(JSON.stringify(formData.scheduleDays));
    }

    if (passwordHash) {
      fields.push("password = ?");
      values.push(passwordHash);
    }

    if (instructorStatus !== undefined) {
      fields.push("instructor_status = ?");
      values.push(instructorStatus);
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE students SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }

    const studentJson = await getFullStudentById(pool, id);

    return res.json(studentJson);
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ error: "Failed to update student record." });
  }
}

export async function deleteStudent(req, res) {
  try {
    const rawId = req.params.id;
    const numId = Number(rawId);
    if (isNaN(numId)) {
      return res.status(404).json({ error: "Student not found." });
    }

    const [rows] = await pool.execute("SELECT * FROM students WHERE id = ?", [numId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }
    const deleted = rows[0];

    // Clean up and restore references in Bookings
    try {
      await pool.execute(
        `UPDATE bookings SET
          enrolled_student_id = NULL,
          status = CASE WHEN status = 'converted' THEN 'confirmed' ELSE status END,
          enrollment_email_status = 'none',
          enrollment_email_error = NULL
         WHERE enrolled_student_id = ? OR id = ?`,
        [deleted.id, deleted.enrolled_from_booking_id || 0]
      );
    } catch (err) {
      console.error("Error unlinking booking on student delete:", err);
    }

    // Clean up and restore references in Enquiries
    try {
      await pool.execute(
        `UPDATE enquiries SET
          converted_student_id = NULL,
          status = CASE WHEN status = 'accepted' THEN 'pending' ELSE status END
         WHERE converted_student_id = ? OR id = ?`,
        [deleted.id, deleted.enrolled_from_enquiry_id || 0]
      );
    } catch (err) {
      console.error("Error unlinking enquiry on student delete:", err);
    }

    // Delete student (attendance and payments cascade delete via foreign keys)
    await pool.execute("DELETE FROM students WHERE id = ?", [deleted.id]);

    return res.json({
      success: true,
      message: `${deleted.name} and their user login account (username: ${deleted.username}) were permanently deleted.`,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({ error: "Failed to delete student record." });
  }
}

export async function resetStudentPassword(req, res) {
  try {
    const id = Number(req.params.id);
    const { newPassword, password, username } = req.body || {};

    const [rows] = await pool.execute("SELECT * FROM students WHERE id = ?", [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }
    const student = rows[0];

    let usernameUpdated = false;
    let passwordUpdated = false;
    let rawPassword = null;
    let newUsername = student.username;

    // Handle username update if provided
    if (username !== undefined && username !== null) {
      const cleanUsername = String(username).trim().toLowerCase();
      if (!cleanUsername || cleanUsername.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters long." });
      }
      if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
        return res.status(400).json({
          error: "Username can only contain lowercase letters, numbers, dots, hyphens, and underscores.",
        });
      }

      if (cleanUsername !== student.username) {
        const [dupRows] = await pool.execute(
          "SELECT id FROM students WHERE username = ? AND id != ?",
          [cleanUsername, id]
        );
        if (dupRows.length > 0) {
          return res.status(409).json({
            error: `Username "${cleanUsername}" is already taken by another student.`,
          });
        }
        newUsername = cleanUsername;
        usernameUpdated = true;
      }
    }

    // Handle password update if provided
    let newPasswordHash = student.password;
    const passCandidate = (newPassword || password || "").trim();
    if (passCandidate) {
      if (passCandidate.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      rawPassword = passCandidate;
      newPasswordHash = await bcrypt.hash(rawPassword, 10);
      passwordUpdated = true;
    }

    if (!usernameUpdated && !passwordUpdated) {
      if (newPassword === undefined && password === undefined && !username) {
        rawPassword = generateSecurePassword();
        newPasswordHash = await bcrypt.hash(rawPassword, 10);
        passwordUpdated = true;
      }
    }

    await pool.execute(
      "UPDATE students SET username = ?, password = ? WHERE id = ?",
      [newUsername, newPasswordHash, id]
    );

    const studentJson = await getFullStudentById(pool, id);

    let message = "Credentials updated successfully.";
    if (usernameUpdated && passwordUpdated) {
      message = `Username updated to "${newUsername}" and new password set successfully.`;
    } else if (usernameUpdated) {
      message = `Username updated to "${newUsername}".`;
    } else if (passwordUpdated) {
      message = `Password updated successfully for ${student.name} (${newUsername}).`;
    }

    return res.json({
      success: true,
      message,
      student: studentJson,
      temporaryPassword: rawPassword,
    });
  } catch (error) {
    console.error("Error resetting student credentials:", error);
    return res.status(500).json({ error: "Failed to update student credentials.", detail: error.message });
  }
}

export async function changeStudentPassword(req, res) {
  try {
    const id = Number(req.params.id);
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current password and new password are required." });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const [rows] = await pool.execute("SELECT * FROM students WHERE id = ?", [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }
    const student = rows[0];

    // Verify current password
    let isMatch = false;
    if (student.password.startsWith("$2a$") || student.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(currentPassword, student.password);
    } else {
      isMatch = student.password === currentPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ error: "Your current password does not match our records." });
    }

    // Hash and update with new password
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await pool.execute("UPDATE students SET password = ? WHERE id = ?", [hashedPassword, id]);

    const studentJson = await getFullStudentById(pool, id);

    return res.json({
      success: true,
      message: "Password changed successfully. You can now use your new password.",
    });
  } catch (error) {
    console.error("Error changing student password:", error);
    return res.status(500).json({ error: "Failed to change password.", detail: error.message });
  }
}

export async function toggleAttendance(req, res) {
  try {
    const id = Number(req.params.id);
    const { dateISO, status } = req.body || {};

    if (!dateISO) {
      return res.status(400).json({ error: "dateISO is required." });
    }

    const [sRows] = await pool.execute("SELECT id FROM students WHERE id = ?", [id]);
    if (!sRows || sRows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    if (!status) {
      await pool.execute(
        "DELETE FROM student_attendance WHERE student_id = ? AND attendance_date = ?",
        [id, dateISO]
      );
    } else {
      await pool.execute(
        `INSERT INTO student_attendance (student_id, attendance_date, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [id, dateISO, status]
      );
    }

    const studentJson = await getFullStudentById(pool, id);

    return res.json(studentJson);
  } catch (error) {
    console.error("Error toggling attendance:", error);
    return res.status(500).json({ error: "Failed to update attendance." });
  }
}

export async function recordPayment(req, res) {
  try {
    const id = Number(req.params.id);
    const { paymentDate, amount, note, paymentMethod, updatedHistory } = req.body || {};

    const [sRows] = await pool.execute("SELECT id FROM students WHERE id = ?", [id]);
    if (!sRows || sRows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    if (paymentDate) {
      await pool.execute(
        "UPDATE students SET last_payment_date = ? WHERE id = ?",
        [paymentDate, id]
      );
    }

    if (Array.isArray(updatedHistory)) {
      await pool.execute("DELETE FROM student_payments WHERE student_id = ?", [id]);
      for (const p of updatedHistory) {
        if (p && p.date && p.amount !== undefined) {
          await pool.execute(
            `INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              p.date,
              Number(p.amount) || 0,
              p.note || "",
              p.paymentMethod || "UPI / Bank Transfer",
            ]
          );
        }
      }
    } else if (paymentDate && amount) {
      await pool.execute(
        `INSERT INTO student_payments (student_id, payment_date, amount, note, payment_method)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          paymentDate,
          Number(amount),
          note || "Monthly practice fee",
          paymentMethod || "UPI / Bank Transfer",
        ]
      );
    }

    const studentJson = await getFullStudentById(pool, id);

    return res.json(studentJson);
  } catch (error) {
    console.error("Error recording payment:", error);
    return res.status(500).json({ error: "Failed to record payment." });
  }
}
