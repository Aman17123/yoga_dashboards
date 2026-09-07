import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XIcon } from "./Icons";
import {
  stripTime,
  fmtISO,
  addMonthsClamped,
} from "../utils/dateUtils";

export default function CalendarWidget({
  student,
  editable = false,
  onToggleAttendance,
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = stripTime(new Date());
    d.setDate(1);
    return d;
  });

  if (!student) return null;

  if (student.classType !== "private") {
    return (
      <div className="card">
        <div className="card__label">Attendance</div>
        <p className="cal-note text-[13.5px]" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Attendance tracking is only available for private (1-to-1) classes right now. Group class attendance is tracked by the instructor directly.
        </p>
      </div>
    );
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonthsClamped(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonthsClamped(prev, 1));
  };

  const handleToday = () => {
    const d = stripTime(new Date());
    d.setDate(1);
    setCurrentMonth(d);
  };

  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first grid
  const totalDays = new Date(y, m + 1, 0).getDate();
  const todayISO = fmtISO(new Date());

  let presentCount = 0;
  let absentCount = 0;

  const attendance = student.attendance || {};

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push({ key: `empty-${i}`, isEmpty: true });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(y, m, d);
    const iso = fmtISO(dateObj);
    const isToday = iso === todayISO;
    const canToggle = editable && iso <= todayISO;
    const status = attendance[iso];

    if (status === "present") presentCount++;
    else if (status === "absent") absentCount++;

    days.push({
      key: iso,
      dayNum: d,
      iso,
      isToday,
      canToggle,
      status,
    });
  }

  const totalMarked = presentCount + absentCount;
  const pct = totalMarked ? Math.round((presentCount / totalMarked) * 100) : null;
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleCellClick = (day) => {
    if (!day.canToggle || !onToggleAttendance) return;
    const currentStatus = attendance[day.iso];
    const newStatus = currentStatus === "present" ? "absent" : "present";
    onToggleAttendance(student.id, day.iso, newStatus);
  };

  return (
    <div className="card">
      {/* Head */}
      <div className="flex items-start justify-between gap-2.5 mb-1.5">
        <div>
          <div className="card__label">Attendance</div>
          <div className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
            {monthName}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-[30px] h-[30px] rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: "var(--bg-alt)", borderColor: "var(--border)", color: "var(--ink-soft)" }}
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="h-[30px] px-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer"
            style={{ background: "var(--bg-alt)", borderColor: "var(--border)", color: "var(--ink-soft)" }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-[30px] h-[30px] rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: "var(--bg-alt)", borderColor: "var(--border)", color: "var(--ink-soft)" }}
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs my-2.5 flex-wrap" style={{ color: "var(--ink-soft)" }}>
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: "var(--success)" }} />
          Attended
        </span>
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: "var(--danger)" }} />
          Missed
        </span>
      </div>

      {editable && (
        <div className="text-xs mb-2.5" style={{ color: "var(--ink-faint)" }}>
          Tap any day to mark yourself present or absent.
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dow) => (
          <div
            key={dow}
            className="text-[11px] font-bold text-center pb-1 uppercase"
            style={{ color: "var(--ink-faint)" }}
          >
            {dow}
          </div>
        ))}

        {days.map((day) => {
          if (day.isEmpty) {
            return <div key={day.key} className="aspect-square bg-transparent" />;
          }

          const isPresent = day.status === "present";
          const isAbsent = day.status === "absent";

          let cellBg = "var(--bg-alt)";
          let numColor = "var(--ink-soft)";
          let markColor = "transparent";

          if (isPresent) {
            cellBg = "var(--success-soft)";
            numColor = "var(--success)";
            markColor = "var(--success)";
          } else if (isAbsent) {
            cellBg = "var(--danger-soft)";
            numColor = "var(--danger)";
            markColor = "var(--danger)";
          }

          return (
            <div
              key={day.key}
              onClick={() => handleCellClick(day)}
              className={`relative aspect-square rounded-[10px] flex flex-col items-center justify-center gap-0.5 border transition-all ${
                day.canToggle ? "cursor-pointer hover:ring-2 hover:ring-[#4C5FD5]" : ""
              }`}
              style={{
                background: cellBg,
                borderColor: day.isToday ? "var(--dusk)" : "transparent",
                borderWidth: day.isToday ? "2px" : "1px",
              }}
            >
              <span className="text-[11.5px] font-semibold" style={{ color: numColor }}>
                {day.dayNum}
              </span>
              <span className="w-[13px] h-[13px]" style={{ color: markColor }}>
                {isPresent && <CheckIcon className="w-full h-full" />}
                {isAbsent && <XIcon className="w-full h-full" />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-3.5 text-[13px]" style={{ color: "var(--ink-soft)" }}>
        {totalMarked > 0 ? (
          <>
            <strong className="mono font-semibold" style={{ color: "var(--ink)" }}>{presentCount}</strong> attended ·{" "}
            <strong className="mono font-semibold" style={{ color: "var(--ink)" }}>{absentCount}</strong> missed this month ·{" "}
            <strong className="mono font-semibold" style={{ color: "var(--ink)" }}>{pct}%</strong> attendance
          </>
        ) : (
          "No classes recorded yet for this month."
        )}
      </div>
    </div>
  );
}
