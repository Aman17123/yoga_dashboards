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

export function parseSlotIST(slotStr) {
  if (!slotStr) return null;
  const clean = slotStr.replace(/\s*IST\s*/i, "").trim();
  const parts = clean.split(/\s*[-–—]\s*/);
  if (parts.length < 2) return null;

  function parseTimePart(p, fallbackPeriod = "am") {
    p = p.trim();
    const periodMatch = p.match(/(am|pm)/i);
    const period = periodMatch ? periodMatch[1].toLowerCase() : fallbackPeriod;
    const numPart = p.replace(/(am|pm)/i, "").trim();
    const [hStr, mStr] = numPart.split(":");
    let h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    if (period === "pm" && h < 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return { h, m, period };
  }

  const endParsed = parseTimePart(parts[1], "am");
  const startParsed = parseTimePart(parts[0], endParsed.period);

  return {
    startH: startParsed.h,
    startM: startParsed.m,
    endH: endParsed.h,
    endM: endParsed.m,
  };
}

export function convertSlotToTimezone(slotStr, tz, referenceDate = new Date()) {
  if (!slotStr) return { localTimeStr: "--:--", dayOffsetNote: "", fullLocalStr: "--:--", period: "" };
  if (!tz || tz === "Asia/Kolkata") {
    return {
      localTimeStr: slotStr,
      dayOffsetNote: "",
      fullLocalStr: slotStr,
      period: slotStr.toLowerCase().includes("pm") ? "Evening" : "Morning",
    };
  }

  try {
    const parsed = parseSlotIST(slotStr);
    if (!parsed) {
      return { localTimeStr: slotStr, dayOffsetNote: "", fullLocalStr: slotStr, period: "" };
    }

    const y = referenceDate.getFullYear();
    const mo = referenceDate.getMonth();
    const d = referenceDate.getDate();

    // IST is fixed UTC+5:30 (330 minutes)
    const istOffsetMs = 330 * 60000;
    const startUtcMs = Date.UTC(y, mo, d, parsed.startH, parsed.startM) - istOffsetMs;
    const endUtcMs = Date.UTC(y, mo, d, parsed.endH, parsed.endM) - istOffsetMs;

    const startDate = new Date(startUtcMs);
    const endDate = new Date(endUtcMs);

    const timeFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const startLocalStr = timeFmt.format(startDate);
    const endLocalStr = timeFmt.format(endDate);

    // Calculate calendar day difference between IST and local target
    const localParts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(startDate)
      .forEach((p) => {
        if (p.type !== "literal") localParts[p.type] = +p.value;
      });

    let dayOffsetNote = "";
    if (localParts.year && localParts.month && localParts.day) {
      const localDateMid = new Date(localParts.year, localParts.month - 1, localParts.day).getTime();
      const istDateMid = new Date(y, mo, d).getTime();
      if (localDateMid < istDateMid) dayOffsetNote = "Prev Day";
      else if (localDateMid > istDateMid) dayOffsetNote = "Next Day";
    }

    const hNum = localParts.hour || 0;
    let period = "Morning";
    if (hNum >= 12 && hNum < 17) period = "Afternoon";
    else if (hNum >= 17 && hNum < 21) period = "Evening";
    else if (hNum >= 21 || hNum < 5) period = "Night";

    const localTimeCombined = `${startLocalStr} – ${endLocalStr}`;
    const fullLocalStr = dayOffsetNote
      ? `${localTimeCombined} (${dayOffsetNote})`
      : localTimeCombined;

    return {
      localTimeStr: localTimeCombined,
      dayOffsetNote,
      fullLocalStr,
      period,
      startLocalStr,
      endLocalStr,
    };
  } catch (err) {
    console.warn("Timezone conversion error:", err);
    return { localTimeStr: slotStr, dayOffsetNote: "", fullLocalStr: slotStr, period: "" };
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
  if (!AVATAR_PALETTE || AVATAR_PALETTE.length === 0) {
    return { bg: "#EDE9FE", fg: "#6D28D9" };
  }
  if (typeof id === "string") {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[idx] || AVATAR_PALETTE[0];
  }
  const num = Number(id);
  if (!isNaN(num)) {
    const idx = Math.abs(Math.floor(num)) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[idx] || AVATAR_PALETTE[0];
  }
  return AVATAR_PALETTE[0];
}

export function toWhatsAppDigits(phone) {
  return String(phone || "").replace(/[^0-9]/g, "");
}
