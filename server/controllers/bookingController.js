import { pool } from "../db/pool.js";
import { formatBooking } from "../db/serializer.js";
import {
  sendUserConfirmationEmail,
  sendAdminNotificationEmail,
  verifyEmailTransporter,
  testEmailTransporter,
} from "../utils/emailService.js";

async function findBooking(rawId) {
  const num = Number(rawId);
  if (!Number.isNaN(num)) {
    const [rows] = await pool.execute("SELECT * FROM bookings WHERE id = ?", [
      num,
    ]);
    if (rows && rows.length > 0) return rows[0];
  }
  if (typeof rawId === "string" && rawId.trim()) {
    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE booking_ref = ?",
      [rawId.trim()]
    );
    if (rows && rows.length > 0) return rows[0];
  }
  return null;
}

// ─── GET /api/bookings ────────────────────────────────────────────────────────
export async function getAllBookings(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    return res.json(rows.map(formatBooking));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Failed to fetch bookings." });
  }
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────
export async function createBooking(req, res) {
  try {
    const {
      name,
      email,
      age,
      gender,
      phone,
      country,
      timezone,
      language,
      classType,
      preferredTime,
      preferredTime2,
      instructorPreference,
      groupCohort,
      fee,
      goals,
      joiningDate,
      message,
      source,
      referralUrl,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (phone && phone.trim()) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 17) {
        return res
          .status(400)
          .json({ error: "Please enter a valid phone number with country code." });
      }
    }

    const mediumVal = (req.body.medium || language || "English").toString().trim();
    const cleanMedium = mediumVal.toLowerCase().includes("hindi") ? "Hindi" : "English";

    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const bookingRef = `YOL-${stamp}-${rand}`;

    const [insertResult] = await pool.execute(
      `INSERT INTO bookings (
        name, email, age, gender, phone, country, timezone, language,
        class_type, preferred_time, preferred_time2, instructor_preference,
        group_cohort, fee, goals, joining_date, message, source,
        referral_url, booking_ref, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        age?.toString().trim() || "",
        gender?.trim() || "",
        phone?.trim() || "",
        country?.trim() || "",
        timezone || "Asia/Kolkata",
        cleanMedium,
        classType === "private" ? "private" : "group",
        preferredTime?.trim() || "",
        preferredTime2?.trim() || "",
        instructorPreference?.trim() || "Any",
        groupCohort?.trim() || "",
        Number(fee) || 0,
        goals?.trim() || "",
        joiningDate?.trim() || "",
        message?.trim() || "",
        source?.trim() || "direct",
        referralUrl?.trim() || "",
        bookingRef,
      ]
    );

    const bookingId = insertResult.insertId;
    let [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ?",
      [bookingId]
    );
    let currentBooking = formatBooking(rows[0]);

    // Send emails sequentially (user confirmation first, then admin notification)
    let userEmailResult = null;
    let adminEmailResult = null;
    let userEmailSent = 0;
    let adminEmailSent = 0;

    try {
      userEmailResult = await sendUserConfirmationEmail(currentBooking);
      if (userEmailResult?.success) {
        userEmailSent = 1;
      }
    } catch (err) {
      console.error("[Booking] ❌ User confirmation email dispatch error:", err);
      userEmailResult = { error: err.message, recipient: currentBooking.email };
    }

    try {
      adminEmailResult = await sendAdminNotificationEmail(currentBooking);
      if (adminEmailResult?.success) {
        adminEmailSent = 1;
      }
    } catch (err) {
      console.error("[Booking] ❌ Admin notification email dispatch error:", err);
      adminEmailResult = { error: err.message };
    }

    if (userEmailSent || adminEmailSent) {
      await pool.execute(
        "UPDATE bookings SET confirmation_email_sent = ?, admin_email_sent = ? WHERE id = ?",
        [userEmailSent, adminEmailSent, bookingId]
      );
      [rows] = await pool.execute(
        "SELECT * FROM bookings WHERE id = ?",
        [bookingId]
      );
      currentBooking = formatBooking(rows[0]);
    }


    return res.status(201).json({
      success: true,
      bookingRef: currentBooking.bookingRef,
      booking: currentBooking,
      emailStatus: {
        userEmail: userEmailResult,
        adminEmail: adminEmailResult,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Duplicate booking reference. Please try again." });
    }
    return res.status(500).json({
      error: "Failed to save your booking. Please try again.",
      detail: error.message,
    });
  }
}

// ─── PATCH /api/bookings/:id/status ──────────────────────────────────────────
export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ["pending", "contacted", "confirmed", "converted", "declined"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const bookingRow = await findBooking(id);
    if (!bookingRow) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (adminNotes !== undefined) {
      await pool.execute(
        "UPDATE bookings SET status = ?, admin_notes = ? WHERE id = ?",
        [status, adminNotes, bookingRow.id]
      );
    } else {
      await pool.execute(
        "UPDATE bookings SET status = ? WHERE id = ?",
        [status, bookingRow.id]
      );
    }

    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ?",
      [bookingRow.id]
    );
    const bookingJson = formatBooking(rows[0]);


    return res.json({ success: true, booking: bookingJson });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ error: "Failed to update booking." });
  }
}

// ─── GET /api/bookings/ref/:ref ───────────────────────────────────────────────
export async function getBookingByRef(req, res) {
  try {
    const { ref } = req.params;
    if (!ref || !ref.trim()) {
      return res.status(400).json({ error: "Booking reference is required." });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE booking_ref = ?",
      [ref.trim()]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Booking not found with this reference." });
    }

    const booking = rows[0];
    return res.json({
      success: true,
      booking: {
        bookingRef: booking.booking_ref,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        classType: booking.class_type,
        groupCohort: booking.group_cohort,
        preferredTime: booking.preferred_time,
        joiningDate: booking.joining_date,
        createdAt: booking.created_at,
        confirmationEmailSent: Boolean(booking.confirmation_email_sent),
      },
    });
  } catch (error) {
    console.error("Error fetching booking by ref:", error);
    return res.status(500).json({ error: "Failed to verify booking reference." });
  }
}

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────
export async function getBookingById(req, res) {
  try {
    const bookingRow = await findBooking(req.params.id);
    if (!bookingRow) {
      return res.status(404).json({ error: "Booking not found." });
    }
    return res.json(formatBooking(bookingRow));
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ error: "Failed to fetch booking." });
  }
}

// ─── GET /api/bookings/email-status ──────────────────────────────────────────
export async function getEmailStatus(req, res) {
  try {
    const status = await verifyEmailTransporter();
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ─── POST /api/bookings/test-email ───────────────────────────────────────────
export async function sendTestEmail(req, res) {
  try {
    const { to } = req.body || {};
    const result = await testEmailTransporter(to);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ─── DELETE /api/bookings/:id/enrolled-student ───────────────────────────────
export async function deleteEnrolledStudentFromBooking(req, res) {
  try {
    const { id } = req.params;
    const { alsoDeleteBooking } = req.query;

    const bookingRow = await findBooking(id);
    if (!bookingRow) {
      return res.status(404).json({ error: "Booking not found." });
    }

    // Find student by enrolled_student_id or enrolled_from_booking_id or email
    let studentRow = null;
    if (bookingRow.enrolled_student_id) {
      const [sRows] = await pool.execute(
        "SELECT * FROM students WHERE id = ?",
        [bookingRow.enrolled_student_id]
      );
      if (sRows.length > 0) studentRow = sRows[0];
    }
    if (!studentRow) {
      const [sRows] = await pool.execute(
        "SELECT * FROM students WHERE enrolled_from_booking_id = ?",
        [bookingRow.id]
      );
      if (sRows.length > 0) studentRow = sRows[0];
    }
    if (!studentRow && bookingRow.email) {
      const [sRows] = await pool.execute(
        "SELECT * FROM students WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
        [bookingRow.email]
      );
      if (sRows.length > 0) studentRow = sRows[0];
    }

    let deletedStudentInfo = null;
    if (studentRow) {
      deletedStudentInfo = {
        id: studentRow.id,
        name: studentRow.name,
        username: studentRow.username,
      };
      await pool.execute("DELETE FROM students WHERE id = ?", [studentRow.id]);
    }

    if (alsoDeleteBooking === "true" || alsoDeleteBooking === true) {
      await pool.execute("DELETE FROM bookings WHERE id = ?", [bookingRow.id]);
      return res.json({
        success: true,
        bookingDeleted: true,
        message: deletedStudentInfo
          ? `Enrolled student ${deletedStudentInfo.name} (${deletedStudentInfo.username}) and booking record deleted.`
          : `Booking record deleted.`,
      });
    }

    // Reset booking to confirmed
    await pool.execute(
      `UPDATE bookings SET
        enrolled_student_id = NULL,
        status = 'confirmed',
        enrollment_email_status = 'none',
        enrollment_email_error = NULL
       WHERE id = ?`,
      [bookingRow.id]
    );

    const [updatedRows] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ?",
      [bookingRow.id]
    );
    const bookingJson = formatBooking(updatedRows[0]);


    return res.json({
      success: true,
      booking: bookingJson,
      message: deletedStudentInfo
        ? `Enrolled student ${deletedStudentInfo.name} and login credentials (${deletedStudentInfo.username}) permanently deleted. Booking restored to confirmed status.`
        : `Booking enrollment link cleared and restored to confirmed status.`,
    });
  } catch (error) {
    console.error("Error deleting enrolled student from booking:", error);
    return res.status(500).json({
      error: "Failed to delete enrolled student.",
      detail: error.message,
    });
  }
}

// ─── DELETE /api/bookings/:id ────────────────────────────────────────────────
export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const { deleteStudent } = req.query;

    const bookingRow = await findBooking(id);
    if (!bookingRow) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (deleteStudent === "true" || deleteStudent === true) {
      let studentRow = null;
      if (bookingRow.enrolled_student_id) {
        const [sRows] = await pool.execute(
          "SELECT * FROM students WHERE id = ?",
          [bookingRow.enrolled_student_id]
        );
        if (sRows.length > 0) studentRow = sRows[0];
      }
      if (!studentRow) {
        const [sRows] = await pool.execute(
          "SELECT * FROM students WHERE enrolled_from_booking_id = ?",
          [bookingRow.id]
        );
        if (sRows.length > 0) studentRow = sRows[0];
      }
      if (!studentRow && bookingRow.email) {
        const [sRows] = await pool.execute(
          "SELECT * FROM students WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
          [bookingRow.email]
        );
        if (sRows.length > 0) studentRow = sRows[0];
      }
      if (studentRow) {
        await pool.execute("DELETE FROM students WHERE id = ?", [studentRow.id]);
      }
    }

    await pool.execute("DELETE FROM bookings WHERE id = ?", [bookingRow.id]);

    return res.json({
      success: true,
      message: `Booking ${bookingRow.booking_ref || bookingRow.name} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ error: "Failed to delete booking." });
  }
}
