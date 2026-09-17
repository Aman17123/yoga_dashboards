import { pool } from "../db/pool.js";
import { emitRealtimeEvent } from "../index.js";

export function normalizeTimeSlot(slot) {
  if (!slot) return "6:00-7:00 am";
  const str = String(slot).trim();
  const map = {
    "5:00 AM": "5:00-6:00 am",
    "5:30 AM": "5:30-6:30 am",
    "6:00 AM": "6:00-7:00 am",
    "6:30 AM": "6:30-7:30 am",
    "7:00 AM": "7:00-8:00 am",
    "7:30 AM": "7:30-8:30 am",
    "8:00 AM": "8:00-9:00 am",
    "8:30 AM": "8:30-9:30 am",
    "9:00 AM": "9:00-10:00 am",
    "9:30 AM": "9:30-10:30 am",
    "10:00 AM": "10:00-11:00 am",
    "10:30 AM": "10:30-11:30 am",
    "11:00 AM": "11:00 am-12:00 pm",
    "11:30 AM": "11:30 am-12:30 pm",
    "12:00 PM": "12:00-1:00 pm",
    "4:00 PM": "4:00-5:00 pm",
    "4:30 PM": "4:30-5:30 pm",
    "5:00 PM": "5:00-6:00 pm",
    "5:30 PM": "5:30-6:30 pm",
    "6:00 PM": "6:00-7:00 pm",
    "6:30 PM": "6:30-7:30 pm",
    "7:00 PM": "7:00-8:00 pm",
    "7:30 PM": "7:30-8:30 pm",
    "8:00 PM": "8:00-9:00 pm",
    "8:30 PM": "8:30-9:30 pm",
    "9:00 PM": "9:00-10:00 pm",
  };
  return map[str] || str;
}

// Initial seed classes if database is unpopulated or in fallback mode
const DEFAULT_CLASSES = [
  {
    id: 1,
    title: "Morning Hatha Flow",
    timeSlot: "7:00-8:00 am",
    days: ["Mon", "Wed", "Fri"],
    instructorId: 1,
    instructorName: "Priya Nair",
    classType: "group",
    meetingLink: "https://meet.google.com/pri-yano-ga1",
    language: "Both",
    maxCapacity: 15,
    notes: "Gentle breathwork followed by classic Surya Namaskar sequences.",
    status: "assigned",
  },
  {
    id: 2,
    title: "Pranayama & Spine Alignment",
    timeSlot: "8:00-9:00 am",
    days: ["Tue", "Thu", "Sat"],
    instructorId: 2,
    instructorName: "Rohan Mehta",
    classType: "group",
    meetingLink: "https://meet.google.com/roh-anme-hta2",
    language: "Hindi",
    maxCapacity: 20,
    notes: "Deep restorative breathing and functional core postural stabilization.",
    status: "assigned",
  },
  {
    id: 3,
    title: "Evening Therapeutic Restorative",
    timeSlot: "6:00-7:00 pm",
    days: ["Mon", "Wed", "Fri"],
    instructorId: 3,
    instructorName: "Meera Iyer",
    classType: "group",
    meetingLink: "https://zoom.us/j/9833034567",
    language: "Both",
    maxCapacity: 12,
    notes: "De-stressing yin yoga with targeted joint mobility and meditation.",
    status: "assigned",
  },
  {
    id: 4,
    title: "Dynamic Power Vinyasa",
    timeSlot: "7:00-8:00 pm",
    days: ["Tue", "Thu"],
    instructorId: 4,
    instructorName: "Kabir Khan",
    classType: "group",
    meetingLink: "https://meet.google.com/kab-irkh-an4",
    language: "English",
    maxCapacity: 15,
    notes: "Cardio-intensive strength and balance flow for intermediate practitioners.",
    status: "assigned",
  },
  {
    id: 5,
    title: "Weekend Sunrise Ashtanga",
    timeSlot: "6:30-7:30 am",
    days: ["Sat", "Sun"],
    instructorId: null,
    instructorName: "",
    classType: "group",
    meetingLink: "",
    language: "English",
    maxCapacity: 25,
    notes: "Open weekend cohort — instructor assignment pending.",
    status: "free",
  },
  {
    id: 6,
    title: "Private 1:1 Remedial Assessment",
    timeSlot: "11:00 am-12:00 pm",
    days: ["Mon", "Wed"],
    instructorId: null,
    instructorName: "",
    classType: "private",
    meetingLink: "",
    language: "Both",
    maxCapacity: 1,
    notes: "Dedicated private 1:1 evaluation slot open for booking.",
    status: "free",
  },
];

// In-memory cache to ensure zero-downtime if MySQL connection is unavailable
let memoryClasses = [...DEFAULT_CLASSES];

function formatClassRow(row) {
  if (!row) return null;
  let parsedDays = [];
  try {
    parsedDays = typeof row.days === "string" ? JSON.parse(row.days) : (row.days || []);
  } catch {
    parsedDays = [];
  }

  return {
    id: row.id,
    title: row.title || "Untitled Class",
    timeSlot: normalizeTimeSlot(row.time_slot || row.timeSlot || "7:00-8:00 am"),
    days: Array.isArray(parsedDays) ? parsedDays : [],
    instructorId: row.instructor_id || row.instructorId || null,
    instructorName: row.instructor_name || row.instructorName || "",
    classType: row.class_type || row.classType || "group",
    meetingLink: row.meeting_link || row.meetingLink || "",
    language: row.language || "Both",
    maxCapacity: row.max_capacity !== undefined ? Number(row.max_capacity) : 15,
    notes: row.notes || "",
    status: (row.instructor_name || row.instructorName) ? "assigned" : "free",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function getAllClasses(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM classes ORDER BY id ASC");
    if (rows && rows.length > 0) {
      const formatted = rows.map(formatClassRow);
      memoryClasses = formatted;
      return res.json(formatted);
    }

    // Seed defaults into database if empty
    for (const c of DEFAULT_CLASSES) {
      await pool.execute(
        `INSERT INTO classes (
          id, title, time_slot, days, instructor_id, instructor_name,
          class_type, meeting_link, language, max_capacity, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.title,
          c.timeSlot,
          JSON.stringify(c.days),
          c.instructorId,
          c.instructorName,
          c.classType,
          c.meetingLink,
          c.language,
          c.maxCapacity,
          c.notes,
          c.status,
        ]
      ).catch(() => {});
    }

    return res.json(DEFAULT_CLASSES);
  } catch (error) {
    console.warn("[Classes] MySQL query failed, using memory store:", error.message);
    return res.json(memoryClasses);
  }
}

export async function createClass(req, res) {
  try {
    const data = req.body || {};
    const title = (data.title || "Untitled Class").trim();
    const timeSlot = normalizeTimeSlot(data.timeSlot || "7:00-8:00 am");
    const days = Array.isArray(data.days) ? data.days : [];
    const instructorId = data.instructorId || null;
    const instructorName = (data.instructorName || "").trim();
    const classType = data.classType === "private" ? "private" : "group";
    const meetingLink = (data.meetingLink || "").trim();
    const language = data.language || "Both";
    const maxCapacity = Number(data.maxCapacity) || 15;
    const notes = (data.notes || "").trim();
    const status = instructorName ? "assigned" : "free";

    let nextId = Date.now();

    try {
      const [maxRows] = await pool.execute("SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM classes");
      if (maxRows && maxRows[0]?.nextId) {
        nextId = maxRows[0].nextId;
      }

      await pool.execute(
        `INSERT INTO classes (
          id, title, time_slot, days, instructor_id, instructor_name,
          class_type, meeting_link, language, max_capacity, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          title,
          timeSlot,
          JSON.stringify(days),
          instructorId,
          instructorName,
          classType,
          meetingLink,
          language,
          maxCapacity,
          notes,
          status,
        ]
      );
    } catch (dbErr) {
      console.warn("[Classes] MySQL insert failed, fallback to memory:", dbErr.message);
    }

    const created = {
      id: nextId,
      title,
      timeSlot,
      days,
      instructorId,
      instructorName,
      classType,
      meetingLink,
      language,
      maxCapacity,
      notes,
      status,
      createdAt: new Date().toISOString(),
    };

    memoryClasses.unshift(created);
    emitRealtimeEvent("class:created", { classItem: created });

    return res.status(201).json({
      message: `Class "${title}" created successfully.`,
      classItem: created,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({ error: "Failed to create class entry." });
  }
}

export async function updateClass(req, res) {
  try {
    const id = Number(req.params.id);
    const data = req.body || {};

    const title = (data.title || "Untitled Class").trim();
    const timeSlot = normalizeTimeSlot(data.timeSlot || "7:00-8:00 am");
    const days = Array.isArray(data.days) ? data.days : [];
    const instructorId = data.instructorId || null;
    const instructorName = (data.instructorName || "").trim();
    const classType = data.classType === "private" ? "private" : "group";
    const meetingLink = (data.meetingLink || "").trim();
    const language = data.language || "Both";
    const maxCapacity = Number(data.maxCapacity) || 15;
    const notes = (data.notes || "").trim();
    const status = instructorName ? "assigned" : "free";

    try {
      await pool.execute(
        `UPDATE classes SET
          title = ?,
          time_slot = ?,
          days = ?,
          instructor_id = ?,
          instructor_name = ?,
          class_type = ?,
          meeting_link = ?,
          language = ?,
          max_capacity = ?,
          notes = ?,
          status = ?
        WHERE id = ?`,
        [
          title,
          timeSlot,
          JSON.stringify(days),
          instructorId,
          instructorName,
          classType,
          meetingLink,
          language,
          maxCapacity,
          notes,
          status,
          id,
        ]
      );
    } catch (dbErr) {
      console.warn("[Classes] MySQL update failed, fallback to memory:", dbErr.message);
    }

    const updated = {
      id,
      title,
      timeSlot,
      days,
      instructorId,
      instructorName,
      classType,
      meetingLink,
      language,
      maxCapacity,
      notes,
      status,
    };

    memoryClasses = memoryClasses.map((c) => (c.id === id ? { ...c, ...updated } : c));
    emitRealtimeEvent("class:updated", { classItem: updated });

    return res.json({
      message: `Class "${title}" updated successfully.`,
      classItem: updated,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({ error: "Failed to update class entry." });
  }
}

export async function deleteClass(req, res) {
  try {
    const id = Number(req.params.id);
    try {
      await pool.execute("DELETE FROM classes WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Classes] MySQL delete failed, fallback to memory:", dbErr.message);
    }

    memoryClasses = memoryClasses.filter((c) => c.id !== id);
    emitRealtimeEvent("class:deleted", { id });

    return res.json({ message: "Class entry deleted successfully.", id });
  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({ error: "Failed to delete class entry." });
  }
}
