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
  CopyIcon,
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
export function resolveStudentClassLink(student, paymentSettings) {
  if (!student) return "";

  // 1. If student has a dedicated classLink assigned, prioritize it
  if (student.classLink && student.classLink.trim()) {
    return student.classLink.trim();
  }

  // 2. If student is in a group class, inherit from groupClassLinks in settings
  if (student.classType === "group" && paymentSettings?.groupClassLinks) {
    const links = paymentSettings.groupClassLinks;
    const gName = (student.groupName || "").toLowerCase();
    const gLang = (student.language || "").toLowerCase();

    if (student.groupName && links[student.groupName]) {
      return links[student.groupName];
    }
    if (gName.includes("hindi") || gLang.includes("hindi")) {
      return links.hindi || links["hindi"] || links.default || "";
    }
    if (gName.includes("english") || gLang.includes("english")) {
      return links.english || links["english"] || links.default || "";
    }
    return links.default || "";
  }

  return "";
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
  const [copiedLink, setCopiedLink] = useState(false);

  if (!student) return null;

  const studentFirstName = student.name.split(" ")[0];
  const localClassTime = convertISTTimeToZone(
    student.classTimeIST,
    student.timezone
  );
  const istClassTime = formatISTTime(student.classTimeIST);
  const palette = avatarColor(student.id);

  // Class link resolution
  const activeClassLink = resolveStudentClassLink(student, paymentSettings);
  const isInstructorMatching =
    student.instructorStatus === "matching_in_progress" ||
    student.instructor === "Matching in Progress";

  const handleCopyLink = () => {
    if (!activeClassLink) return;
    navigator.clipboard.writeText(activeClassLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

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
            <span className="mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-alt)] text-[var(--ink-soft)]">
              @{student.username}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ PROMINENT JOIN CLASS & SESSION HUB (REQUIREMENTS 1, 5, 6, 7) ═══ */}
      <div
        className="rounded-[var(--radius-lg)] border p-4 sm:p-5 mb-[18px] relative overflow-hidden transition-all shadow-sm"
        style={{
          background: "linear-gradient(135deg, #FAFBFD 0%, #F0F4FE 100%)",
          borderColor: activeClassLink ? "#CBD8F7" : "var(--border)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Instructor Match Status / SLA Badge */}
            {isInstructorMatching ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] mb-2">
                <span className="animate-pulse">⏳</span>
                <span>Instructor Matching in Progress · Completed within 24 hours</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB] mb-2">
                <span>🧘</span>
                <span>Assigned Instructor: <strong>{student.instructor || "Rohan Mehta"}</strong></span>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {student.classType === "private" ? "Private 1-on-1 Practice Room" : `Group Cohort · ${student.groupName || "Interactive Session"}`}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed max-w-xl">
              Scheduled daily practice at <strong className="text-[var(--ink)]">{istClassTime} IST</strong> ({localClassTime} your local time).
              {activeClassLink
                ? " Click Join Class to enter your live video session."
                : " Your instructor is preparing your dedicated session link."}
            </p>
          </div>

          {/* Action Button: Join Class OR Pending State */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            {activeClassLink ? (
              <>
                <button
                  type="button"
                  id="join-class-btn"
                  onClick={handleJoinClass}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-gradient-to-r from-[#1E9E63] to-[#15803D] hover:from-[#178553] hover:to-[#116731] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#1E9E63]/25 hover:shadow-xl hover:shadow-[#1E9E63]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span>Join Class</span>
                </button>

                <button
                  type="button"
                  id="copy-class-link-btn"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-[10px] border border-[#CBD8F7] bg-white hover:bg-[#F8F9FE] text-xs font-semibold text-[var(--ink)] transition-all cursor-pointer"
                  title="Copy meeting link to clipboard"
                >
                  {copiedLink ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-[var(--success)]" />
                      <span className="text-[var(--success)]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4 text-[var(--ink-soft)]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="px-4 py-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--ink-soft)] font-medium flex items-center gap-2">
                <span className="text-base">📅</span>
                <div>
                  <div className="font-bold text-[var(--ink)]">Class Link Pending</div>
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
