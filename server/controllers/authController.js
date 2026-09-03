import { Student } from "../models/Student.js";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    // Check admin credentials
    if (
      username.trim() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      return res.json({
        success: true,
        session: { role: "admin" },
        user: { name: "Studio Administrator", role: "admin" },
      });
    }

    // Check student credentials in database
    const student = await Student.findOne({
      username: username.trim(),
      password: password,
    });

    if (student) {
      return res.json({
        success: true,
        session: { role: "student", id: student.id },
        user: student.toJSON(),
      });
    }

    return res.status(401).json({
      error: "That username or password doesn't match any registered account.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
}

export async function quickLogin(req, res) {
  try {
    const { role } = req.body;
    if (role === "admin") {
      return res.json({
        success: true,
        session: { role: "admin" },
        user: { name: "Studio Administrator", role: "admin" },
      });
    }

    // Default to first student
    const firstStudent = await Student.findOne().sort({ id: 1 });
    if (!firstStudent) {
      return res.status(404).json({ error: "No student records found." });
    }

    return res.json({
      success: true,
      session: { role: "student", id: firstStudent.id },
      user: firstStudent.toJSON(),
    });
  } catch (error) {
    console.error("Quick login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
