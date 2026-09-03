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
      <div className="bg-white border border-[#E3E6F2] rounded-2xl p-5 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-3">
          Attendance
        </div>
        <p className="text-[#6B7089] text-[13.5px] leading-relaxed">
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
  // Empty offset cells
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

  return (
    <div className="bg-white border border-[#E3E6F2] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-1">
            Attendance
          </div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#171A32]">
            {monthName}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-8 h-8 rounded-lg bg-[#EEF0FA] hover:bg-[#E6E9FB] hover:text-[#4C5FD5] flex items-center justify-center text-[#6B7089] transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 h-8 rounded-lg bg-[#EEF0FA] hover:bg-[#E6E9FB] hover:text-[#4C5FD5] text-xs font-bold text-[#6B7089] transition-all"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-8 h-8 rounded-lg bg-[#EEF0FA] hover:bg-[#E6E9FB] hover:text-[#4C5FD5] flex items-center justify-center text-[#6B7089] transition-all"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[#6B7089] my-3">
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#1E9E63] mr-1.5" />
          Attended
        </span>
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#E1483C] mr-1.5" />
          Missed
        </span>
      </div>

      {editable && (
        <div className="text-xs text-[#A3A8C3] mb-3">
          Tap any past or today date to toggle your attendance.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dow) => (
          <div
            key={dow}
            className="text-[11px] font-bold text-[#A3A8C3] text-center pb-1 uppercase tracking-wider"
          >
            {dow}
          </div>
        ))}

        {days.map((item) => {
          if (item.isEmpty) {
            return <div key={item.key} className="aspect-square" />;
          }

          let cellClass = "bg-[#EEF0FA] text-[#6B7089]";
          let mark = null;

          if (item.status === "present") {
            cellClass = "bg-[#DFF5EA] text-[#1E9E63]";
            mark = <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />;
          } else if (item.status === "absent") {
            cellClass = "bg-[#FCE4E1] text-[#E1483C]";
            mark = <XIcon className="w-3.5 h-3.5 stroke-[2.5]" />;
          }

          const borderClass = item.isToday
            ? "ring-2 ring-[#4C5FD5] ring-offset-1"
            : "";
          const cursorClass = item.canToggle
            ? "cursor-pointer hover:ring-2 hover:ring-[#4C5FD5] hover:ring-offset-1 transition-all"
            : "";

          return (
            <div
              key={item.key}
              onClick={() => {
                if (item.canToggle && onToggleAttendance) {
                  const current = item.status;
                  const next = current === "present" ? "absent" : "present";
                  onToggleAttendance(student.id, item.iso, next);
                }
              }}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border border-transparent select-none ${cellClass} ${borderClass} ${cursorClass}`}
            >
              <span className="text-[11.5px] font-semibold">{item.dayNum}</span>
              {mark && <span className="flex items-center justify-center">{mark}</span>}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-3 border-t border-[#E3E6F2] text-xs sm:text-[13px] text-[#6B7089]">
        {totalMarked > 0 ? (
          <>
            <strong className="text-[#171A32] font-mono font-semibold">{presentCount}</strong> attended ·{" "}
            <strong className="text-[#171A32] font-mono font-semibold">{absentCount}</strong> missed this month ·{" "}
            <strong className="text-[#171A32] font-mono font-semibold">{pct}%</strong> attendance
          </>
        ) : (
          "No classes recorded yet for this month."
        )}
      </div>
    </div>
  );
}
