import { pool } from "../db/pool.js";
import { formatEnquiry } from "../db/serializer.js";

async function findEnquiry(rawId) {
  const num = Number(rawId);
  if (!Number.isNaN(num)) {
    const [rows] = await pool.execute("SELECT * FROM enquiries WHERE id = ?", [
      num,
    ]);
    if (rows && rows.length > 0) return rows[0];
  }
  return null;
}

export async function getAllEnquiries(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM enquiries ORDER BY id ASC");
    return res.json(rows.map(formatEnquiry));
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return res.status(500).json({ error: "Failed to retrieve enquiries." });
  }
}

export async function createEnquiry(req, res) {
  try {
    const formData = req.body || {};
    const [maxRows] = await pool.execute(
      "SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM enquiries"
    );
    const nextId = maxRows[0]?.nextId || 1;

    const todayISO = new Date().toISOString().split("T")[0];
    const submittedDate = formData.submittedDate || todayISO;

    await pool.execute(
      `INSERT INTO enquiries (
        id, name, gender, age, height_weight, phone, email, country,
        class_type_interest, preferred_timings, demo_date, instructor_preference,
        reason, other_info, message, status, submitted_date, converted_student_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NULL)`,
      [
        nextId,
        formData.name ? String(formData.name).trim() : "",
        formData.gender || "",
        formData.age !== undefined && formData.age !== "" && !isNaN(Number(formData.age))
          ? Number(formData.age)
          : null,
        formData.heightWeight || "",
        formData.phone ? String(formData.phone).trim() : "",
        formData.email ? String(formData.email).trim() : "",
        formData.country || "India",
        formData.classTypeInterest === "group" ? "group" : "private",
        formData.preferredTimings || "",
        formData.demoDate || "",
        formData.instructorPreference || "Any",
        formData.reason || "",
        formData.otherInfo || "",
        formData.message || "",
        submittedDate,
      ]
    );

    const [rows] = await pool.execute(
      "SELECT * FROM enquiries WHERE id = ?",
      [nextId]
    );
    const enquiryJson = formatEnquiry(rows[0]);


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

    const enquiryRow = await findEnquiry(req.params.id);
    if (!enquiryRow) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    await pool.execute(
      "UPDATE enquiries SET status = ? WHERE id = ?",
      [status, enquiryRow.id]
    );

    const [rows] = await pool.execute(
      "SELECT * FROM enquiries WHERE id = ?",
      [enquiryRow.id]
    );
    const enquiryJson = formatEnquiry(rows[0]);


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

    const enquiryRow = await findEnquiry(req.params.id);
    if (!enquiryRow) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    // Find linked student
    let studentRow = null;
    if (enquiryRow.converted_student_id) {
      const [sRows] = await pool.execute(
        "SELECT * FROM students WHERE id = ?",
        [enquiryRow.converted_student_id]
      );
      if (sRows.length > 0) studentRow = sRows[0];
    }
    if (!studentRow) {
      const [sRows] = await pool.execute(
        "SELECT * FROM students WHERE enrolled_from_enquiry_id = ?",
        [enquiryRow.id]
      );
      if (sRows.length > 0) studentRow = sRows[0];
    }
    if (!studentRow && enquiryRow.email) {
      const [sRows] = await pool.execute(
        "SELECT * FROM students WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
        [enquiryRow.email]
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

    if (alsoDeleteEnquiry === "true" || alsoDeleteEnquiry === true) {
      await pool.execute("DELETE FROM enquiries WHERE id = ?", [enquiryRow.id]);
      return res.json({
        success: true,
        enquiryDeleted: true,
        message: deletedStudentInfo
          ? `Enrolled student ${deletedStudentInfo.name} (${deletedStudentInfo.username}) and enquiry record deleted.`
          : `Enquiry record deleted.`,
      });
    }

    // Reset enquiry to pending
    await pool.execute(
      "UPDATE enquiries SET converted_student_id = NULL, status = 'pending' WHERE id = ?",
      [enquiryRow.id]
    );

    const [updatedRows] = await pool.execute(
      "SELECT * FROM enquiries WHERE id = ?",
      [enquiryRow.id]
    );
    const enquiryJson = formatEnquiry(updatedRows[0]);


    return res.json({
      success: true,
      enquiry: enquiryJson,
      message: deletedStudentInfo
        ? `Enrolled student ${deletedStudentInfo.name} and login credentials (${deletedStudentInfo.username}) permanently deleted. Inquiry restored to pending status.`
        : `Inquiry enrollment link cleared and status set to pending.`,
    });
  } catch (error) {
    console.error("Error deleting enrolled student from enquiry:", error);
    return res.status(500).json({
      error: "Failed to delete enrolled student.",
      detail: error.message,
    });
  }
}

// ─── DELETE /api/enquiries/:id ───────────────────────────────────────────────
export async function deleteEnquiry(req, res) {
  try {
    const { deleteStudent } = req.query;

    const enquiryRow = await findEnquiry(req.params.id);
    if (!enquiryRow) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    if (deleteStudent === "true" || deleteStudent === true) {
      let studentRow = null;
      if (enquiryRow.converted_student_id) {
        const [sRows] = await pool.execute(
          "SELECT * FROM students WHERE id = ?",
          [enquiryRow.converted_student_id]
        );
        if (sRows.length > 0) studentRow = sRows[0];
      }
      if (!studentRow) {
        const [sRows] = await pool.execute(
          "SELECT * FROM students WHERE enrolled_from_enquiry_id = ?",
          [enquiryRow.id]
        );
        if (sRows.length > 0) studentRow = sRows[0];
      }
      if (!studentRow && enquiryRow.email) {
        const [sRows] = await pool.execute(
          "SELECT * FROM students WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
          [enquiryRow.email]
        );
        if (sRows.length > 0) studentRow = sRows[0];
      }
      if (studentRow) {
        await pool.execute("DELETE FROM students WHERE id = ?", [studentRow.id]);
      }
    }

    await pool.execute("DELETE FROM enquiries WHERE id = ?", [enquiryRow.id]);

    return res.json({
      success: true,
      message: `Enquiry #${enquiryRow.id} (${enquiryRow.name}) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return res.status(500).json({ error: "Failed to delete enquiry." });
  }
}
