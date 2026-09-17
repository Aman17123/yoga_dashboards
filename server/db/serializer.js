/**
 * Reusable serializers to transform MySQL snake_case rows into the exact
 * camelCase JSON contracts expected by the React frontend.
 */

export function parseScheduleDays(val) {
  if (!val) return [0, 1, 2, 3, 4, 5, 6];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [0, 1, 2, 3, 4, 5, 6];
    } catch {
      return [0, 1, 2, 3, 4, 5, 6];
    }
  }
  return [0, 1, 2, 3, 4, 5, 6];
}

export function formatStudent(row, attendanceMap = {}, paymentHistory = []) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: Number(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    classType: row.class_type || "private",
    groupName: row.group_name || null,
    instructor: row.instructor || "Rohan Mehta",
    country: row.country || "India",
    timezone: row.timezone || "Asia/Kolkata",
    duration: row.duration || "1 Hour",
    fee: Number(row.fee) || 0,
    classTimeIST: row.class_time_ist || "19:00",
    scheduleDays: parseScheduleDays(row.schedule_days),
    joiningDate: row.joining_date || "",
    lastPaymentDate: row.last_payment_date || "",
    classLink: row.class_link || "",
    goals: row.goals || "",
    language: row.language || "English",
    instructorStatus: row.instructor_status || "assigned",
    username: row.username,
    welcomeEmailStatus: row.welcome_email_status || "pending",
    welcomeEmailSentAt: row.welcome_email_sent_at || null,
    welcomeEmailError: row.welcome_email_error || null,
    enrolledFromBookingId: row.enrolled_from_booking_id
      ? String(row.enrolled_from_booking_id)
      : null,
    enrolledFromEnquiryId: row.enrolled_from_enquiry_id
      ? Number(row.enrolled_from_enquiry_id)
      : null,
    attendance: attendanceMap || {},
    paymentHistory: Array.isArray(paymentHistory) ? paymentHistory : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getFullStudentById(executor, studentId) {
  const [rows] = await executor.execute(
    "SELECT * FROM students WHERE id = ?",
    [studentId]
  );
  if (!rows || rows.length === 0) return null;
  const student = rows[0];

  const [attRows] = await executor.execute(
    "SELECT attendance_date, status FROM student_attendance WHERE student_id = ?",
    [studentId]
  );
  const attendance = {};
  for (const a of attRows) {
    attendance[a.attendance_date] = a.status;
  }

  const [payRows] = await executor.execute(
    "SELECT payment_date, amount, note, payment_method FROM student_payments WHERE student_id = ? ORDER BY id ASC",
    [studentId]
  );
  const paymentHistory = payRows.map((p) => ({
    date: p.payment_date,
    amount: Number(p.amount),
    note: p.note || "",
    paymentMethod: p.payment_method || "UPI / Bank Transfer",
  }));

  return formatStudent(student, attendance, paymentHistory);
}

export async function getFullStudentByUsername(executor, username) {
  const [rows] = await executor.execute(
    "SELECT * FROM students WHERE username = ?",
    [username]
  );
  if (!rows || rows.length === 0) return null;
  return getFullStudentById(executor, rows[0].id);
}

export async function getAllFullStudents(executor) {
  const [students] = await executor.execute(
    "SELECT * FROM students ORDER BY id ASC"
  );
  if (!students || students.length === 0) return [];

  const [allAttendance] = await executor.execute(
    "SELECT student_id, attendance_date, status FROM student_attendance"
  );
  const [allPayments] = await executor.execute(
    "SELECT student_id, payment_date, amount, note, payment_method FROM student_payments ORDER BY id ASC"
  );

  const attMap = {};
  for (const a of allAttendance) {
    if (!attMap[a.student_id]) attMap[a.student_id] = {};
    attMap[a.student_id][a.attendance_date] = a.status;
  }

  const payMap = {};
  for (const p of allPayments) {
    if (!payMap[p.student_id]) payMap[p.student_id] = [];
    payMap[p.student_id].push({
      date: p.payment_date,
      amount: Number(p.amount),
      note: p.note || "",
      paymentMethod: p.payment_method || "UPI / Bank Transfer",
    });
  }

  return students.map((s) =>
    formatStudent(s, attMap[s.id] || {}, payMap[s.id] || [])
  );
}

export function formatBooking(row) {
  if (!row) return null;
  const rawLang = row.language || "English";
  const cleanMedium = rawLang.toLowerCase().includes("hindi") ? "Hindi" : "English";
  return {
    _id: String(row.id),
    id: Number(row.id),
    name: row.name,
    email: row.email,
    age: row.age || "",
    gender: row.gender || "",
    phone: row.phone || "",
    country: row.country || "",
    timezone: row.timezone || "Asia/Kolkata",
    language: cleanMedium,
    medium: cleanMedium,
    classType: row.class_type || "group",
    preferredTime: row.preferred_time || "",
    preferredTime2: row.preferred_time2 || "",
    instructorPreference: row.instructor_preference || "Any",
    groupCohort: row.group_cohort || "",
    fee: Number(row.fee) || 0,
    goals: row.goals || "",
    joiningDate: row.joining_date || "",
    message: row.message || "",
    source: row.source || "direct",
    referralUrl: row.referral_url || "",
    bookingRef: row.booking_ref,
    status: row.status || "pending",
    adminNotes: row.admin_notes || "",
    confirmationEmailSent: Boolean(row.confirmation_email_sent),
    adminEmailSent: Boolean(row.admin_email_sent),
    enrolledStudentId: row.enrolled_student_id
      ? Number(row.enrolled_student_id)
      : null,
    enrollmentEmailStatus: row.enrollment_email_status || "none",
    enrollmentEmailError: row.enrollment_email_error || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatEnquiry(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: Number(row.id),
    name: row.name,
    gender: row.gender || "",
    age: row.age !== null && row.age !== undefined ? Number(row.age) : null,
    heightWeight: row.height_weight || "",
    phone: row.phone || "",
    email: row.email || "",
    country: row.country || "India",
    classTypeInterest: row.class_type_interest || "private",
    preferredTimings: row.preferred_timings || "",
    demoDate: row.demo_date || "",
    instructorPreference: row.instructor_preference || "Any",
    reason: row.reason || "",
    otherInfo: row.other_info || "",
    message: row.message || "",
    status: row.status || "pending",
    submittedDate: row.submitted_date || "",
    convertedStudentId: row.converted_student_id
      ? Number(row.converted_student_id)
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatSettings(row, linksRows = []) {
  if (!row) return null;
  const groupClassLinks = {};
  for (const l of linksRows) {
    groupClassLinks[l.cohort_key] = l.meet_url;
  }
  return {
    _id: String(row.id),
    id: Number(row.id),
    upiId: row.upi_id,
    payeeName: row.payee_name,
    accountName: row.account_name,
    accountNumber: row.account_number,
    ifsc: row.ifsc,
    bankName: row.bank_name,
    adminWhatsApp: row.admin_whats_app,
    groupClassLinks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
