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
  formatDateHuman,
  parseDateOnly,
  formatISTTime,
  convertISTTimeToZone,
  avatarColor,
} from "../utils/dateUtils";

export default function StudentDashboard({
  student,
  currentTime,
  onPayNow,
  onToggleAttendance,
}) {
  if (!student) return null;

  const studentFirstName = student.name.split(" ")[0];
  const localClassTime = convertISTTimeToZone(
    student.classTimeIST,
    student.timezone
  );
  const istClassTime = formatISTTime(student.classTimeIST);
  const palette = avatarColor(student.id);

  return (
    <section className="w-full">
      {/* View Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="eyebrow">Student Dashboard</div>
          <h1 className="view__title">Hi, {studentFirstName} 👋</h1>
        </div>
      </header>

      {/* Profile Strip */}
      <div className="profile-strip">
        <div
          className="avatar"
          style={{
            backgroundColor: palette.bg,
            color: palette.fg,
          }}
        >
          {getInitials(student.name)}
        </div>
        <div>
          <div className="profile-strip__name">{student.name}</div>
          <div className="profile-strip__tags">
            {student.classType === "group" ? (
              <span className="tag tag--group">
                <UsersIcon className="w-3.5 h-3.5" />
                Group · {student.groupName || "Cohort"}
              </span>
            ) : (
              <span className="tag tag--private">
                <UserIcon className="w-3.5 h-3.5" />
                Private · 1-to-1
              </span>
            )}
            <span className="tag tag--muted">{student.country}</span>
          </div>
        </div>
      </div>

      {/* Grid: TimeBridge & FeeRing */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-[18px] mb-[18px]">
        <div className="card">
          <div className="card__label">Right now, both sides</div>
          <TimeBridge student={student} currentTime={currentTime} />
        </div>
        <div className="card">
          <div className="card__label">Fee cycle</div>
          <FeeRing student={student} mode="student" onPayNow={onPayNow} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="infogrid">
        <div className="infogrid__item">
          <div className="infogrid__icon">
            <UserIcon />
          </div>
          <div>
            <div className="infogrid__label">Instructor</div>
            <div className="infogrid__value">{student.instructor || "Assigned Teacher"}</div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <ClockIcon />
          </div>
          <div>
            <div className="infogrid__label">Class time</div>
            <div className="infogrid__value">
              {istClassTime} IST
              <span className="infogrid__sub">
                → {localClassTime} local ({student.country})
              </span>
            </div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <CalendarIcon />
          </div>
          <div>
            <div className="infogrid__label">Duration</div>
            <div className="infogrid__value">{student.duration || "1 Hour"}</div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <WalletIcon />
          </div>
          <div>
            <div className="infogrid__label">Fees</div>
            <div className="infogrid__value">₹{student.fee?.toLocaleString("en-IN")} / month</div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <UsersIcon />
          </div>
          <div>
            <div className="infogrid__label">Class type</div>
            <div className="infogrid__value">
              {student.classType === "group"
                ? `Group · ${student.groupName || "Standard"}`
                : "Private (1-to-1)"}
            </div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <CalendarIcon />
          </div>
          <div>
            <div className="infogrid__label">Joined</div>
            <div className="infogrid__value">
              {formatDateHuman(parseDateOnly(student.joiningDate))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Calendar */}
      <CalendarWidget
        student={student}
        editable={true}
        onToggleAttendance={onToggleAttendance}
      />
    </section>
  );
}
