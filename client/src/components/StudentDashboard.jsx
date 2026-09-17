import React, { useState } from "react";
import TimeBridge from "./TimeBridge";
import FeeRing from "./FeeRing";
import CalendarWidget from "./CalendarWidget";
import ChangePasswordModal from "./ChangePasswordModal";
import {
  UserIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  WalletIcon,
  CheckIcon,
} from "./Icons";
import {
  getInitials,
  formatDateHuman,
  parseDateOnly,
  formatISTTime,
  convertISTTimeToZone,
  avatarColor,
} from "../utils/dateUtils";

// Helper to resolve student class link from individual record or group settings
// Group class students see Zoom link only. Private class students see Google Meet link only.
export function resolveStudentClassLink(student, paymentSettings) {
  if (!student) return "";

  if (student.classType === "group") {
    // 1. Group class: Zoom link only
    if (student.classLink && student.classLink.includes("zoom.us")) {
      return student.classLink.trim();
    }
    const links = paymentSettings?.groupClassLinks;
    const gLang = (student.medium || student.language || "").toLowerCase();
    if (gLang.includes("english") && links?.english) {
      return links.english;
    }
    if (links?.hindi) {
      return links.hindi;
    }
    return "https://zoom.us/j/9991112223?pwd=yoga-live-batch";
  }

  // 2. Private class: Google Meet only
  if (student.classLink && student.classLink.includes("meet.google.com")) {
    return student.classLink.trim();
  }
  return "https://meet.google.com/yog-pvte-one";
}

export default function StudentDashboard({
  student,
  currentTime,
  onPayNow,
  onToggleAttendance,
  onOpenReceipt,
  paymentSettings,
}) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!student) return null;

  const studentFirstName = student.name.split(" ")[0];
  const localClassTime = convertISTTimeToZone(
    student.classTimeIST,
    student.timezone
  );
  const istClassTime = formatISTTime(student.classTimeIST);
  const palette = avatarColor(student.id);

  // Clean single Medium badge: strictly Hindi or English
  const studentMedium = (student.medium || student.language || "Hindi")
    .toLowerCase()
    .includes("english")
    ? "English"
    : "Hindi";

  // Class link resolution with strict platform separation
  const activeClassLink = resolveStudentClassLink(student, paymentSettings);
  const isInstructorMatching =
    student.instructorStatus === "matching_in_progress" ||
    student.instructor === "Matching in Progress";

  const isGroup = student.classType === "group";
  const platformName = isGroup ? "Zoom" : "Google Meet";

  const handleJoinClass = () => {
    if (!activeClassLink) return;
    window.open(activeClassLink, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="w-full">
      {/* View Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="eyebrow">Student Dashboard</div>
          <h1 className="view__title">Hi, {studentFirstName} 👋</h1>
        </div>

        {/* Security / Account Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="student-change-password-btn"
            onClick={() => setShowPasswordModal(true)}
            className="btn btn--sm gap-1.5 font-semibold text-xs"
            title="Change account login password"
          >
            <span>🔒</span>
            <span>Change Password</span>
          </button>
        </div>
      </header>

      {/* Profile Strip */}
      <div className="profile-strip mb-4">
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
            {isGroup ? (
              <span className="tag tag--group">
                <UsersIcon className="w-3.5 h-3.5" />
                Group Class · {student.groupName || `${studentMedium} Batch`}
              </span>
            ) : (
              <span className="tag tag--private">
                <UserIcon className="w-3.5 h-3.5" />
                Private Class (1:1)
              </span>
            )}
            <span
              className={`tag font-bold text-xs ${
                studentMedium === "Hindi"
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              Medium: {studentMedium}
            </span>
            <span className="tag tag--muted">{student.country}</span>
            <span className="mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-alt)] text-[var(--ink-soft)]">
              @{student.username}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ PROMINENT JOIN CLASS & SESSION HUB (ZOOM ONLY FOR GROUP, GOOGLE MEET ONLY FOR PRIVATE) ═══ */}
      <div
        className="rounded-[var(--radius-lg)] border p-4 sm:p-5 mb-[18px] relative overflow-hidden transition-all shadow-sm"
        style={{
          background: isGroup
            ? "linear-gradient(135deg, #F5F8FF 0%, #EBF2FE 100%)"
            : "linear-gradient(135deg, #F0FDF4 0%, #E6F9EE 100%)",
          borderColor: isGroup ? "#CBD8F7" : "#B7E7CA",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Platform & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isGroup
                    ? "bg-blue-600 text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {platformName} Only
              </span>

              {isInstructorMatching ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  <span className="animate-pulse">⏳</span>
                  <span>Matching Instructor within 24 hours</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#171A32] border border-[#D5D8E4]">
                  <span>🧘</span>
                  <span>Instructor: <strong>{student.instructor || "Rohan Mehta"}</strong></span>
                </div>
              )}
            </div>

            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)] mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isGroup
                ? `Group Class Live Cohort · ${studentMedium} Medium`
                : `Private 1:1 Live Practice · ${studentMedium} Medium`}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed max-w-xl">
              Scheduled daily practice at <strong className="text-[var(--ink)]">{istClassTime} IST</strong> ({localClassTime} your local time) via <strong className="text-[var(--ink)]">{platformName}</strong>.
            </p>
          </div>

          {/* Action Button: Join Zoom Class OR Join Google Meet */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            {activeClassLink ? (
              <button
                type="button"
                id="join-class-btn"
                onClick={handleJoinClass}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[10px] text-white text-sm sm:text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ${
                  isGroup
                    ? "bg-[#2D8CFF] hover:bg-[#1E74E0] shadow-blue-500/25"
                    : "bg-[#1E9E63] hover:bg-[#15803D] shadow-emerald-500/25"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Join {platformName} Class</span>
              </button>
            ) : (
              <div className="px-4 py-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--ink-soft)] font-medium flex items-center gap-2">
                <span className="text-base">📅</span>
                <div>
                  <div className="font-bold text-[var(--ink)]">{platformName} Link Pending</div>
                  <div className="text-[11px]">Assigned by instructor before session</div>
                </div>
              </div>
            )}
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
            <div className="infogrid__value">
              {isInstructorMatching ? "Matching in Progress (24h)" : student.instructor || "Rohan Mehta"}
            </div>
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
              {isGroup
                ? `Group Class · ${student.groupName || "Batch"}`
                : "Private Class (1:1)"}
            </div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <span>🌐</span>
          </div>
          <div>
            <div className="infogrid__label">Medium</div>
            <div className="infogrid__value flex items-center gap-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                studentMedium === "Hindi" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
              }`}>
                {studentMedium}
              </span>
            </div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <span>📹</span>
          </div>
          <div>
            <div className="infogrid__label">Meeting Platform</div>
            <div className="infogrid__value text-xs font-bold text-[var(--ink)]">
              {isGroup ? "Zoom Only" : "Google Meet Only"}
            </div>
          </div>
        </div>

        <div className="infogrid__item">
          <div className="infogrid__icon">
            <CalendarIcon />
          </div>
          <div>
            <div className="infogrid__label">Joining Date</div>
            <div className="infogrid__value">
              {formatDateHuman(parseDateOnly(student.joiningDate))}
            </div>
          </div>
        </div>

        {student.goals && (
          <div className="infogrid__item col-span-1 sm:col-span-2">
            <div className="infogrid__icon">
              <span>🎯</span>
            </div>
            <div>
              <div className="infogrid__label">Your Goals &amp; Focus</div>
              <div className="infogrid__value text-xs font-medium text-[var(--ink)]">
                {student.goals}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Calendar */}
      <CalendarWidget
        student={student}
        editable={true}
        onToggleAttendance={onToggleAttendance}
      />

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          student={student}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </section>
  );
}
