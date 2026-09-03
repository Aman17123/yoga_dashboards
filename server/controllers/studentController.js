import { Student } from "../models/Student.js";
import { Enquiry } from "../models/Enquiry.js";

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

    // Get highest current ID
    const maxStudent = await Student.findOne().sort({ id: -1 });
    const nextId = maxStudent ? maxStudent.id + 1 : 1;

    const newStudent = new Student({
      id: nextId,
      ...formData,
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

    return res.status(201).json(newStudent.toJSON());
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({ error: "Failed to create student record." });
  }
}

export async function updateStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const formData = req.body;

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

    const updated = await Student.findOneAndUpdate({ id }, formData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Student not found." });
    }

    return res.json(updated.toJSON());
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ error: "Failed to update student record." });
  }
}

export async function deleteStudent(req, res) {
  try {
    const id = Number(req.params.id);
    const deleted = await Student.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: "Student not found." });
    }
    return res.json({ success: true, message: `${deleted.name} was removed.` });
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
    return res.json(student.toJSON());
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
    return res.json(student.toJSON());
  } catch (error) {
    console.error("Error recording payment:", error);
    return res.status(500).json({ error: "Failed to record payment." });
  }
}
