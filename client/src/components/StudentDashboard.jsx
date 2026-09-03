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
} from "./Icons";
import {
  getInitials,
  avatarColor,
  formatDateHuman,
  parseDateOnly,
  formatISTTime,
  convertISTTimeToZone,
} from "../utils/dateUtils";

export default function StudentDashboard({
  student,
  currentTime,
  onPayNow,
  onToggleAttendance,
}) {
  if (!student) return null;

  const palette = avatarColor(student.id);
  const studentFirstName = student.name.split(" ")[0];
  const localClassTime = convertISTTimeToZone(
    student.classTimeIST,
    student.timezone
  );
  const istClassTime = formatISTTime(student.classTimeIST);

  const infoCards = [
    {
      icon: <UserIcon className="w-4 h-4 text-[#F2994A]" />,
      label: "Instructor",
      value: student.instructor,
    },
    {
      icon: <ClockIcon className="w-4 h-4 text-[#F2994A]" />,
      label: "Class time",
      value: (
        <div>
          <span>{istClassTime} IST</span>
          <span className="block text-xs text-[#6B7089] font-normal mt-0.5">
            → {localClassTime} local ({student.country})
          </span>
        </div>
      ),
    },
    {
      icon: <CalendarIcon className="w-4 h-4 text-[#F2994A]" />,
      label: "Duration",
      value: student.duration,
    },
    {
      icon: <WalletIcon className="w-4 h-4 text-[#F2994A]" />,
      label: "Fees",
      value: `₹${student.fee.toLocaleString("en-IN")} / month`,
    },
    {
      icon: <UsersIcon className="w-4 h-4 text-[#F2994A]" />,
      label: "Class type",
      value:
        student.classType === "group"
          ? `Group · ${student.groupName || "Standard"}`
          : "Private (1-to-1)",
    },
    {
      icon: <CalendarIcon className="w-4 h-4 text-[#F2994A]" />,
      label: "Joined",
      value: formatDateHuman(parseDateOnly(student.joiningDate)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#F2994A] mb-1">
          Student Dashboard
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171A32]">
          Hi, {studentFirstName} 👋
        </h1>
      </div>

      {/* Profile Strip */}
      <div className="flex items-center gap-3.5 bg-white border border-[#E3E6F2] rounded-2xl p-4 shadow-xs">
        <div
          className="w-13 h-13 rounded-full flex items-center justify-center font-bold text-lg flex-none"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          {getInitials(student.name)}
        </div>
        <div>
          <div className="font-bold text-xl text-[#171A32]">
            {student.name}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                student.classType === "group"
                  ? "bg-[#EFE7FE] text-[#8B5CF6]"
                  : "bg-[#E6E9FB] text-[#4C5FD5]"
              }`}
            >
              {student.classType === "group" ? (
                <>
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>Group · {student.groupName}</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Private · 1-to-1</span>
                </>
              )}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF0FA] text-[#6B7089]">
              {student.country}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: TimeBridge & FeeRing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#E3E6F2] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-4">
            Right now, both sides
          </div>
          <TimeBridge student={student} currentTime={currentTime} />
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E3E6F2] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-4">
            Fee cycle
          </div>
          <FeeRing
            student={student}
            mode="student"
            onPayNow={onPayNow}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {infoCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E3E6F2] rounded-2xl p-4 flex items-start gap-3 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FA] flex items-center justify-center flex-none">
              {card.icon}
            </div>
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wider text-[#A3A8C3] mb-0.5">
                {card.label}
              </div>
              <div className="font-semibold text-sm text-[#171A32]">
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
