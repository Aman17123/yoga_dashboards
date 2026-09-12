import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Student } from "../models/Student.js";
import { emitRealtimeEvent } from "../index.js";
import {
  sendUserConfirmationEmail,
  sendAdminNotificationEmail,
  verifyEmailTransporter,
  testEmailTransporter,
} from "../utils/emailService.js";

function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── GET /api/bookings ────────────────────────────────────────────────────────
export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    return res.json(bookings);
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
        return res.status(400).json({ error: "Please enter a valid phone number with country code." });
      }
    }

    // Create booking record
    const booking = new Booking({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age: age?.toString().trim() || "",
      gender: gender?.trim() || "",
      phone: phone?.trim() || "",
      country: country?.trim() || "",
      timezone: timezone || "Asia/Kolkata",
      language: language?.trim() || "English",
      classType: classType === "private" ? "private" : "group",
      preferredTime: preferredTime?.trim() || "",
      preferredTime2: preferredTime2?.trim() || "",
      instructorPreference: instructorPreference?.trim() || "Any",
      groupCohort: groupCohort?.trim() || "",
      fee: Number(fee) || 0,
      goals: goals?.trim() || "",
      joiningDate: joiningDate?.trim() || "",
      message: message?.trim() || "",
      source: source?.trim() || "direct",
      referralUrl: referralUrl?.trim() || "",
      status: "pending",
    });

    await booking.save();

    // Send emails sequentially (user confirmation first, then admin notification)
    // Sequential dispatch avoids SMTP connection concurrency collisions on Gmail
    let userEmailResult = null;
    let adminEmailResult = null;

    try {
      userEmailResult = await sendUserConfirmationEmail(booking);
      if (userEmailResult?.success) {
        booking.confirmationEmailSent = true;
      }
    } catch (err) {
      console.error("[Booking] ❌ User confirmation email dispatch error:", err);
      userEmailResult = { error: err.message, recipient: booking.email };
    }

    try {
      adminEmailResult = await sendAdminNotificationEmail(booking);
      if (adminEmailResult?.success) {
        booking.adminEmailSent = true;
      }
    } catch (err) {
      console.error("[Booking] ❌ Admin notification email dispatch error:", err);
      adminEmailResult = { error: err.message };
    }

    if (booking.confirmationEmailSent || booking.adminEmailSent) {
      await booking.save();
    }

    const bookingJson = booking.toJSON();
    emitRealtimeEvent("booking:created", { booking: bookingJson });
    emitRealtimeEvent("stats:updated", {});

    return res.status(201).json({
      success: true,
      bookingRef: booking.bookingRef,
      booking: bookingJson,
      emailStatus: {
        userEmail: userEmailResult,
        adminEmail: adminEmailResult,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error.code === 11000) {
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

    const update = { status };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const booking = await Booking.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    const bookingJson = booking.toJSON();
    emitRealtimeEvent("booking:updated", { booking: bookingJson });
    emitRealtimeEvent("stats:updated", {});

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
    const booking = await Booking.findOne({ bookingRef: ref.trim() }).lean();
    if (!booking) {
      return res.status(404).json({ error: "Booking not found with this reference." });
    }
    return res.json({
      success: true,
      booking: {
        bookingRef: booking.bookingRef,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        classType: booking.classType,
        groupCohort: booking.groupCohort,
        preferredTime: booking.preferredTime,
        joiningDate: booking.joiningDate,
        createdAt: booking.createdAt,
        confirmationEmailSent: booking.confirmationEmailSent,
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
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }
    return res.json(booking);
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

    let booking = null;
    if (mongoose.isValidObjectId(id)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingRef: id });
    }
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    // Find student by enrolledStudentId or enrolledFromBookingId or email
    let student = null;
    if (booking.enrolledStudentId) {
      student = await Student.findOne({ id: booking.enrolledStudentId });
    }
    if (!student) {
      student = await Student.findOne({ enrolledFromBookingId: booking._id });
    }
    if (!student && booking.email) {
      student = await Student.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(booking.email.trim())}$`, "i") },
      });
    }

    let deletedStudentInfo = null;
    if (student) {
      deletedStudentInfo = {
        id: student.id,
        name: student.name,
        username: student.username,
      };
      await Student.findByIdAndDelete(student._id);
      emitRealtimeEvent("student:deleted", { id: student.id });
    }

    if (alsoDeleteBooking === "true" || alsoDeleteBooking === true) {
      await Booking.findByIdAndDelete(booking._id);
      emitRealtimeEvent("booking:deleted", { id: booking._id });
      emitRealtimeEvent("stats:updated", {});
      return res.json({
        success: true,
        bookingDeleted: true,
        message: deletedStudentInfo
          ? `Enrolled student ${deletedStudentInfo.name} (${deletedStudentInfo.username}) and booking record deleted.`
          : `Booking record deleted.`,
      });
    }

    // Reset booking to confirmed
    booking.enrolledStudentId = null;
    booking.status = "confirmed";
    booking.enrollmentEmailStatus = "none";
    booking.enrollmentEmailError = null;
    await booking.save();

    const bookingJson = booking.toJSON();
    emitRealtimeEvent("booking:updated", { booking: bookingJson });
    emitRealtimeEvent("stats:updated", {});

    return res.json({
      success: true,
      booking: bookingJson,
      message: deletedStudentInfo
        ? `Enrolled student ${deletedStudentInfo.name} and login credentials (${deletedStudentInfo.username}) permanently deleted. Booking restored to confirmed status.`
        : `Booking enrollment link cleared and restored to confirmed status.`,
    });
  } catch (error) {
    console.error("Error deleting enrolled student from booking:", error);
    return res.status(500).json({ error: "Failed to delete enrolled student.", detail: error.message });
  }
}

// ─── DELETE /api/bookings/:id ────────────────────────────────────────────────
export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const { deleteStudent } = req.query;

    let booking = null;
    if (mongoose.isValidObjectId(id)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingRef: id });
    }
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (deleteStudent === "true" || deleteStudent === true) {
      let student = null;
      if (booking.enrolledStudentId) {
        student = await Student.findOne({ id: booking.enrolledStudentId });
      }
      if (!student) {
        student = await Student.findOne({ enrolledFromBookingId: booking._id });
      }
      if (!student && booking.email) {
        student = await Student.findOne({
          email: { $regex: new RegExp(`^${escapeRegex(booking.email.trim())}$`, "i") },
        });
      }
      if (student) {
        await Student.findByIdAndDelete(student._id);
        emitRealtimeEvent("student:deleted", { id: student.id });
      }
    }

    await Booking.findByIdAndDelete(booking._id);
    emitRealtimeEvent("booking:deleted", { id: booking._id });
    emitRealtimeEvent("stats:updated", {});

    return res.json({
      success: true,
      message: `Booking ${booking.bookingRef || booking.name} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ error: "Failed to delete booking." });
  }
}

