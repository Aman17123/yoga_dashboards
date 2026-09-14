import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { getFullStudentById } from "../db/serializer.js";

const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

const USER_CREDENTIALS = {
  username: process.env.USER_USERNAME || "user",
  password: process.env.USER_PASSWORD || "user123",
};

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const trimmedUsername = username.trim();

    // Check admin credentials
    if (
      trimmedUsername.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() &&
      password === ADMIN_CREDENTIALS.password
    ) {
      return res.json({
        success: true,
        session: { role: "admin" },
        user: { name: "Studio Administrator", role: "admin" },
      });
    }

    // Check dedicated user credentials (user / user123)
    if (
      trimmedUsername.toLowerCase() === USER_CREDENTIALS.username.toLowerCase() &&
      password === USER_CREDENTIALS.password
    ) {
      const [firstStudent] = await pool.execute(
        "SELECT id FROM students ORDER BY id ASC LIMIT 1"
      );
      const studentId = firstStudent && firstStudent.length > 0 ? firstStudent[0].id : 1;
      const fullStudent = await getFullStudentById(pool, studentId);
      return res.json({
        success: true,
        session: { role: "student", id: fullStudent.id },
        user: fullStudent,
      });
    }

    // Check student credentials in database
    const [rows] = await pool.execute(
      "SELECT * FROM students WHERE username = ?",
      [username.trim()]
    );

    if (rows && rows.length > 0) {
      const studentRow = rows[0];
      let isMatch = false;
      if (
        studentRow.password.startsWith("$2a$") ||
        studentRow.password.startsWith("$2b$")
      ) {
        isMatch = await bcrypt.compare(password, studentRow.password);
      } else {
        // Fallback for legacy plain-text accounts
        isMatch = studentRow.password === password;
      }

      if (isMatch) {
        const fullStudent = await getFullStudentById(pool, studentRow.id);
        return res.json({
          success: true,
          session: { role: "student", id: fullStudent.id },
          user: fullStudent,
        });
      }
    }

    return res.status(401).json({
      error: "That username or password doesn't match any registered account.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during authentication." });
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
    const [rows] = await pool.execute(
      "SELECT id FROM students ORDER BY id ASC LIMIT 1"
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No student records found." });
    }

    const fullStudent = await getFullStudentById(pool, rows[0].id);
    return res.json({
      success: true,
      session: { role: "student", id: fullStudent.id },
      user: fullStudent,
    });
  } catch (error) {
    console.error("Quick login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
