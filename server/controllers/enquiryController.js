import mongoose from "mongoose";
import { Enquiry } from "../models/Enquiry.js";
import { Student } from "../models/Student.js";
import { emitRealtimeEvent } from "../index.js";

function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findEnquiry(rawId) {
  const num = Number(rawId);
  if (!Number.isNaN(num)) {
    const q = await Enquiry.findOne({ id: num });
    if (q) return q;
  }
  if (typeof rawId === "string" && rawId.match(/^[0-9a-fA-F]{24}$/)) {
    const q = await Enquiry.findById(rawId);
    if (q) return q;
  }
  return null;
}

export async function getAllEnquiries(req, res) {
  try {
    const enquiries = await Enquiry.find().sort({ id: 1 });
    return res.json(enquiries.map((q) => q.toJSON()));
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return res.status(500).json({ error: "Failed to retrieve enquiries." });
  }
}

export async function createEnquiry(req, res) {
  try {
    const formData = req.body;
    const maxEnquiry = await Enquiry.findOne().sort({ id: -1 });
    const nextId = maxEnquiry ? maxEnquiry.id + 1 : 1;

    const todayISO = new Date().toISOString().split("T")[0];

    const newEnquiry = new Enquiry({
      id: nextId,
      ...formData,
      status: "pending",
      submittedDate: formData.submittedDate || todayISO,
      convertedStudentId: null,
    });

    await newEnquiry.save();
    const enquiryJson = newEnquiry.toJSON();

    emitRealtimeEvent("enquiry:created", { enquiry: enquiryJson });
    emitRealtimeEvent("stats:updated", {});

    return res.status(201).json(enquiryJson);
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return res.status(500).json({ error: "Failed to create enquiry." });
  }
}

export async function updateEnquiryStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["pending", "in_progress", "accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid enquiry status." });
    }

    const enquiry = await findEnquiry(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    enquiry.status = status;
    await enquiry.save();

    const enquiryJson = enquiry.toJSON();
    emitRealtimeEvent("enquiry:updated", { enquiry: enquiryJson });
    emitRealtimeEvent("stats:updated", {});

    return res.json(enquiryJson);
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return res.status(500).json({ error: "Failed to update enquiry status." });
  }
}

// ─── DELETE /api/enquiries/:id/enrolled-student ──────────────────────────────
export async function deleteEnrolledStudentFromEnquiry(req, res) {
  try {
    const { alsoDeleteEnquiry } = req.query;

    const enquiry = await findEnquiry(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    let student = null;
    if (enquiry.convertedStudentId) {
      student = await Student.findOne({ id: enquiry.convertedStudentId });
    }
    if (!student) {
      student = await Student.findOne({ enrolledFromEnquiryId: enquiry.id });
    }
    if (!student && enquiry.email) {
      student = await Student.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(enquiry.email.trim())}$`, "i") },
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

    if (alsoDeleteEnquiry === "true" || alsoDeleteEnquiry === true) {
      await Enquiry.findByIdAndDelete(enquiry._id);
      emitRealtimeEvent("enquiry:deleted", { id: enquiry.id, _id: enquiry._id });
      emitRealtimeEvent("stats:updated", {});
      return res.json({
        success: true,
        enquiryDeleted: true,
        message: deletedStudentInfo
          ? `Enrolled student ${deletedStudentInfo.name} (${deletedStudentInfo.username}) and enquiry record deleted.`
          : `Enquiry record deleted.`,
      });
    }

    // Reset enquiry to pending
    enquiry.convertedStudentId = null;
    enquiry.status = "pending";
    await enquiry.save();

    const enquiryJson = enquiry.toJSON();
    emitRealtimeEvent("enquiry:updated", { enquiry: enquiryJson });
    emitRealtimeEvent("stats:updated", {});

    return res.json({
      success: true,
      enquiry: enquiryJson,
      message: deletedStudentInfo
        ? `Enrolled student ${deletedStudentInfo.name} and login credentials (${deletedStudentInfo.username}) permanently deleted. Inquiry restored to pending status.`
        : `Inquiry enrollment link cleared and status set to pending.`,
    });
  } catch (error) {
    console.error("Error deleting enrolled student from enquiry:", error);
    return res.status(500).json({ error: "Failed to delete enrolled student.", detail: error.message });
  }
}

// ─── DELETE /api/enquiries/:id ───────────────────────────────────────────────
export async function deleteEnquiry(req, res) {
  try {
    const { deleteStudent } = req.query;

    const enquiry = await findEnquiry(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    if (deleteStudent === "true" || deleteStudent === true) {
      let student = null;
      if (enquiry.convertedStudentId) {
        student = await Student.findOne({ id: enquiry.convertedStudentId });
      }
      if (!student) {
        student = await Student.findOne({ enrolledFromEnquiryId: enquiry.id });
      }
      if (!student && enquiry.email) {
        student = await Student.findOne({
          email: { $regex: new RegExp(`^${escapeRegex(enquiry.email.trim())}$`, "i") },
        });
      }
      if (student) {
        await Student.findByIdAndDelete(student._id);
        emitRealtimeEvent("student:deleted", { id: student.id });
      }
    }

    await Enquiry.findByIdAndDelete(enquiry._id);
    emitRealtimeEvent("enquiry:deleted", { id: enquiry.id, _id: enquiry._id });
    emitRealtimeEvent("stats:updated", {});

    return res.json({
      success: true,
      message: `Enquiry #${enquiry.id} (${enquiry.name}) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return res.status(500).json({ error: "Failed to delete enquiry." });
  }
}
