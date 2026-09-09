import bcrypt from "bcryptjs";
import { Student } from "../models/Student.js";
import { Enquiry } from "../models/Enquiry.js";
import { Booking } from "../models/Booking.js";
import { emitRealtimeEvent } from "../index.js";
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

// Helper: escape regex special characters
function escapeRegex(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  while (await Student.findOne({ username: candidate })) {
    counter++;
    candidate = `${base}${counter}`;
  }
  return candidate;
}

export async function getAllStudents(req, res) {
  try {
    const students = await Student.find().sort({ id: 1 });
    return res.json(students.map((s) => s.toJSON()));
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ error: "Failed to retrieve student records." });
  }
}

export async function getStudentById(req, res) {
  try {
    const id = Number(req.params.id);
    const student = await Student.findOne({ id });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    return res.json(student.toJSON());
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({ error: "Failed to retrieve student record." });
  }
}

// ─── Automated Student Enrollment ────────────────────────────────────────────
export async function enrollStudent(req, res) {
  try {
    const { bookingId, enquiryId, ...customData } = req.body;

    let targetBooking = null;
    let targetEnquiry = null;

    if (bookingId) {
      targetBooking = await Booking.findById(bookingId);
      if (!targetBooking) {
        return res.status(404).json({ error: "Associated booking not found." });
      }
    }

    if (enquiryId) {
      targetEnquiry = await Enquiry.findOne({ id: Number(enquiryId) });
      if (!targetEnquiry) {
        return res.status(404).json({ error: "Associated inquiry not found." });
      }
    }

    // Resolve student data from booking, enquiry, or direct payload
    const name = (customData.name || targetBooking?.name || targetEnquiry?.name || "").trim();
    const email = (customData.email || targetBooking?.email || targetEnquiry?.email || "")
      .trim()
      .toLowerCase();
    const phone = (customData.phone || targetBooking?.phone || targetEnquiry?.phone || "").trim();
    const country = (customData.country || targetBooking?.country || targetEnquiry?.country || "India").trim();
    const timezone = customData.timezone || targetBooking?.timezone || "Asia/Kolkata";
    const classType =
      customData.classType ||
      targetBooking?.classType ||
      (targetEnquiry?.classTypeInterest === "group" ? "group" : "private");
    const groupName =
      classType === "group"
        ? (customData.groupName || targetBooking?.groupCohort || "Standard Cohort").trim()
        : null;
    const instructor = (customData.instructor || targetBooking?.instructorPreference || "Rohan Mehta").trim();
    const fee =
      Number(customData.fee) ||
      Number(targetBooking?.fee) ||
      (classType === "private" ? 4000 : 2500);
    const classTimeIST =
      customData.classTimeIST ||
      targetBooking?.preferredTime ||
      targetEnquiry?.preferredTimings ||
      "19:00";
    const scheduleDays = Array.isArray(customData.scheduleDays)
      ? customData.scheduleDays
      : [0, 1, 2, 3, 4, 5, 6];
    const joiningDate =
      customData.joiningDate ||
      targetBooking?.joiningDate ||
      new Date().toISOString().split("T")[0];

    // Validation
    if (!name) {
      return res.status(400).json({ error: "Student full name is required for enrollment." });
    }
    if (!email) {
      return res.status(400).json({ error: "Student email is required for enrollment." });
    }

    // Duplicate account prevention
    const existingStudent = await Student.findOne({
      email: { $regex: new RegExp(`^${escapeRegex(email.trim())}$`, "i") },
    });
    if (existingStudent) {
      return res.status(409).json({
        error: `A student account with email "${email}" already exists (${existingStudent.name}, ID: #${existingStudent.id}).`,
        existingStudentId: existingStudent.id,
      });
    }

    // Auto-generate unique username and secure temporary password
    const baseUsername = generateBaseUsername(name, email);
    const username = await getUniqueUsername(baseUsername);
    const temporaryPassword = generateSecurePassword();

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Get next student ID
    const maxStudent = await Student.findOne().sort({ id: -1 });
    const nextId = maxStudent ? maxStudent.id + 1 : 1;

    // Create student instance
    const newStudent = new Student({
      id: nextId,
      name,
      email,
      phone,
      classType,
      groupName,
      instructor: instructor === "Any" ? "Rohan Mehta" : instructor,
      country,
      timezone,
      duration: customData.duration || "1 Hour",
      fee,
      classTimeIST,
      scheduleDays,
      joiningDate,
      lastPaymentDate: joiningDate,
      username,
      password: hashedPassword,
      welcomeEmailStatus: "pending",
      enrolledFromBookingId: targetBooking?._id || null,
      enrolledFromEnquiryId: targetEnquiry?.id || null,
      attendance: {},
      paymentHistory: [
        {
          date: joiningDate,
          amount: fee,
          note: "Initial enrollment registration",
          paymentMethod: "UPI / Bank Transfer",
        },
      ],
    });

    await newStudent.save();

    // Send automatic welcome email with credentials
    let emailResult = null;
    try {
      emailResult = await sendStudentWelcomeEmail({
        student: newStudent,
        temporaryPassword,
        loginUrl: process.env.DASHBOARD_URL || "http://localhost:5173",
      });

      if (emailResult.success) {
        newStudent.welcomeEmailStatus = "sent";
        newStudent.welcomeEmailSentAt = new Date();
        newStudent.welcomeEmailError = null;
      } else {
        newStudent.welcomeEmailStatus = "failed";
        newStudent.welcomeEmailError = emailResult.error || "Email delivery failed";
      }
      await newStudent.save();
    } catch (err) {
      console.error("[Enrollment] Error during email dispatch:", err);
      emailResult = { success: false, error: err.message };
      newStudent.welcomeEmailStatus = "failed";
      newStudent.welcomeEmailError = err.message;
      await newStudent.save();
    }

    // Update booking if applicable
    if (targetBooking) {
      targetBooking.status = "converted";
      targetBooking.enrolledStudentId = nextId;
      targetBooking.enrollmentEmailStatus = emailResult?.success ? "sent" : "failed";
      targetBooking.enrollmentEmailError = emailResult?.error || null;
      await targetBooking.save();
      emitRealtimeEvent("booking:updated", { booking: targetBooking.toJSON() });
    }

    // Update enquiry if applicable
    if (targetEnquiry) {
      targetEnquiry.status = "accepted";
      targetEnquiry.convertedStudentId = nextId;
      await targetEnquiry.save();
      emitRealtimeEvent("enquiry:updated", { enquiry: targetEnquiry.toJSON() });
    }

    const studentJson = newStudent.toJSON();

    // Real-time broadcast
    emitRealtimeEvent("student:enrolled", {
      student: studentJson,
      emailStatus: emailResult,
      bookingId: targetBooking?._id || null,
      enquiryId: targetEnquiry?.id || null,
    });
    emitRealtimeEvent("stats:updated", {});

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
    const student = await Student.findOne({ id });

    if (!student) {
      return res.status(404).json({ error: "Student record not found." });
    }

    if (!student.email) {
      return res.status(400).json({ error: "Student does not have an email address." });
    }

    // Generate fresh secure temporary password
    const newTempPassword = generateSecurePassword();
    student.password = await bcrypt.hash(newTempPassword, 10);
    student.welcomeEmailStatus = "pending";
    await student.save();

    // Dispatch email
    const emailResult = await sendStudentWelcomeEmail({
      student,
      temporaryPassword: newTempPassword,
      loginUrl: process.env.DASHBOARD_URL || "http://localhost:5173",
    });

    if (emailResult.success) {
      student.welcomeEmailStatus = "sent";
      student.welcomeEmailSentAt = new Date();
      student.welcomeEmailError = null;
    } else {
      student.welcomeEmailStatus = "failed";
      student.welcomeEmailError = emailResult.error || "Email delivery failed";
    }

    await student.save();

    // Update associated booking if linked
    if (student.enrolledFromBookingId) {
      await Booking.findByIdAndUpdate(student.enrolledFromBookingId, {
        enrollmentEmailStatus: student.welcomeEmailStatus,
        enrollmentEmailError: student.welcomeEmailError,
      });
    }

    const studentJson = student.toJSON();
    emitRealtimeEvent("student:updated", { student: studentJson });

    return res.json({
      success: emailResult.success,
      emailStatus: emailResult,
      student: studentJson,
      message: emailResult.success
        ? `Login credentials successfully resent to ${student.email}.`
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
    const { enquiryId, ...formData } = req.body;

    // Check duplicate username
    const existing = await Student.findOne({ username: formData.username });
    if (existing) {
      return res.status(400).json({
        error: "That username is already taken — please choose another.",
      });
    }

    // Check duplicate email
    if (formData.email) {
      const existingEmail = await Student.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(formData.email.trim())}$`, "i") },
      });
      if (existingEmail) {
        return res.status(409).json({
          error: `A student with email "${formData.email}" already exists.`,
        });
      }
    }

    // Hash password if provided
    let passwordToStore = formData.password || generateSecurePassword();
    if (!passwordToStore.startsWith("$2a$") && !passwordToStore.startsWith("$2b$")) {
      passwordToStore = await bcrypt.hash(passwordToStore, 10);
    }

    // Get highest current ID
    const maxStudent = await Student.findOne().sort({ id: -1 });
    const nextId = maxStudent ? maxStudent.id + 1 : 1;

    const newStudent = new Student({
      id: nextId,
      ...formData,
      password: passwordToStore,
      attendance: {},
      paymentHistory: formData.lastPaymentDate
        ? [
            {
              date: formData.lastPaymentDate,
              amount: formData.fee || 3000,
              note: "Initial registration payment",
              paymentMethod: "UPI / Bank Transfer",
            },
          ]
        : [],
    });

    await newStudent.save();

    // If converted from enquiry, update enquiry status
    if (enquiryId) {
      await Enquiry.findOneAndUpdate(
        { id: Number(enquiryId) },
        { status: "accepted", convertedStudentId: nextId }
      );
    }

    const studentJson = newStudent.toJSON();
    emitRealtimeEvent("student:enrolled", { student: studentJson });
    emitRealtimeEvent("stats:updated", {});

    return res.status(201).json(studentJson);
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({ error: "Failed to create student record." });
  }
}

export async function updateStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const formData = { ...req.body };

    // Check duplicate username if username is changing
    if (formData.username) {
      const duplicate = await Student.findOne({
        username: formData.username,
        id: { $ne: id },
      });
      if (duplicate) {
        return res.status(400).json({
          error: "That username is already taken by another student.",
        });
      }
    }

    // Hash password if updating password
    if (formData.password && !formData.password.startsWith("$2a$") && !formData.password.startsWith("$2b$")) {
      formData.password = await bcrypt.hash(formData.password, 10);
    }

    const updated = await Student.findOneAndUpdate({ id }, formData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Student not found." });
    }

    const studentJson = updated.toJSON();
    emitRealtimeEvent("student:updated", { student: studentJson });
    emitRealtimeEvent("stats:updated", {});

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
    let deleted = null;

    if (!isNaN(numId)) {
      deleted = await Student.findOneAndDelete({ id: numId });
    }
    if (!deleted && typeof rawId === "string" && rawId.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await Student.findByIdAndDelete(rawId);
    }

    if (!deleted) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Clean up references in Bookings and Enquiries
    await Booking.updateMany(
      { enrolledStudentId: deleted.id },
      { $set: { enrolledStudentId: null } }
    ).catch(() => {});
    await Enquiry.updateMany(
      { convertedStudentId: deleted.id },
      { $set: { convertedStudentId: null } }
    ).catch(() => {});

    emitRealtimeEvent("student:deleted", { id: deleted.id });
    emitRealtimeEvent("stats:updated", {});

    return res.json({
      success: true,
      message: `${deleted.name} and their user login account were permanently deleted.`,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({ error: "Failed to delete student record." });
  }
}

export async function toggleAttendance(req, res) {
  try {
    const id = Number(req.params.id);
    const { dateISO, status } = req.body;

    if (!dateISO) {
      return res.status(400).json({ error: "dateISO is required." });
    }

    const student = await Student.findOne({ id });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    if (!status) {
      student.attendance.delete(dateISO);
    } else {
      student.attendance.set(dateISO, status);
    }

    await student.save();
    const studentJson = student.toJSON();

    emitRealtimeEvent("student:updated", { student: studentJson });

    return res.json(studentJson);
  } catch (error) {
    console.error("Error toggling attendance:", error);
    return res.status(500).json({ error: "Failed to update attendance." });
  }
}

export async function recordPayment(req, res) {
  try {
    const id = Number(req.params.id);
    const { paymentDate, amount, note, paymentMethod, updatedHistory } = req.body;

    const student = await Student.findOne({ id });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    if (paymentDate) {
      student.lastPaymentDate = paymentDate;
    }

    if (Array.isArray(updatedHistory)) {
      student.paymentHistory = updatedHistory;
    } else if (paymentDate && amount) {
      student.paymentHistory.push({
        date: paymentDate,
        amount: Number(amount),
        note: note || "Monthly practice fee",
        paymentMethod: paymentMethod || "UPI / Bank Transfer",
      });
    }

    await student.save();
    const studentJson = student.toJSON();

    emitRealtimeEvent("student:updated", { student: studentJson });
    emitRealtimeEvent("stats:updated", {});

    return res.json(studentJson);
  } catch (error) {
    console.error("Error recording payment:", error);
    return res.status(500).json({ error: "Failed to record payment." });
  }
}
