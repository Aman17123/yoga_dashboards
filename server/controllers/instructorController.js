import { pool } from "../db/pool.js";
import { emitRealtimeEvent } from "../index.js";

const DEFAULT_INSTRUCTORS = [
  {
    id: 1,
    name: "Priya Nair",
    username: "priya.nair",
    password: "priya123",
    gender: "Female",
    phone: "9820012345",
    email: "priya.nair@yogaonlive.com",
    meetLink: "https://meet.google.com/pri-yano-ga1",
    zoomLink: "https://zoom.us/j/9820012345",
    language: "English",
    medium: "English",
    availabilitySchedule: "Daily: 7:00 am – 11:00 am, 5:00 pm – 8:30 pm IST",
    availableSlots: [
      "7:00 am - 8:00 am IST",
      "8:00 am - 9:00 am IST",
      "9:00 am - 10:00 am IST",
      "10:00 am - 11:00 am IST",
      "5:00 pm - 6:00 pm IST",
      "6:30 pm - 7:30 pm IST",
      "7:30 pm - 8:30 pm IST",
    ],
    assignedClasses: ["Morning Hatha Flow (7:00-8:00 am IST)"],
    profileImage: "/instructors/priya-nair.jpg",
    bio: "Certified Ashtanga & Vinyasa teacher with 8+ years experience. Specializes in alignment, prenatal modifications, and breathwork.",
    createdAt: "2026-01-10",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    username: "rohan.mehta",
    password: "rohan123",
    gender: "Male",
    phone: "9819023456",
    email: "rohan.mehta@yogaonlive.com",
    meetLink: "https://meet.google.com/roh-anme-hta2",
    zoomLink: "https://zoom.us/j/9819023456",
    language: "Hindi",
    medium: "Hindi",
    availabilitySchedule: "Daily: 5:00 am – 11:30 am, 4:00 pm – 8:00 pm IST",
    availableSlots: [
      "5:00 am - 6:00 am IST",
      "6:00 am - 7:00 am IST",
      "8:00 am - 9:00 am IST",
      "9:00 am - 10:00 am IST",
      "10:30 am - 11:30 am IST",
      "4:00 pm - 5:00 pm IST",
      "5:00 pm - 6:00 pm IST",
      "7:00 pm - 8:00 pm IST",
    ],
    assignedClasses: ["Pranayama & Spine Alignment (8:00-9:00 am IST)"],
    profileImage: "/instructors/rohan-mehta.jpg",
    bio: "Traditional Hatha Yoga and Pranayama expert. Focuses on physical endurance, joint mobility, and spine health.",
    createdAt: "2026-01-15",
  },
  {
    id: 3,
    name: "Meera Iyer",
    username: "meera.iyer",
    password: "meera123",
    gender: "Female",
    phone: "9833034567",
    email: "meera.iyer@yogaonlive.com",
    meetLink: "https://meet.google.com/mee-raiy-er3",
    zoomLink: "https://zoom.us/j/9833034567",
    language: "Hindi",
    medium: "Hindi",
    availabilitySchedule: "Daily: 6:00 am – 10:00 am, 4:00 pm – 8:00 pm IST",
    availableSlots: [
      "6:00 am - 7:00 am IST",
      "8:00 am - 9:00 am IST",
      "9:00 am - 10:00 am IST",
      "10:30 am - 11:30 am IST",
      "4:00 pm - 5:00 pm IST",
      "6:00 pm - 7:00 pm IST",
      "7:00 pm - 8:00 pm IST",
    ],
    assignedClasses: ["Evening Therapeutic Restorative (6:00-7:00 pm IST)"],
    profileImage: "/instructors/meera-iyer.jpg",
    bio: "Therapeutic yoga practitioner specializing in stress reduction, corporate wellness, and flexibility training.",
    createdAt: "2026-02-01",
  },
  {
    id: 4,
    name: "Kabir Khan",
    username: "kabir.khan",
    password: "kabir123",
    gender: "Male",
    phone: "9844045678",
    email: "kabir.khan@yogaonlive.com",
    meetLink: "https://meet.google.com/kab-irkh-an4",
    zoomLink: "https://zoom.us/j/9844045678",
    language: "English",
    medium: "English",
    availabilitySchedule: "Daily: 6:00 am – 10:30 am, 6:00 pm – 9:00 pm IST",
    availableSlots: [
      "6:00 am - 7:00 am IST",
      "7:00 am - 8:00 am IST",
      "8:00 am - 9:00 am IST",
      "6:00 pm - 7:00 pm IST",
      "6:30 pm - 7:30 pm IST",
      "7:00 pm - 8:00 pm IST",
      "7:30 pm - 8:30 pm IST",
    ],
    assignedClasses: ["Dynamic Power Vinyasa (7:00-8:00 pm IST)"],
    profileImage: "/instructors/kabir-khan.jpg",
    bio: "Power Yoga and functional movement instructor. Passionate about core strength, calisthenics mobility, and athletic balance.",
    createdAt: "2026-02-20",
  },
];

let memoryInstructors = [...DEFAULT_INSTRUCTORS];

function formatInstructorRow(row) {
  if (!row) return null;
  const rawLang = row.language || row.medium || "English";
  const cleanMedium = rawLang.toLowerCase().includes("hindi") ? "Hindi" : "English";
  const def = DEFAULT_INSTRUCTORS.find((d) => d.id === Number(row.id));

  return {
    id: row.id,
    name: row.name || "",
    username: row.username || "",
    password: row.password || "",
    gender: row.gender || "Female",
    phone: row.phone || "",
    email: row.email || "",
    meetLink: row.meet_link || row.meetLink || def?.meetLink || "",
    zoomLink: row.zoom_link || row.zoomLink || def?.zoomLink || "https://zoom.us/j/9833034567",
    language: cleanMedium,
    medium: cleanMedium,
    availabilitySchedule: row.availability_schedule || row.availabilitySchedule || def?.availabilitySchedule || "Daily: Morning & Evening IST",
    availableSlots: row.available_slots || row.availableSlots || def?.availableSlots || [
      "7:00 am - 8:00 am IST",
      "6:30 pm - 7:30 pm IST",
      "7:30 pm - 8:30 pm IST",
    ],
    assignedClasses: row.assigned_classes || row.assignedClasses || def?.assignedClasses || [],
    profileImage: row.profile_image || row.profileImage || "",
    bio: row.bio || def?.bio || "",
    createdAt: row.created_at || new Date().toISOString().slice(0, 10),
  };
}

export async function getAllInstructors(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM instructors ORDER BY id ASC");
    if (rows && rows.length > 0) {
      const formatted = rows.map(formatInstructorRow);
      memoryInstructors = formatted;
      return res.json(formatted);
    }

    // Seed defaults into database if empty
    for (const inst of DEFAULT_INSTRUCTORS) {
      await pool.execute(
        `INSERT INTO instructors (
          id, name, username, password, gender, phone, email, meet_link, language, profile_image, bio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inst.id,
          inst.name,
          inst.username,
          inst.password,
          inst.gender,
          inst.phone,
          inst.email,
          inst.meetLink,
          inst.language,
          inst.profileImage || null,
          inst.bio,
        ]
      ).catch(() => {});
    }

    return res.json(DEFAULT_INSTRUCTORS);
  } catch (error) {
    console.warn("[Instructors] MySQL query failed, using memory store:", error.message);
    return res.json(memoryInstructors);
  }
}

export async function createInstructor(req, res) {
  try {
    const data = req.body || {};
    let nextId = Date.now();

    try {
      const [maxRows] = await pool.execute("SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM instructors");
      if (maxRows && maxRows[0]?.nextId) {
        nextId = maxRows[0].nextId;
      }

      await pool.execute(
        `INSERT INTO instructors (
          id, name, username, password, gender, phone, email, meet_link, language, profile_image, bio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          (data.name || "").trim(),
          (data.username || "").trim(),
          data.password || "",
          data.gender || "Female",
          (data.phone || "").trim(),
          (data.email || "").trim(),
          (data.meetLink || "").trim(),
          data.language || "Both",
          data.profileImage || null,
          (data.bio || "").trim(),
        ]
      );
    } catch (dbErr) {
      console.warn("[Instructors] MySQL insert failed, fallback to memory:", dbErr.message);
    }

    const created = {
      id: nextId,
      name: (data.name || "").trim(),
      username: (data.username || "").trim(),
      password: data.password || "",
      gender: data.gender || "Female",
      phone: (data.phone || "").trim(),
      email: (data.email || "").trim(),
      meetLink: (data.meetLink || "").trim(),
      language: data.language || "Both",
      profileImage: data.profileImage || "",
      bio: (data.bio || "").trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    memoryInstructors.unshift(created);
    emitRealtimeEvent("instructor:created", { instructor: created });

    return res.status(201).json({
      message: `Instructor "${created.name}" created successfully.`,
      instructor: created,
    });
  } catch (error) {
    console.error("Error creating instructor:", error);
    return res.status(500).json({ error: "Failed to create instructor." });
  }
}

export async function updateInstructor(req, res) {
  try {
    const id = Number(req.params.id);
    const data = req.body || {};

    try {
      await pool.execute(
        `UPDATE instructors SET
          name = ?,
          username = ?,
          gender = ?,
          phone = ?,
          email = ?,
          meet_link = ?,
          language = ?,
          profile_image = ?,
          bio = ?
        WHERE id = ?`,
        [
          (data.name || "").trim(),
          (data.username || "").trim(),
          data.gender || "Female",
          (data.phone || "").trim(),
          (data.email || "").trim(),
          (data.meetLink || "").trim(),
          data.language || "Both",
          data.profileImage || null,
          (data.bio || "").trim(),
          id,
        ]
      );

      if (data.password && data.password.trim()) {
        await pool.execute("UPDATE instructors SET password = ? WHERE id = ?", [data.password.trim(), id]);
      }
    } catch (dbErr) {
      console.warn("[Instructors] MySQL update failed, fallback to memory:", dbErr.message);
    }

    const updated = {
      id,
      name: (data.name || "").trim(),
      username: (data.username || "").trim(),
      gender: data.gender || "Female",
      phone: (data.phone || "").trim(),
      email: (data.email || "").trim(),
      meetLink: (data.meetLink || "").trim(),
      language: data.language || "Both",
      profileImage: data.profileImage || "",
      bio: (data.bio || "").trim(),
    };

    memoryInstructors = memoryInstructors.map((i) => (i.id === id ? { ...i, ...updated } : i));
    emitRealtimeEvent("instructor:updated", { instructor: updated });

    return res.json({
      message: `Instructor "${updated.name}" updated successfully.`,
      instructor: updated,
    });
  } catch (error) {
    console.error("Error updating instructor:", error);
    return res.status(500).json({ error: "Failed to update instructor." });
  }
}

export async function deleteInstructor(req, res) {
  try {
    const id = Number(req.params.id);
    try {
      await pool.execute("DELETE FROM instructors WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Instructors] MySQL delete failed, fallback to memory:", dbErr.message);
    }

    memoryInstructors = memoryInstructors.filter((i) => i.id !== id);
    emitRealtimeEvent("instructor:deleted", { id });

    return res.json({ message: "Instructor deleted successfully.", id });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    return res.status(500).json({ error: "Failed to delete instructor." });
  }
}
