import React from "react";
import TimeBridge from "./TimeBridge";
import FeeRing from "./FeeRing";
import CalendarWidget from "./CalendarWidget";
import {
  UserIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  WalletIcon,
  AlertIcon,
} from "./Icons";
import {
  getInitials,
  formatDateHuman,
  parseDateOnly,
  formatISTTime,
  convertISTTimeToZone,
  getDaysLeft,
  getCurrentDueDate,
} from "../utils/dateUtils";

export default function StudentDashboard({
  student,
  currentTime,
  onPayNow,
  onToggleAttendance,
  onOpenReceipt,
}) {
  if (!student) return null;

  const studentFirstName = student.name.split(" ")[0];
  const localClassTime = convertISTTimeToZone(
    student.classTimeIST,
    student.timezone
  );
  const istClassTime = formatISTTime(student.classTimeIST);
  const daysLeft = getDaysLeft(student);
  const isOverdue = daysLeft < 0;

  const infoCards = [
    {
      icon: <UserIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Assigned Instructor",
      value: student.instructor,
    },
    {
      icon: <ClockIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Scheduled Class Time",
      value: (
        <div>
          <span>{istClassTime} IST</span>
          <span className="block text-xs text-[#6B706E] font-normal mt-0.5">
            Local: {localClassTime} ({student.country})
          </span>
        </div>
      ),
    },
    {
      icon: <CalendarIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Session Duration",
      value: student.duration,
    },
    {
      icon: <WalletIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Tuition Rate",
      value: `₹${student.fee.toLocaleString("en-IN")} / month`,
    },
    {
      icon: <UsersIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Cohort Assignment",
      value:
        student.classType === "group"
          ? `Group Cohort · ${student.groupName || "Standard"}`
          : "Private (1-on-1 Practice)",
    },
    {
      icon: <CalendarIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Studio Enrollment",
      value: formatDateHuman(parseDateOnly(student.joiningDate)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border border-[#E6E5E0] bg-[#F0EFEA] text-[#6B706E] font-mono text-[10px] uppercase tracking-wider mb-2">
          <span>Student Practice Member Workspace</span>
        </div>
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#121413] tracking-tight">
          Welcome to your practice portal, {studentFirstName}.
        </h1>
        <p className="text-xs sm:text-sm text-[#444846] mt-1 max-w-2xl leading-relaxed">
          Class synchronization across timezones, self-managed attendance verification, and clamped tuition payment cycles.
        </p>
      </div>

      {/* Prominent Overdue Fee Alert for Student */}
      {isOverdue && (
        <div className="bg-[#FBEAE8] border border-[#F2C5BE] rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#B64E30] text-white flex items-center justify-center flex-none">
              <AlertIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#121413] flex items-center gap-2">
                <span>Tuition Settlement Overdue</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FFFFFF] text-[#B64E30] border border-[#F2C5BE]">
                  {Math.abs(daysLeft)} days past due
                </span>
              </div>
              <div className="text-xs text-[#444846] mt-0.5">
                Your practice fee of ₹{student.fee.toLocaleString("en-IN")} was due on {formatDateHuman(getCurrentDueDate(student))}. Please submit settlement to maintain uninterrupted class scheduling.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPayNow(student)}
            className="px-4 py-2 rounded-[6px] bg-[#B64E30] hover:bg-[#963E24] text-[#FFFFFF] text-xs font-semibold cursor-pointer shadow-xs transition-colors self-end sm:self-auto flex items-center gap-1.5"
          >
            <WalletIcon className="w-3.5 h-3.5" />
            <span>Pay Tuition Now</span>
          </button>
        </div>
      )}

      {/* Profile Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[4px] bg-[#121413] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-base flex-none">
            {getInitials(student.name)}
          </div>
          <div>
            <div className="font-sans font-bold text-xl sm:text-2xl text-[#121413] leading-tight tracking-tight">
              {student.name}
            </div>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[11px] border border-[#E6E5E0] bg-[#FBFBFA] text-[#444846]">
                {student.classType === "group"
                  ? `Group · ${student.groupName}`
                  : "Private 1-on-1"}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[11px] border border-[#E6E5E0] bg-[#FFFFFF] text-[#6B706E]">
                {student.country} · {student.timezone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto border-t sm:border-t-0 sm:border-l border-[#E6E5E0] pt-3 sm:pt-0 sm:pl-6">
          {onOpenReceipt && (
            <button
              type="button"
              onClick={() => onOpenReceipt(student)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-xs font-mono text-[#121413] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Download Tuition Receipt</span>
            </button>
          )}

          <div className="hidden sm:flex flex-col justify-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
              Account Status
            </span>
            <span className="font-mono text-xs font-semibold text-[#1D7344] mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7344]" />
              Active Enrollment
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: TimeBridge & FeeRing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E5E0]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
              Timezone Convergence
            </span>
            <span className="font-mono text-[10.5px] text-[#8E8A82]">
              Live IST ↔ Student Offset
            </span>
          </div>
          <TimeBridge student={student} currentTime={currentTime} />
        </div>

        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E5E0]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
              30-Day Tuition Cycle
            </span>
            <span className="font-mono text-[10.5px] text-[#8E8A82]">
              Direct Studio Ledger
            </span>
          </div>
          <FeeRing
            student={student}
            mode="student"
            onPayNow={onPayNow}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {infoCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] p-4 flex items-start gap-3 shadow-xs"
          >
            <div className="w-7 h-7 rounded-[4px] border border-[#E6E5E0] bg-[#FBFBFA] flex items-center justify-center flex-none">
              {card.icon}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-1">
                {card.label}
              </div>
              <div className="font-medium text-xs sm:text-sm text-[#121413]">
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Calendar */}
      <CalendarWidget
        student={student}
        editable={true}
        onToggleAttendance={onToggleAttendance}
      />
    </div>
  );
}
