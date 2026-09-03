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
      <div className="bg-[#FCFAF7] border border-[#E4E1DB] rounded-[6px] p-5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-2">
          Practice Attendance
        </div>
        <p className="text-[#444846] text-xs sm:text-sm leading-relaxed">
          Individual attendance logging is activated for private 1-on-1 cohorts. Group cohort attendance is maintained within the instructor's master ledger.
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

  return (
    <div className="bg-[#FCFAF7] border border-[#E4E1DB] rounded-[6px] p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E4E1DB]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-0.5">
            Cohort Attendance Ledger
          </div>
          <h2 className="font-serif-editorial font-bold text-xl text-[#161918]">
            {monthName}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-7 h-7 rounded-[4px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] flex items-center justify-center text-[#161918] transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 h-7 rounded-[4px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] text-xs font-mono text-[#161918] transition-colors cursor-pointer"
          >
            Current
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-7 h-7 rounded-[4px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] flex items-center justify-center text-[#161918] transition-colors cursor-pointer"
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#6B706E] mb-3">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 rounded-[2px] bg-[#1D7344] mr-1.5" />
            Attended ({presentCount})
          </span>
          <span className="inline-flex items-center">
            <span className="w-2 h-2 rounded-[2px] bg-[#B64E30] mr-1.5" />
            Missed ({absentCount})
          </span>
        </div>
        {editable && (
          <span className="text-[11px] text-[#8E8A82]">
            Click past dates to toggle status
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dow) => (
          <div
            key={dow}
            className="font-mono text-[10px] text-[#8E8A82] text-center pb-1 uppercase tracking-wider"
          >
            {dow}
          </div>
        ))}

        {days.map((item) => {
          if (item.isEmpty) {
            return <div key={item.key} className="aspect-square" />;
          }

          let cellClass = "bg-[#F8F7F4] border-[#E4E1DB] text-[#444846]";
          let mark = null;

          if (item.status === "present") {
            cellClass = "bg-[#EAF5EE] border-[#C6E6D3] text-[#1D7344]";
            mark = <CheckIcon className="w-3 h-3 stroke-[2.2]" />;
          } else if (item.status === "absent") {
            cellClass = "bg-[#FBEAE8] border-[#F2C5BE] text-[#B64E30]";
            mark = <XIcon className="w-3 h-3 stroke-[2.2]" />;
          }

          const borderClass = item.isToday
            ? "ring-1 ring-[#161918] font-bold"
            : "";
          const cursorClass = item.canToggle
            ? "cursor-pointer hover:border-[#161918] transition-colors"
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
              className={`relative aspect-square rounded-[4px] flex flex-col items-center justify-center gap-0.5 border select-none ${cellClass} ${borderClass} ${cursorClass}`}
            >
              <span className="font-mono text-[11px] leading-none">{item.dayNum}</span>
              {mark && <span className="flex items-center justify-center">{mark}</span>}
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-4 pt-3 border-t border-[#E4E1DB] font-mono text-xs text-[#6B706E] flex flex-wrap justify-between items-center gap-2">
        {totalMarked > 0 ? (
          <div>
            Attendance Rate: <strong className="text-[#161918] font-bold">{pct}%</strong> ({presentCount} of {totalMarked} scheduled sessions)
          </div>
        ) : (
          <div>No attendance records logged for this month.</div>
        )}
        <div className="text-[11px] text-[#8E8A82]">
          Self-certified student log
        </div>
      </div>
    </div>
  );
}
