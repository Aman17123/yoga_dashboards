import { AVATAR_PALETTE } from "../constants/initialData";

export function parseDateOnly(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function fmtISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateHuman(date) {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function addMonthsClamped(date, months) {
  const day = date.getDate();
  const base = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  base.setDate(Math.min(day, lastDay));
  return base;
}

export function formatISTTime(timeStr) {
  if (!timeStr) return "--:--";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

export function tzOffsetMinutes(tz, date = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = {};
    dtf.formatToParts(date).forEach((p) => {
      if (p.type !== "literal") parts[p.type] = p.value;
    });
    const asUTC = Date.UTC(
      +parts.year,
      +parts.month - 1,
      +parts.day,
      +parts.hour,
      +parts.minute,
      +parts.second
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return 0;
  }
}

export function getWallTime(tz, date = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = {};
    dtf.formatToParts(date).forEach((p) => {
      if (p.type !== "literal") parts[p.type] = p.value;
    });
    return { h: +parts.hour, m: +parts.minute, s: +parts.second };
  } catch {
    return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
  }
}

export function digital12(h, m) {
  const period = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

export function offsetSentence(tzA, tzB, countryLabel) {
  const diff = tzOffsetMinutes(tzA) - tzOffsetMinutes(tzB);
  if (diff === 0) return "Same clock time as India";
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const part = `${h}h${m ? " " + m + "m" : ""}`;
  return diff > 0
    ? `India is ${part} ahead of ${countryLabel}`
    : `India is ${part} behind ${countryLabel}`;
}

export function convertISTTimeToZone(timeStr, tz, referenceDate = new Date()) {
  if (!timeStr) return "--:--";
  try {
    const [hh, mm] = timeStr.split(":").map(Number);
    const istOffset = tzOffsetMinutes("Asia/Kolkata", referenceDate);
    const y = referenceDate.getFullYear();
    const mo = referenceDate.getMonth();
    const d = referenceDate.getDate();
    const utcMillis = Date.UTC(y, mo, d, hh, mm) - istOffset * 60000;
    const utcDate = new Date(utcMillis);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(utcDate);
  } catch {
    return formatISTTime(timeStr);
  }
}

export function getCurrentDueDate(student) {
  return addMonthsClamped(parseDateOnly(student.lastPaymentDate), 1);
}

export function getDaysLeft(student, today = new Date()) {
  const due = getCurrentDueDate(student);
  const todayMid = stripTime(today);
  return Math.round((due - todayMid) / 86400000);
}

export function feeTier(daysLeft) {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 2) return "urgent";
  if (daysLeft <= 7) return "soon";
  return "safe";
}

export function generateAttendance(student) {
  if (student.attendance && Object.keys(student.attendance).length > 0) {
    return student.attendance;
  }
  const attendance = {};
  const today = stripTime(new Date());
  const joinDate = parseDateOnly(student.joiningDate);
  const threshold = addMonthsClamped(today, -3);
  const rangeStart = new Date(Math.max(joinDate.getTime(), threshold.getTime()));
  let seed = student.id * 7919 + 13;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  const cursor = new Date(rangeStart);
  while (cursor < today) {
    const isClassDay =
      student.classType === "private"
        ? rand() < 0.45
        : (student.scheduleDays || []).includes(cursor.getDay());
    if (isClassDay) {
      attendance[fmtISO(cursor)] = rand() < 0.86 ? "present" : "absent";
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return attendance;
}

export function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function avatarColor(id) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

export function toWhatsAppDigits(phone) {
  return String(phone || "").replace(/[^0-9]/g, "");
}
