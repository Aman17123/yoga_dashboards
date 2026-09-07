import { Router } from "express";
import * as authController from "../controllers/authController.js";
import * as studentController from "../controllers/studentController.js";
import * as enquiryController from "../controllers/enquiryController.js";
import * as settingsController from "../controllers/settingsController.js";
import * as bookingController from "../controllers/bookingController.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "yogaonlive API",
  });
});

// Authentication
router.post("/auth/login", authController.login);
router.post("/auth/quick-login", authController.quickLogin);

// Students
router.get("/students", studentController.getAllStudents);
router.get("/students/:id", studentController.getStudentById);
router.post("/students", studentController.createStudent);
router.put("/students/:id", studentController.updateStudent);
router.delete("/students/:id", studentController.deleteStudent);
router.patch("/students/:id/attendance", studentController.toggleAttendance);
router.post("/students/:id/payments", studentController.recordPayment);

// Enquiries
router.get("/enquiries", enquiryController.getAllEnquiries);
router.post("/enquiries", enquiryController.createEnquiry);
router.patch("/enquiries/:id/status", enquiryController.updateEnquiryStatus);

// Bookings (from external yoga websites)
router.get("/bookings", bookingController.getAllBookings);
router.post("/bookings", bookingController.createBooking);
router.get("/bookings/email-status", bookingController.getEmailStatus);
router.post("/bookings/test-email", bookingController.sendTestEmail);
router.get("/bookings/:id", bookingController.getBookingById);
router.patch("/bookings/:id/status", bookingController.updateBookingStatus);

// Settings
router.get("/settings/payment", settingsController.getPaymentSettings);
router.put("/settings/payment", settingsController.updatePaymentSettings);

export default router;
