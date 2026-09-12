import React, { useState } from "react";
import TimeBridge from "./TimeBridge";
import FeeRing from "./FeeRing";
import CalendarWidget from "./CalendarWidget";
import {
  XIcon,
  EditIcon,
  CheckIcon,
  UndoIcon,
  CopyIcon,
  ChatIcon,
  WalletIcon,
  UserIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  SunIcon,
  TrashIcon,
  AlertIcon,
  ArrowRightIcon,
  LinkIcon,
  VideoIcon,
  ExternalLinkIcon,
} from "./Icons";
import CountryFlag from "./CountryFlag";
import {
  TIMEZONE_OPTIONS,
  INSTRUCTOR_NAMES,
} from "../constants/initialData";
import {
  getCurrentDueDate,
  getDaysLeft,
  formatDateHuman,
  parseDateOnly,
  formatISTTime,
  convertISTTimeToZone,
  getInitials,
  avatarColor,
  toWhatsAppDigits,
  addMonthsClamped,
  fmtISO,
} from "../utils/dateUtils";
import { generateReceiptPDF, printReceiptWindow } from "../utils/pdfGenerator";

/* ================= MODAL SHELL ================= */
function ModalBackdrop({ children, onClose, maxWidth, panelClassName = "" }) {
  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div
        className={`modal__panel ${panelClassName}`}
        style={maxWidth ? { maxWidth } : undefined}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="modal__close"
        >
          <XIcon className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ================= 1. STUDENT DETAIL MODAL ================= */
export function StudentDetailModal({
  student,
  currentTime,
  onClose,
  onEditStudent,
  onDeleteStudent,
  onRequestDeleteStudent,
  onResetPassword,
  onUpdatePayment,
  onOpenReceipt,
  onResendWelcomeEmail,
  isResendingEmail = false,
  onUpdateStudent,
  paymentSettings,
}) {
  if (!student) return null;

  const localTime = convertISTTimeToZone(student.classTimeIST, student.timezone);
  const istTime = formatISTTime(student.classTimeIST);
  const palette = avatarColor(student.id);

  const [editingLink, setEditingLink] = useState(false);
  const [classLinkInput, setClassLinkInput] = useState(student.classLink || "");
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [isChangingInstructor, setIsChangingInstructor] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(student.instructor || "");
  const [isSavingInstructor, setIsSavingInstructor] = useState(false);

  const isGroup = student.classType === "group";
  const groupCohortKey = (student.language || "").toLowerCase().includes("hindi")
    ? "hindi"
    : (student.groupName || "").toLowerCase().includes("hindi")
    ? "hindi"
    : (student.language || "").toLowerCase().includes("eng")
    ? "english"
    : "default";

  const groupCohortFallback =
    paymentSettings?.groupClassLinks?.[groupCohortKey] ||
    paymentSettings?.groupClassLinks?.default ||
    "https://meet.google.com/yol-studio-live";

  const effectiveLink = student.classLink || (isGroup ? groupCohortFallback : "");

  const handleSaveLink = async () => {
    setIsSavingLink(true);
    try {
      if (onUpdateStudent) {
        await onUpdateStudent(student.id, { classLink: classLinkInput.trim() });
      }
      setEditingLink(false);
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleSaveInstructor = async () => {
    setIsSavingInstructor(true);
    try {
      if (onUpdateStudent) {
        const isMatching = !selectedInstructor || selectedInstructor === "matching_in_progress";
        await onUpdateStudent(student.id, {
          instructor: isMatching ? "" : selectedInstructor,
          instructorStatus: isMatching ? "matching_in_progress" : "assigned",
        });
      }
      setIsChangingInstructor(false);
    } finally {
      setIsSavingInstructor(false);
    }
  };

  const handleCopyLink = async (url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        {/* Action Row */}
        <div className="flex items-center justify-end gap-2 mb-3 pr-8">
          {onOpenReceipt && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceipt(student);
              }}
              className="btn btn--sm gap-1.5"
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditStudent(student);
            }}
            className="btn btn--sm gap-1.5"
          >
            <EditIcon className="w-3.5 h-3.5" />
            <span>Edit details</span>
          </button>
          {(onRequestDeleteStudent || onDeleteStudent) && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequestDeleteStudent) {
                  onRequestDeleteStudent(student);
                } else if (onDeleteStudent) {
                  onDeleteStudent(student.id);
                }
              }}
              className="btn btn--sm btn--danger gap-1.5"
              title={`Delete ${student.name} and their account`}
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

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
              {student.language && (
                <span className="tag tag--muted font-medium">🗣️ {student.language}</span>
              )}
            </div>
          </div>
        </div>

        {/* Grid-2: Clocks & Fee Ring */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-[18px] mb-[18px]">
          <div className="card">
            <div className="card__label">Right now, both sides</div>
            <TimeBridge student={student} currentTime={currentTime} />
          </div>
          <div className="card">
            <div className="card__label">Fee cycle</div>
            <FeeRing
              student={student}
              mode="admin"
              onUpdatePayment={onUpdatePayment}
            />
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
                {student.instructorStatus === "matching_in_progress" || !student.instructor ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    ⏳ Matching in Progress (24h)
                  </span>
                ) : (
                  student.instructor
                )}
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
                {istTime} IST
                <span className="infogrid__sub">
                  → {localTime} local ({student.country})
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

        {/* Yoga Goals & Health Focus (if available) */}
        {student.goals && (
          <div className="card mb-4 bg-[var(--surface)] border-[var(--border)]">
            <div className="card__label mb-2">Yoga Goals &amp; Practice Focus</div>
            <div className="flex flex-wrap gap-1.5">
              {student.goals.split(",").map((g, idx) => {
                const tag = g.trim();
                if (!tag) return null;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--dusk-soft)] text-[var(--dusk)]"
                  >
                    ✨ {tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Class Meeting Link Management Card */}
        <div className="card mb-4 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="card__label mb-0 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[var(--dusk)]" />
              <span>
                {isGroup ? "Group Cohort Meeting Link" : "Private Class Meeting Link (Join URL)"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {effectiveLink ? (
                <span className="tag tag--safe text-[11px]">
                  {student.classLink ? "🔗 Dedicated Link" : "👥 Cohort Link"}
                </span>
              ) : (
                <span className="tag tag--urgent text-[11px]">⚠️ Link Needed</span>
              )}
            </div>
          </div>

          {editingLink ? (
            <div className="space-y-2 pt-1">
              <input
                type="url"
                value={classLinkInput}
                onChange={(e) => setClassLinkInput(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
                className="w-full p-[9px_11px] border rounded-[var(--radius-sm)] font-mono text-xs text-[var(--ink)] bg-[var(--surface)]"
                style={{ borderColor: "var(--border-strong)" }}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(false);
                    setClassLinkInput(student.classLink || "");
                  }}
                  className="btn btn--sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  disabled={isSavingLink}
                  className="btn btn--sm btn--primary text-xs"
                >
                  {isSavingLink ? "Saving…" : "Save Meeting Link"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
              <div className="min-w-0 flex-1">
                {effectiveLink ? (
                  <a
                    href={effectiveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[var(--dusk)] hover:underline truncate block max-w-full"
                    title={effectiveLink}
                  >
                    {effectiveLink}
                  </a>
                ) : (
                  <p className="text-xs text-[var(--ink-soft)] italic">
                    No meeting link configured yet. The student's dashboard will display "Your teacher is preparing your class link."
                  </p>
                )}
                {isGroup && !student.classLink && (
                  <span className="text-[10.5px] text-[var(--ink-faint)] block mt-0.5">
                    Using global {groupCohortKey} cohort link from Settings.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-none flex-wrap">
                {effectiveLink && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(effectiveLink)}
                      className="btn btn--sm gap-1 text-xs"
                      title="Copy meeting link to clipboard"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span>{linkCopied ? "Copied!" : "Copy"}</span>
                    </button>
                    <a
                      href={effectiveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--sm gap-1 text-xs"
                      title="Open meeting room in new tab"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                      <span>Test Room</span>
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setClassLinkInput(student.classLink || "");
                    setEditingLink(true);
                  }}
                  className="btn btn--sm gap-1 text-xs"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  <span>{student.classLink ? "Edit" : "Set Link"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructor Assignment & Matching Card */}
        <div className="card mb-4 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="card__label mb-0 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[var(--dusk)]" />
              <span>Instructor Assignment</span>
            </div>
            <div>
              {student.instructorStatus === "matching_in_progress" || !student.instructor ? (
                <span className="tag tag--soon text-[11px]">
                  ⏳ Matching in Progress (Within 24 Hours)
                </span>
              ) : (
                <span className="tag tag--safe text-[11px]">
                  ✓ Assigned
                </span>
              )}
            </div>
          </div>

          {isChangingInstructor ? (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="p-[8px_10px] border rounded-[var(--radius-sm)] text-xs text-[var(--ink)] bg-[var(--surface)] flex-1 min-w-[200px]"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <option value="matching_in_progress">
                  ⏳ Matching in Progress (Within 24 Hours)
                </option>
                {INSTRUCTOR_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsChangingInstructor(false)}
                className="btn btn--sm text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInstructor}
                disabled={isSavingInstructor}
                className="btn btn--sm btn--primary text-xs"
              >
                {isSavingInstructor ? "Saving…" : "Confirm Instructor"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <div className="text-xs">
                <span className="text-[var(--ink-soft)] font-medium">Assigned Teacher: </span>
                <strong className="text-[var(--ink)]">
                  {student.instructor || "None (Matching in Progress)"}
                </strong>
                {student.instructorStatus === "matching_in_progress" && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                    Student dashboard displays a 24-hour instructor matching notice until assigned.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInstructor(student.instructor || "matching_in_progress");
                  setIsChangingInstructor(true);
                }}
                className="btn btn--sm gap-1 text-xs"
              >
                <EditIcon className="w-3.5 h-3.5" />
                <span>Reassign Instructor</span>
              </button>
            </div>
          )}
        </div>

        {/* Student Account & Welcome Email Credentials Section */}
        <div className="card mb-4 bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="card__label mb-0">Student Account &amp; Welcome Credentials</div>
            <div className="flex items-center gap-2">
              {student.welcomeEmailStatus === "sent" ? (
                <span className="tag tag--safe">
                  <CheckIcon className="w-3.5 h-3.5" /> Welcome Email Sent
                </span>
              ) : student.welcomeEmailStatus === "failed" ? (
                <span className="tag tag--urgent">
                  <XIcon className="w-3.5 h-3.5" /> Email Delivery Failed
                </span>
              ) : (
                <span className="tag tag--soon">
                  <ClockIcon className="w-3.5 h-3.5" /> Active Account
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-2">
            <div>
              <span className="text-xs text-[var(--ink-soft)] font-medium">Username:</span>
              <div className="font-mono font-bold text-[var(--ink)] mt-0.5">{student.username}</div>
            </div>
            <div>
              <span className="text-xs text-[var(--ink-soft)] font-medium">Registered Email:</span>
              <div className="font-medium text-[var(--ink)] truncate mt-0.5" title={student.email}>
                {student.email || "No email on record"}
              </div>
            </div>
            <div className="flex items-center justify-start sm:justify-end gap-1.5 flex-wrap">
              {onResetPassword && (
                <button
                  type="button"
                  onClick={() => onResetPassword(student)}
                  className="btn btn--sm gap-1 text-xs"
                  title="Change student username or password"
                >
                  <KeyIcon className="w-3.5 h-3.5" />
                  <span>Change Username / Password</span>
                </button>
              )}
              {onResendWelcomeEmail && (
                <button
                  type="button"
                  onClick={() => onResendWelcomeEmail(student.id)}
                  disabled={isResendingEmail}
                  className="btn btn--sm gap-1 text-xs"
                  title="Generate fresh secure password and dispatch welcome email to student"
                >
                  <SunIcon className="w-3.5 h-3.5" />
                  <span>{isResendingEmail ? "Sending…" : "Resend Email"}</span>
                </button>
              )}
            </div>
          </div>
          {student.welcomeEmailError && (
            <div className="text-xs text-[var(--danger)] bg-[var(--danger-soft)] p-2.5 rounded-[var(--radius-sm)] mt-2.5">
              <strong>Error sending email:</strong> {student.welcomeEmailError}
            </div>
          )}
        </div>

        {/* Attendance (Read Only for Admin in view-modal) */}
        <CalendarWidget student={student} editable={false} />
      </div>
    </ModalBackdrop>
  );
}

/* ================= 2. ADD / EDIT STUDENT MODAL ================= */
export function AddEditStudentModal({
  student,
  prefill,
  enquiryId,
  bookingId,
  onClose,
  onSave,
  onDelete,
  onRequestDelete,
}) {
  const isNew = !student;

  const [formData, setFormData] = useState(() => {
    const base = student || {
      name: "",
      email: "",
      phone: "",
      country: "",
      timezone: "Asia/Kolkata",
      classType: "private",
      groupName: "",
      instructor: INSTRUCTOR_NAMES[0] || "",
      instructorStatus: "assigned",
      classLink: "",
      goals: "",
      language: "English",
      classTimeIST: "18:00",
      duration: "1 Hour",
      fee: 3000,
      joiningDate: fmtISO(new Date()),
      lastPaymentDate: fmtISO(new Date()),
      scheduleDays: [0, 1, 2, 3, 4, 5, 6],
      username: "",
      password: "",
    };

    if (prefill) {
      return {
        ...base,
        name: prefill.name || "",
        email: prefill.email || "",
        phone: prefill.phone || "",
        country: prefill.country || "",
        timezone: prefill.timezone || base.timezone,
        classType: prefill.classType || "private",
        groupName: prefill.groupName || "",
        fee: prefill.fee || base.fee,
        goals: prefill.goals || prefill.message || prefill.reason || "",
        language: prefill.language || "English",
        classLink: prefill.classLink || "",
        instructor: prefill.instructor || prefill.instructorPreference || "",
        instructorStatus: (prefill.instructor || prefill.instructorPreference) ? "assigned" : "matching_in_progress",
      };
    }
    return base;
  });

  // Step tracking for new students: "form" | "confirm"
  const [step, setStep] = useState("form");
  const [sendEmail, setSendEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const dayLabels = [
    ["1", "Mon"],
    ["2", "Tue"],
    ["3", "Wed"],
    ["4", "Thu"],
    ["5", "Fri"],
    ["6", "Sat"],
    ["0", "Sun"],
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayVal) => {
    const num = Number(dayVal);
    setFormData((prev) => {
      const current = prev.scheduleDays || [];
      const updated = current.includes(num)
        ? current.filter((d) => d !== num)
        : [...current, num];
      return { ...prev, scheduleDays: updated };
    });
  };

  // First submit: for new students, go to confirmation step; for edits, save immediately
  const handleSubmit = (e) => {
    e.preventDefault();
    const isGroup = formData.classType === "group";
    if (isGroup && (!formData.scheduleDays || formData.scheduleDays.length === 0)) {
      alert("Please select at least one class day for the group cohort.");
      return;
    }

    if (isNew) {
      // Validate required credentials
      if (!formData.username.trim()) {
        alert("Please enter a username for the student.");
        return;
      }
      if (!formData.password.trim()) {
        alert("Please enter a password for the student.");
        return;
      }
      // Show confirmation step
      setStep("confirm");
      return;
    }

    // Edit flow — save immediately
    const isMatching = !formData.instructor || formData.instructor === "matching_in_progress";
    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      instructor: isMatching ? "" : formData.instructor.trim(),
      instructorStatus: isMatching ? "matching_in_progress" : "assigned",
      classLink: formData.classLink ? formData.classLink.trim() : "",
      goals: formData.goals ? formData.goals.trim() : "",
      language: formData.language ? formData.language.trim() : "English",
      fee: Number(formData.fee) || 0,
      username: formData.username.trim(),
      groupName: isGroup ? (formData.groupName.trim() || "Group") : null,
      scheduleDays: isGroup ? formData.scheduleDays : [0, 1, 2, 3, 4, 5, 6],
    };
    onSave(payload, student?.id, enquiryId, bookingId);
    onClose();
  };

  // Final confirmation: build payload and call onSave with sendWelcomeEmail flag
  const handleConfirmEnroll = () => {
    const isGroup = formData.classType === "group";
    const isMatching = !formData.instructor || formData.instructor === "matching_in_progress";
    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      instructor: isMatching ? "" : formData.instructor.trim(),
      instructorStatus: isMatching ? "matching_in_progress" : "assigned",
      classLink: formData.classLink ? formData.classLink.trim() : "",
      goals: formData.goals ? formData.goals.trim() : "",
      language: formData.language ? formData.language.trim() : "English",
      fee: Number(formData.fee) || 0,
      username: formData.username.trim(),
      groupName: isGroup ? (formData.groupName.trim() || "Group") : null,
      scheduleDays: isGroup ? formData.scheduleDays : [0, 1, 2, 3, 4, 5, 6],
      sendWelcomeEmail: sendEmail,
    };
    onSave(payload, null, enquiryId, bookingId);
    onClose();
  };

  const heading = isNew
    ? prefill
      ? `Enroll ${formData.name || "student"}`
      : "Add a new student"
    : `Edit ${formData.name}`;

  // ── CONFIRMATION STEP (new students only) ──────────────────────────────────
  if (isNew && step === "confirm") {
    return (
      <ModalBackdrop onClose={onClose}>
        <div className="w-full">
          {/* Header */}
          <div className="mb-4">
            <div className="eyebrow flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Review & Confirm Enrollment</span>
            </div>
            <h2 className="modal__title">Confirm credentials for {formData.name || "student"}</h2>
            <p className="view__note" style={{ margin: "-2px 0 0" }}>
              These login credentials will be saved to the student's account. If you send the welcome email, they'll receive them at their inbox.
            </p>
          </div>

          {/* Credential Preview Card */}
          <div
            className="rounded-[var(--radius-md)] border p-4 mb-4"
            style={{
              background: "linear-gradient(135deg, #F8F9FE 0%, #EEF2FD 100%)",
              borderColor: "var(--dusk-soft)",
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--dusk)] mb-3 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Student Login Credentials</span>
            </div>

            <div className="space-y-3">
              {/* Email row */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ink-soft)] font-medium">Student Email</span>
                <strong className="text-[var(--ink)] font-semibold truncate max-w-[220px]">{formData.email || "—"}</strong>
              </div>

              {/* Username row */}
              <div
                className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border"
                style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">Username</span>
                  <code className="text-sm font-bold text-[var(--dusk)]">{formData.username}</code>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(formData.username)}
                  className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--dusk)] font-semibold flex items-center gap-1"
                  title="Copy username"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Password row */}
              <div
                className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border"
                style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">Password</span>
                  <code className="text-sm font-bold text-[var(--ink)]">
                    {showPassword ? formData.password : "•".repeat(Math.min(formData.password.length, 12))}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--dusk)] font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(formData.password)}
                    className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--dusk)] font-semibold flex items-center gap-1"
                    title="Copy password"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Send email checkbox */}
          {formData.email ? (
            <label
              className="flex items-start gap-3 p-3.5 rounded-[var(--radius-md)] border cursor-pointer mb-5"
              style={{
                background: sendEmail ? "var(--success-soft, #F0FDF4)" : "var(--surface)",
                borderColor: sendEmail ? "var(--success, #16a34a)" : "var(--border)",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5 accent-[var(--success,#16a34a)] w-4 h-4 flex-none"
              />
              <div>
                <div className="text-sm font-bold text-[var(--ink)]">
                  Send welcome email to student
                </div>
                <div className="text-xs text-[var(--ink-soft)] mt-0.5">
                  A branded welcome email containing the username and password above will be delivered to{" "}
                  <strong className="text-[var(--dusk)]">{formData.email}</strong>.
                </div>
              </div>
            </label>
          ) : (
            <div
              className="p-3.5 rounded-[var(--radius-md)] border mb-5 text-sm text-[var(--ink-soft)]"
              style={{ borderColor: "var(--border)" }}
            >
              ⚠️ No email address provided — welcome email will not be sent.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="btn flex items-center gap-1.5"
            >
              <UndoIcon className="w-4 h-4" />
              Go back & edit
            </button>
            <button
              type="button"
              onClick={handleConfirmEnroll}
              className="btn btn--primary flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              {sendEmail && formData.email ? "Confirm & Send Email" : "Confirm Enrollment"}
            </button>
          </div>
        </div>
      </ModalBackdrop>
    );
  }

  // ── MAIN FORM STEP ─────────────────────────────────────────────────────────
  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        <h2 className="modal__title">{heading}</h2>
        {prefill && (
          <p className="view__note" style={{ margin: "-4px 0 14px" }}>
            Name, contact info, and preferences came from their enquiry — review and save to enroll them.
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Full name</span>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Country</span>
            <input
              type="text"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Student timezone</span>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)] cursor-pointer"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {TIMEZONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Instruction Language</span>
            <select
              name="language"
              value={formData.language || "English"}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)] cursor-pointer"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bilingual">Bilingual (Hindi + English)</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Yoga Goals &amp; Practice Focus</span>
            <input
              type="text"
              name="goals"
              placeholder="e.g. Weight Loss, Flexibility, Back Pain Relief, Stress Relief"
              value={formData.goals || ""}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Class type</span>
            <select
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)] cursor-pointer"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <option value="private">Private (1-to-1)</option>
              <option value="group">Group</option>
            </select>
          </label>

          {formData.classType === "group" && (
            <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
              <span>Group name</span>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                placeholder="e.g. Group A"
                className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </label>
          )}

          <label className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <div className="flex items-center justify-between">
              <span>Meeting URL (Google Meet / Zoom)</span>
              <span className="text-[11px] font-normal text-[var(--ink-soft)]">
                {formData.classType === "private" ? "Required for Private 1:1" : "Optional override for group"}
              </span>
            </div>
            <input
              type="url"
              name="classLink"
              placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
              value={formData.classLink || ""}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-mono text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <div className="flex items-center justify-between">
              <span>Instructor</span>
              {(!formData.instructor || formData.instructor === "matching_in_progress") && (
                <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400">24h SLA Notice</span>
              )}
            </div>
            <select
              name="instructor"
              value={formData.instructor || ""}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)] cursor-pointer"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <option value="">⏳ Matching in Progress (Within 24 Hours)</option>
              {INSTRUCTOR_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Class time (IST)</span>
            <input
              type="time"
              name="classTimeIST"
              required
              value={formData.classTimeIST}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Duration</span>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)] cursor-pointer"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {["30 Min", "45 Min", "1 Hour", "1.5 Hour"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Fee (₹ / month)</span>
            <input
              type="number"
              name="fee"
              min="0"
              required
              value={formData.fee}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Joining date</span>
            <input
              type="date"
              name="joiningDate"
              required
              value={formData.joiningDate}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Last payment date</span>
            <input
              type="date"
              name="lastPaymentDate"
              required
              value={formData.lastPaymentDate}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          {/* Group Class Days or Private Note */}
          {formData.classType === "group" ? (
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
              <span>Class days (group meets on)</span>
              <div className="flex gap-1.5 flex-wrap">
                {dayLabels.map(([v, l]) => (
                  <label
                    key={v}
                    className="flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                      color: "var(--ink-soft)",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={v}
                      checked={(formData.scheduleDays || []).includes(Number(v))}
                      onChange={() => handleDayToggle(v)}
                      className="accent-[#4C5FD5]"
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <p
              className="col-span-1 sm:col-span-2 text-xs leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              Private classes are flexible — the student can attend and mark attendance on any day, so there's no fixed weekly schedule to set here.
            </p>
          )}

          {/* Login Credentials Divider */}
          <div
            className="col-span-1 sm:col-span-2 text-[11.5px] font-bold uppercase tracking-wider border-t pt-3.5 mt-1"
            style={{ color: "var(--dawn)", borderColor: "var(--border)" }}
          >
            Login credentials
          </div>

          {isNew && (
            <p
              className="col-span-1 sm:col-span-2 text-[12px] -mt-2 mb-0.5 leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              Set the username and password the student will use to log in. You'll be able to review these before confirming.
            </p>
          )}

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Username</span>
            <input
              type="text"
              name="username"
              required
              autoComplete="off"
              value={formData.username}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <div className="flex items-center justify-between">
              <span>
                Password{" "}
                {!isNew && (
                  <span className="font-normal text-[11px] text-[var(--ink-soft)]">
                    (optional)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$*";
                  let gen = "";
                  for (let i = 0; i < 10; i++) gen += chars.charAt(Math.floor(Math.random() * chars.length));
                  setFormData((prev) => ({ ...prev, password: gen }));
                }}
                className="text-[11px] text-[var(--dusk)] hover:underline font-semibold cursor-pointer"
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              name="password"
              required={isNew}
              autoComplete="new-password"
              placeholder={isNew ? "Enter password or auto-generate" : "Leave blank to keep existing password"}
              value={formData.password}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          {/* Form Actions */}
          <div className="col-span-1 sm:col-span-2 flex items-center justify-between gap-2.5 mt-1.5">
            {!isNew ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onRequestDelete) {
                    onRequestDelete(student);
                  } else if (onDelete) {
                    onDelete(student.id);
                  }
                }}
                className="btn btn--danger"
              >
                Delete student
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
              >
                {isNew ? "Review & confirm →" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 3. PAY NOW MODAL ================= */
export function PayNowModal({ student, paymentSettings, onClose, onShowToast, onOpenReceipt }) {
  if (!student) return null;
  const due = getCurrentDueDate(student);
  const dl = getDaysLeft(student);
  const amount = student.fee;
  const p = paymentSettings;

  const upiNote = encodeURIComponent(`yogaonlive - ${student.name}`);
  const upiUri = `upi://pay?pa=${encodeURIComponent(p.upiId)}&pn=${encodeURIComponent(
    p.payeeName
  )}&am=${amount}&cu=INR&tn=${upiNote}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUri
  )}`;
  const waDigits = toWhatsAppDigits(p.adminWhatsApp);
  const waMsg = encodeURIComponent(
    `Hi, this is ${student.name}. I've just paid my class fee of ₹${amount.toLocaleString(
      "en-IN"
    )}. Please confirm when you get a chance. Thank you!`
  );
  const dueLine =
    dl < 0
      ? `Overdue since ${formatDateHuman(due)}`
      : dl === 0
      ? "Due today"
      : `Due ${formatDateHuman(due)}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (onShowToast) onShowToast("Copied.");
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        <h2 className="modal__title">Pay your class fee</h2>
        <p className="view__note" style={{ margin: "-2px 0 16px" }}>
          ₹{amount.toLocaleString("en-IN")} · {dueLine}
        </p>

        {/* Scan & Pay QR */}
        <div className="mb-4">
          <div className="card__label">Scan &amp; pay with any UPI app</div>
          <div className="flex justify-center my-2.5">
            <img
              src={qrSrc}
              alt={`UPI QR code for ${p.upiId}`}
              className="w-[180px] h-[180px] rounded-xl border bg-white p-1"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div
            className="flex items-center gap-2.5 rounded-[var(--radius-sm)] p-[10px_12px] mb-2.5"
            style={{ background: "var(--bg-alt)" }}
          >
            <span className="text-xs font-bold flex-none" style={{ color: "var(--ink-soft)" }}>
              UPI ID
            </span>
            <code className="mono flex-1 text-sm break-all" style={{ color: "var(--ink)" }}>
              {p.upiId}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(p.upiId)}
              aria-label="Copy UPI ID"
              className="icon-btn"
            >
              <CopyIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <a
            href={upiUri}
            className="btn btn--primary w-full gap-2"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Open in a UPI app</span>
          </a>
        </div>

        {/* Bank Transfer Details */}
        <div className="mb-4">
          <div className="card__label">Or bank transfer</div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-[var(--radius-sm)] p-3.5"
            style={{ background: "var(--bg-alt)" }}
          >
            <div>
              <span className="block text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink-faint)" }}>
                Account name
              </span>
              <strong className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                {p.accountName}
              </strong>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink-faint)" }}>
                Account number
              </span>
              <strong className="mono text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                {p.accountNumber}
              </strong>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink-faint)" }}>
                IFSC
              </span>
              <strong className="mono text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                {p.ifsc}
              </strong>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink-faint)" }}>
                Bank
              </span>
              <strong className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                {p.bankName}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-3">
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary w-full gap-2"
            >
              <ChatIcon className="w-4 h-4" />
              <span>I've paid — notify on WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onShowToast) onShowToast("Thanks! Your instructor will confirm the payment shortly.");
                onClose();
              }}
              className="btn btn--primary w-full gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              <span>I've completed the payment</span>
            </button>
          )}
        </div>

        {onOpenReceipt && (
          <div className="flex justify-center mb-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceipt(student);
              }}
              className="btn btn--sm gap-1.5"
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span>View Past Payment Voucher</span>
            </button>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: "var(--ink-soft)" }}>
          Payments aren't verified automatically here — your instructor confirms it on their side once it's received.
        </p>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 4. PAYMENT SETTINGS MODAL ================= */
export function PaymentSettingsModal({ settings, onClose, onSave }) {
  const [formData, setFormData] = useState({
    upiId: settings?.upiId || "yogaonlive@upi",
    payeeName: settings?.payeeName || "yogaonlive Studio",
    accountName: settings?.accountName || "yogaonlive",
    accountNumber: settings?.accountNumber || "000000000000",
    ifsc: settings?.ifsc || "ABCD0123456",
    bankName: settings?.bankName || "State Bank of India",
    adminWhatsApp: settings?.adminWhatsApp || "+91 90000 00000",
    groupLinkDefault: settings?.groupClassLinks?.default || "https://meet.google.com/yol-studio-live",
    groupLinkHindi: settings?.groupClassLinks?.hindi || "https://meet.google.com/yol-hindi-cohort",
    groupLinkEnglish: settings?.groupClassLinks?.english || "https://meet.google.com/yol-eng-cohort",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      upiId: formData.upiId.trim(),
      payeeName: formData.payeeName.trim(),
      accountName: formData.accountName.trim(),
      accountNumber: formData.accountNumber.trim(),
      ifsc: formData.ifsc.trim(),
      bankName: formData.bankName.trim(),
      adminWhatsApp: formData.adminWhatsApp.trim(),
      groupClassLinks: {
        default: formData.groupLinkDefault.trim(),
        hindi: formData.groupLinkHindi.trim(),
        english: formData.groupLinkEnglish.trim(),
      },
    });
    onClose();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        <h2 className="modal__title">Studio settings &amp; class links</h2>
        <p className="view__note" style={{ margin: "-4px 0 14px" }}>
          Configure studio payment credentials and database-managed meeting links for group cohorts.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Payment Coordinates Divider */}
          <div className="col-span-1 sm:col-span-2 text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink-faint)] border-b pb-1">
            Tuition Payment Coordinates
          </div>

          <label className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>UPI ID</span>
            <input
              type="text"
              name="upiId"
              required
              value={formData.upiId}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Payee name (shown to students)</span>
            <input
              type="text"
              name="payeeName"
              required
              value={formData.payeeName}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Bank account name</span>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Account number</span>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>IFSC code</span>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Bank name</span>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Your WhatsApp number (for "I've paid" pings)</span>
            <input
              type="tel"
              name="adminWhatsApp"
              value={formData.adminWhatsApp}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          {/* Group Class Links Divider */}
          <div className="col-span-1 sm:col-span-2 text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink-faint)] border-b pb-1 mt-2">
            Group Class Meeting Links (Cohort Defaults)
          </div>
          <p className="col-span-1 sm:col-span-2 text-xs text-[var(--ink-soft)]" style={{ marginTop: "-6px" }}>
            These meeting links are automatically inherited by students enrolled in group classes based on their selected language and cohort.
          </p>

          <label className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Default Group Meeting URL</span>
            <input
              type="url"
              name="groupLinkDefault"
              value={formData.groupLinkDefault}
              onChange={handleChange}
              placeholder="https://meet.google.com/yol-studio-live"
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-mono text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Hindi Cohort URL</span>
            <input
              type="url"
              name="groupLinkHindi"
              value={formData.groupLinkHindi}
              onChange={handleChange}
              placeholder="https://meet.google.com/yol-hindi-cohort"
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-mono text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>English Cohort URL</span>
            <input
              type="url"
              name="groupLinkEnglish"
              value={formData.groupLinkEnglish}
              onChange={handleChange}
              placeholder="https://meet.google.com/yol-eng-cohort"
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-mono text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              Save settings &amp; links
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 5. ENQUIRY DETAIL MODAL ================= */
export function EnquiryDetailModal({
  enquiry,
  onClose,
  onUpdateStatus,
  onAcceptEnquiry,
  onDeleteEnrolledStudent,
  onDeleteEnquiry,
}) {
  if (!enquiry) return null;

  const palette = avatarColor(enquiry.id);
  const typeLabel =
    enquiry.classTypeInterest === "group"
      ? "Group"
      : enquiry.classTypeInterest === "private"
      ? "Private"
      : "No preference";

  const ENQUIRY_STATUS_LABEL = {
    pending: "Pending",
    in_progress: "In progress",
    accepted: "Accepted",
    declined: "Declined",
  };

  const ENQUIRY_STATUS_TAG = {
    pending: "pending",
    in_progress: "inprogress",
    accepted: "safe",
    declined: "declined",
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        {/* Profile Strip */}
        <div className="profile-strip">
          <div
            className="avatar"
            style={{
              backgroundColor: palette.bg,
              color: palette.fg,
            }}
          >
            {getInitials(enquiry.name)}
          </div>
          <div>
            <div className="profile-strip__name">{enquiry.name}</div>
            <div className="profile-strip__tags">
              <span className="tag tag--muted">{typeLabel}</span>
              <span className={`tag tag--${ENQUIRY_STATUS_TAG[enquiry.status]}`}>
                {ENQUIRY_STATUS_LABEL[enquiry.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Infogrid */}
        <div className="infogrid">
          <div className="infogrid__item">
            <div className="infogrid__icon">
              <UserIcon />
            </div>
            <div>
              <div className="infogrid__label">Gender</div>
              <div className="infogrid__value">{enquiry.gender || "—"}</div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <UserIcon />
            </div>
            <div>
              <div className="infogrid__label">Age</div>
              <div className="infogrid__value">{enquiry.age ? `${enquiry.age} yrs` : "—"}</div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <UserIcon />
            </div>
            <div>
              <div className="infogrid__label">Height &amp; weight</div>
              <div className="infogrid__value">{enquiry.heightWeight || "—"}</div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <ClockIcon />
            </div>
            <div>
              <div className="infogrid__label">Preferred timings (IST)</div>
              <div className="infogrid__value">{enquiry.preferredTimings || "—"}</div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <CalendarIcon />
            </div>
            <div>
              <div className="infogrid__label">Demo / trial session</div>
              <div className="infogrid__value">
                {enquiry.demoDate ? formatDateHuman(parseDateOnly(enquiry.demoDate)) : "—"}
              </div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <UserIcon />
            </div>
            <div>
              <div className="infogrid__label">Instructor preference</div>
              <div className="infogrid__value">{enquiry.instructorPreference || "Any"}</div>
            </div>
          </div>
        </div>

        {/* Reason / expectations Card */}
        <div className="card mb-4">
          <div className="card__label">Reason / expectations</div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {enquiry.reason || "—"}
          </p>
          {enquiry.otherInfo && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="card__label">Other information</div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {enquiry.otherInfo}
              </p>
            </div>
          )}
        </div>

        {/* Contact Card */}
        <div className="card mb-4">
          <div className="card__label">Contact</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--ink-soft)" }}>Phone</span>
              <strong className="mono" style={{ color: "var(--ink)" }}>{enquiry.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--ink-soft)" }}>Email</span>
              <strong style={{ color: "var(--ink)" }}>{enquiry.email}</strong>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--ink-soft)" }}>Country</span>
              <strong style={{ color: "var(--ink)" }}>{enquiry.country}</strong>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--ink-soft)" }}>Submitted</span>
              <strong style={{ color: "var(--ink)" }}>
                {enquiry.submittedDate ? formatDateHuman(parseDateOnly(enquiry.submittedDate)) : "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex justify-between items-center gap-2 pt-2 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
          <div>
            {onDeleteEnquiry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteEnquiry(enquiry);
                }}
                className="btn btn--sm text-[var(--danger)] hover:bg-[var(--danger-soft)] gap-1"
                title="Delete this inquiry record"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {enquiry.status === "accepted" ? (
              <>
                <span className="tag tag--safe">
                  <CheckIcon className="w-4 h-4" />
                  <span>Enrolled Student Profile Created</span>
                </span>
                {onDeleteEnrolledStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDeleteEnrolledStudent(enquiry);
                    }}
                    className="btn btn--sm btn--danger flex items-center gap-1.5"
                    title="Delete enrolled student account, username, password and revoke portal access"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Delete Enrolled Student</span>
                  </button>
                )}
              </>
            ) : enquiry.status === "declined" ? (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(enquiry.id, "pending");
                onClose();
              }}
              className="btn btn--sm gap-1"
            >
              <UndoIcon className="w-3.5 h-3.5" />
              <span>Reopen</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(enquiry.id, "in_progress");
                  onClose();
                }}
                disabled={enquiry.status === "in_progress"}
                className="btn btn--sm"
              >
                In progress
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(enquiry.id, "declined");
                  onClose();
                }}
                className="btn btn--sm btn--danger"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAcceptEnquiry(enquiry);
                }}
                className="btn btn--sm btn--primary"
              >
                Accept
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </ModalBackdrop>
);
}

/* ================= 5B. BOOKING DETAIL MODAL ================= */
export function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
  onEnrollBooking,
  onRetryEnrollEmail,
  onDeleteEnrolledStudent,
  onDeleteBooking,
}) {
  if (!booking) return null;

  const palette = avatarColor(booking._id || booking.bookingRef || booking.email);
  const classLabel =
    booking.classType === "private"
      ? "Private 1-to-1"
      : booking.classType === "group"
      ? "Group Cohort"
      : "Not sure";

  const BOOKING_STATUS_LABEL = {
    pending: "Pending",
    contacted: "Contacted",
    confirmed: "Confirmed",
    converted: "Enrolled",
    declined: "Declined",
  };

  const BOOKING_STATUS_TAG = {
    pending: "pending",
    contacted: "inprogress",
    confirmed: "soon",
    converted: "safe",
    declined: "declined",
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        {/* Profile Strip */}
        <div className="profile-strip">
          <div
            className="avatar"
            style={{
              backgroundColor: palette.bg,
              color: palette.fg,
            }}
          >
            {getInitials(booking.name)}
          </div>
          <div>
            <div className="profile-strip__name">{booking.name}</div>
            <div className="profile-strip__tags">
              <span className="mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--dusk-soft)] text-[var(--dusk)]">
                {booking.bookingRef || "Pending Ref"}
              </span>
              <span className="tag tag--muted">{classLabel}</span>
              <span className={`tag tag--${BOOKING_STATUS_TAG[booking.status] || "pending"}`}>
                {BOOKING_STATUS_LABEL[booking.status] || booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Infogrid */}
        <div className="infogrid">
          <div className="infogrid__item">
            <div className="infogrid__icon">
              <CalendarIcon />
            </div>
            <div>
              <div className="infogrid__label">Selected Cohort / Timing</div>
              <div className="infogrid__value font-medium">
                {booking.groupCohort || booking.preferredTime || "Flexible"}
              </div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <WalletIcon />
            </div>
            <div>
              <div className="infogrid__label">Tuition Fee</div>
              <div className="infogrid__value font-medium">
                {booking.fee ? `₹${Number(booking.fee).toLocaleString("en-IN")}` : "₹2,500"} / month
              </div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <ClockIcon />
            </div>
            <div>
              <div className="infogrid__label">Timezone &amp; Language</div>
              <div className="infogrid__value">
                {booking.timezone || "Asia/Kolkata"} · {booking.language || "English"}
              </div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <CalendarIcon />
            </div>
            <div>
              <div className="infogrid__label">Requested Joining Date</div>
              <div className="infogrid__value">
                {booking.joiningDate ? formatDateHuman(parseDateOnly(booking.joiningDate)) : "Immediate"}
              </div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <UserIcon />
            </div>
            <div>
              <div className="infogrid__label">Demographics</div>
              <div className="infogrid__value">
                {booking.age ? `${booking.age} yrs` : "—"} · {booking.gender || "—"}
              </div>
            </div>
          </div>

          <div className="infogrid__item">
            <div className="infogrid__icon">
              <SunIcon />
            </div>
            <div>
              <div className="infogrid__label">Source &amp; Referral</div>
              <div className="infogrid__value">
                {booking.source || "Direct Form"}
              </div>
            </div>
          </div>
        </div>

        {/* Message / Goals Card */}
        {booking.message && (
          <div className="card mb-4">
            <div className="card__label">Health Goals / Prior Experience / Notes</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {booking.message}
            </p>
          </div>
        )}

        {/* Contact Card */}
        <div className="card mb-4">
          <div className="card__label">Contact Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--ink-soft)" }}>Phone</span>
              <div className="flex items-center gap-2">
                <strong className="mono" style={{ color: "var(--ink)" }}>{booking.phone || "—"}</strong>
                {booking.phone && (
                  <a
                    href={`https://wa.me/${toWhatsAppDigits(booking.phone)}?text=${encodeURIComponent(
                      `Hi ${booking.name.split(" ")[0]}, namaste from yogaonlive! We received your online booking (${booking.bookingRef || ""}) for ${classLabel}. We would love to finalize your schedule.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] text-[#1D7344] hover:bg-[#1D7344] hover:text-[#FFFFFF] border border-[#C6E6D3] transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--ink-soft)" }}>Email</span>
              <div className="flex items-center gap-2">
                <strong style={{ color: "var(--ink)" }}>{booking.email}</strong>
                <a
                  href={`mailto:${booking.email}?subject=${encodeURIComponent(`yogaonlive Booking Confirmation - ${booking.bookingRef || ""}`)}`}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--surface)] text-[var(--ink-soft)] hover:text-[var(--ink)] border border-[var(--border)]"
                >
                  Email
                </a>
              </div>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--ink-soft)" }}>Country</span>
              <strong style={{ color: "var(--ink)" }}>{booking.country || "—"}</strong>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--ink-soft)" }}>Submitted On</span>
              <strong style={{ color: "var(--ink)" }}>
                {booking.createdAt ? new Date(booking.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex justify-between items-center gap-2 pt-2 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
          <div>
            {onDeleteBooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteBooking(booking);
                }}
                className="btn btn--sm text-[var(--danger)] hover:bg-[var(--danger-soft)] gap-1"
                title="Delete this booking record"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete Booking</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {booking.status === "converted" ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="tag tag--safe">
                  <CheckIcon className="w-4 h-4" />
                  <span>Enrolled in Studio Roster {booking.enrolledStudentId ? `(#${booking.enrolledStudentId})` : ""}</span>
                </span>
                {booking.enrollmentEmailStatus === "sent" && (
                  <span className="tag tag--safe text-xs">
                    ✉️ Credentials Emailed
                  </span>
                )}
                {booking.enrollmentEmailStatus === "failed" && (
                  <div className="flex items-center gap-1.5">
                    <span className="tag tag--urgent text-xs">
                      ⚠️ Email Failed
                    </span>
                    {onRetryEnrollEmail && (
                      <button
                        type="button"
                        onClick={() => onRetryEnrollEmail(booking)}
                        className="btn btn--sm btn--primary text-xs"
                      >
                        Retry Email
                      </button>
                    )}
                  </div>
                )}
                {onDeleteEnrolledStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDeleteEnrolledStudent(booking);
                    }}
                    className="btn btn--sm btn--danger flex items-center gap-1.5"
                    title="Delete enrolled student account, username, password and revoke portal access"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Delete Enrolled Student</span>
                  </button>
                )}
              </div>
            ) : booking.status === "declined" ? (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus && onUpdateStatus(booking._id, "pending");
                onClose();
              }}
              className="btn btn--sm gap-1"
            >
              <UndoIcon className="w-3.5 h-3.5" />
              <span>Reopen</span>
            </button>
          ) : (
            <>
              {booking.status === "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus && onUpdateStatus(booking._id, "contacted");
                    onClose();
                  }}
                  className="btn btn--sm"
                >
                  Mark as Contacted
                </button>
              )}
              {booking.status !== "confirmed" && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus && onUpdateStatus(booking._id, "confirmed");
                    onClose();
                  }}
                  className="btn btn--sm"
                >
                  Confirm Schedule
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus && onUpdateStatus(booking._id, "declined");
                  onClose();
                }}
                className="btn btn--sm btn--danger"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEnrollBooking && onEnrollBooking(booking);
                }}
                className="btn btn--sm btn--primary"
              >
                Enroll as Student
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </ModalBackdrop>
);
}

/* ================= 6. TUITION RECEIPT MODAL ================= */
export function ReceiptModal({ student, paymentSettings, onClose }) {
  if (!student) return null;

  const [currency, setCurrency] = useState("INR"); // "INR" | "USD" | "EUR"
  const due = getCurrentDueDate(student);
  const cycleStart = addMonthsClamped(due, -1);
  const receiptNumber = `YOL-${new Date().getFullYear()}-${String(student.id).padStart(4, "0")}`;
  const todayStr = formatDateHuman(new Date());

  // Multi-currency calculation
  const inrFee = Number(student.fee) || 0;
  const usdAmount = (inrFee / 86.5).toFixed(2);
  const eurAmount = (inrFee / 94.0).toFixed(2);

  const getDisplayAmount = (curr) => {
    if (curr === "USD") return `$${usdAmount} USD`;
    if (curr === "EUR") return `€${eurAmount} EUR`;
    return `₹${inrFee.toLocaleString("en-IN")}.00`;
  };

  const getConversionNotice = (curr) => {
    if (curr === "USD") {
      return `Equiv: ₹${inrFee.toLocaleString("en-IN")}.00 INR · €${eurAmount} EUR (Rate: 1 USD ≈ ₹86.50)`;
    }
    if (curr === "EUR") {
      return `Equiv: ₹${inrFee.toLocaleString("en-IN")}.00 INR · $${usdAmount} USD (Rate: 1 EUR ≈ ₹94.00)`;
    }
    return `≈ $${usdAmount} USD · €${eurAmount} EUR`;
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      generateReceiptPDF(student, paymentSettings, currency);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    printReceiptWindow(student, paymentSettings, currency);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-5">
        {/* Printable Area */}
        <div id="printable-receipt" className="border rounded-[var(--radius-lg)] p-6 sm:p-8 bg-white" style={{ borderColor: "var(--border)" }}>
          {/* Masthead Header */}
          <div className="flex items-start justify-between border-b pb-5 mb-5 flex-wrap gap-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 flex-none" style={{ color: "var(--dawn)" }}>
                  <SunIcon className="w-full h-full" />
                </span>
                <span
                  className="font-bold text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  yogaonlive
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                Studio Practice &amp; Client Learning Ledger
              </p>
              <p className="mono text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>
                Tax / Registration: YOL-YOGA-2026-ONLINE
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <span className="tag tag--safe mb-1.5">
                  Settled &amp; Verified
                </span>
                <div className="mono text-xs font-bold" style={{ color: "var(--ink)" }}>
                  {receiptNumber}
                </div>
                <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                  Issued: {todayStr}
                </div>
              </div>

              {/* Currency Converter Tabs */}
              <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-[var(--radius-sm)] border" style={{ borderColor: "var(--border)" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)] px-1.5">Currency:</span>
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                    currency === "INR" ? "bg-[var(--dusk)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                    currency === "USD" ? "bg-[var(--dusk)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("EUR")}
                  className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                    currency === "EUR" ? "bg-[var(--dusk)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  € EUR
                </button>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b pb-5 mb-5 text-xs" style={{ borderColor: "var(--border)" }}>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--ink-faint)" }}>
                Student Name
              </span>
              <strong className="text-sm font-bold block" style={{ color: "var(--ink)" }}>
                {student.name}
              </strong>
              <span className="text-[11px] block" style={{ color: "var(--ink-soft)" }}>
                {student.country}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--ink-faint)" }}>
                Enrolled Cohort
              </span>
              <strong className="text-xs font-semibold block" style={{ color: "var(--ink)" }}>
                {student.classType === "group"
                  ? `Group (${student.groupName || "Standard"})`
                  : "Private 1-to-1 Practice"}
              </strong>
              <span className="text-[11px] block" style={{ color: "var(--ink-soft)" }}>
                Instructor: {student.instructor}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--ink-faint)" }}>
                Billing Cycle
              </span>
              <strong className="mono text-xs block" style={{ color: "var(--ink)" }}>
                {formatDateHuman(cycleStart)}
              </strong>
              <span className="mono text-[11px] block" style={{ color: "var(--ink-soft)" }}>
                to {formatDateHuman(due)}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b font-bold text-[10.5px] uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--ink-faint)" }}>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Frequency</th>
                  <th className="py-2 text-right">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                <tr>
                  <td className="py-3 font-medium" style={{ color: "var(--ink)" }}>
                    yogaonlive Personalized Asana &amp; Yoga Guidance
                    <span className="block text-[11px] font-normal" style={{ color: "var(--ink-soft)" }}>
                      Live interactive practice, attendance ledgering, and timezone synchronization.
                    </span>
                  </td>
                  <td className="py-3 text-center mono" style={{ color: "var(--ink-soft)" }}>
                    30-Day Cycle
                  </td>
                  <td className="py-3 text-right mono font-bold" style={{ color: "var(--ink)" }}>
                    {getDisplayAmount(currency)}
                    <span className="block text-[10.5px] font-normal" style={{ color: "var(--ink-soft)" }}>
                      {getConversionNotice(currency)}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td colSpan={2} className="py-3 text-right mono font-bold text-xs uppercase" style={{ color: "var(--ink)" }}>
                    Total Settlement Paid:
                  </td>
                  <td className="py-3 text-right mono font-bold text-sm" style={{ color: "var(--ink)" }}>
                    {getDisplayAmount(currency)}
                    <span className="block text-[10.5px] font-normal" style={{ color: "var(--ink-soft)" }}>
                      {getConversionNotice(currency)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Stamp */}
          <div
            className="rounded-[var(--radius-sm)] p-3.5 text-[11.5px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            style={{ background: "var(--bg-alt)" }}
          >
            <div>
              <div className="mono font-bold" style={{ color: "var(--ink)" }}>
                Payment Route: Direct Verified Settlement
              </div>
              <div className="mt-0.5" style={{ color: "var(--ink-soft)" }}>
                Payee UPI ID: <span className="mono font-bold">{paymentSettings?.upiId || "yogaonlive@upi"}</span>
              </div>
            </div>
            <div className="mono text-[10.5px] text-right" style={{ color: "var(--ink-faint)" }}>
              yogaonlive Studio System Stamp
              <br />
              Digital Authorization Validated
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs font-mono" style={{ color: "var(--ink-soft)" }}>
            Receipt with real-time INR ⇄ USD / EUR conversion.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn"
            >
              Print ({currency})
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn btn--primary"
            >
              {isDownloading ? "Generating PDF…" : `Download PDF (${currency})`}
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 7. ENROLL STUDENT CONFIRMATION MODAL ================= */
export function EnrollStudentConfirmModal({
  target,
  type = "booking", // "booking" | "enquiry"
  onClose,
  onConfirmEnroll,
  isEnrolling = false,
  error = null,
}) {
  if (!target) return null;

  const isBooking = type === "booking";
  const name = target.name || "Student";
  const email = target.email || "";
  const phone = target.phone || "—";
  const country = target.country || "India";
  const classType =
    target.classType || (target.classTypeInterest === "group" ? "group" : "private");
  const cohortOrTime =
    target.groupCohort || target.preferredTime || target.preferredTimings || "19:00 IST";
  const fee =
    target.fee || (classType === "private" ? 4000 : 2500);
  const initialInstructor = (() => {
    if (target.instructor && INSTRUCTOR_NAMES.includes(target.instructor)) {
      return target.instructor;
    }
    if (target.instructorPreference && INSTRUCTOR_NAMES.includes(target.instructorPreference)) {
      return target.instructorPreference;
    }
    if (target.instructorPreference === "Female") {
      return "Priya Nair";
    }
    if (target.instructorPreference === "Male") {
      return "Rohan Mehta";
    }
    return INSTRUCTOR_NAMES[0] || "Rohan Mehta";
  })();

  const initialGoals = target.goals || target.message || target.reason || "";
  const initialLanguage = target.language || "English";
  const initialTimezone = target.timezone || "Asia/Kolkata";

  const defaultUsername = (() => {
    const raw = (target.name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, ".");
    const clean = raw.replace(/\.+/g, ".").replace(/^\.|\.$/g, "");
    return clean || "student";
  })();

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$*";
    let p = "";
    for (let i = 0; i < 10; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    return p;
  };

  const [selectedInstructor, setSelectedInstructor] = useState(initialInstructor);
  const [classLink, setClassLink] = useState(target.classLink || "");

  // Pre-generate credentials so admin sees and controls exactly what will be set and mailed
  const [customUsername, setCustomUsername] = useState(defaultUsername);
  const [customPassword, setCustomPassword] = useState(generateRandomPassword);
  const [showPassword, setShowPassword] = useState(true);

  const generatePassword = () => {
    const p = generateRandomPassword();
    setCustomPassword(p);
    setShowPassword(true);
  };

  const handleEnroll = () => {
    const isMatching = !selectedInstructor || selectedInstructor === "matching_in_progress";
    const finalInstructor = isMatching ? "Matching in Progress" : selectedInstructor;
    const finalInstructorStatus = isMatching ? "matching_in_progress" : "assigned";

    onConfirmEnroll(
      {
        ...target,
        instructor: finalInstructor,
        instructorStatus: finalInstructorStatus,
        classLink: classLink.trim(),
        goals: initialGoals,
        language: initialLanguage,
        timezone: initialTimezone,
        username: customUsername.trim(),
        password: customPassword.trim(),
      },
      type
    );
  };

  return (
    <ModalBackdrop onClose={!isEnrolling ? onClose : () => {}}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4">
          <div className="eyebrow flex items-center gap-1.5">
            <SunIcon className="w-3.5 h-3.5" />
            <span>Studio Enrollment</span>
          </div>
          <h2 className="modal__title">Enroll {name}</h2>
          <p className="view__note" style={{ margin: "-2px 0 0" }}>
            Set login credentials and assign an instructor. After confirming, a welcome email with login details is sent to the student.
          </p>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mb-4 p-3 rounded-[var(--radius-sm)] text-sm bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30 font-medium">
            <strong>Enrollment Error:</strong> {error}
          </div>
        )}

        {/* Automated Action Callout */}
        <div
          className="p-4 rounded-[var(--radius-md)] border mb-4"
          style={{
            background: "linear-gradient(135deg, #F8F9FE 0%, #EEF2FD 100%)",
            borderColor: "var(--dusk-soft)",
          }}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--dusk)] mb-2 flex items-center gap-1.5">
            <span>⚡ What happens on enrollment</span>
          </div>
          <ul className="text-xs space-y-1.5 text-[var(--ink)] font-medium">
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-[var(--success)] flex-none mt-0.5" />
              <span>Creates official student account and adds them to the studio roster.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-[var(--success)] flex-none mt-0.5" />
              <span>Saves login credentials (username + password) you set below.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-[var(--success)] flex-none mt-0.5" />
              <span>
                Dispatches a branded HTML welcome email with login credentials directly to{" "}
                <strong className="text-[var(--dusk)]">{email || "registered email"}</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-[var(--success)] flex-none mt-0.5" />
              <span>Removes the enquiry from the active list and moves the student to the roster.</span>
            </li>
          </ul>
        </div>

        {/* Enrollment Summary Card */}
        <div
          className="rounded-[var(--radius-md)] border p-4 mb-4 text-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] mb-3">
            Student Profile &amp; Class Preferences
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Full Name:</span>
              <strong className="text-[var(--ink)]">{name}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Registered Email:</span>
              <strong className="text-[var(--ink)] truncate max-w-[180px]" title={email}>
                {email || "—"}
              </strong>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">WhatsApp / Phone:</span>
              <span className="text-[var(--ink)] font-medium">{phone}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Country / Timezone:</span>
              <span className="text-[var(--ink)] font-medium">{country} ({initialTimezone})</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Class Type:</span>
              <span className="text-[var(--ink)] font-bold capitalize">
                {classType === "private" ? "Private (1-to-1)" : "Group Cohort"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Language:</span>
              <span className="text-[var(--ink)] font-medium">{initialLanguage}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Cohort / Slot:</span>
              <span className="text-[var(--ink)] font-medium">{cohortOrTime}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Monthly Tuition:</span>
              <strong className="text-[var(--success)]">₹{Number(fee).toLocaleString("en-IN")}</strong>
            </div>
          </div>

          {initialGoals && (
            <div className="mt-3 pt-2.5 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs text-[var(--ink-soft)] font-medium block mb-1">Student Goals &amp; Health Focus:</span>
              <div className="text-xs font-semibold text-[var(--ink)] bg-[var(--bg-alt)] p-2 rounded-[var(--radius-sm)]">
                {initialGoals}
              </div>
            </div>
          )}
        </div>

        {/* ── Login Credentials ── */}
        <div
          className="rounded-[var(--radius-md)] border p-4 mb-4"
          style={{
            background: "linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 100%)",
            borderColor: "#F59E0B44",
          }}
        >
          <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "#B45309" }}>
            <UserIcon className="w-3.5 h-3.5" />
            <span>Set Login Credentials</span>
          </div>
          <p className="text-[11.5px] mb-3 leading-relaxed" style={{ color: "#92400E" }}>
            The username and password below will be assigned to the student's account and emailed directly to their inbox upon enrollment. You can edit them freely.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Username */}
            <label className="flex flex-col gap-1.5 text-xs font-bold" style={{ color: "var(--ink-soft)" }}>
              <span>Username to Assign &amp; Mail</span>
              <input
                type="text"
                placeholder="e.g. priya.sharma"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                disabled={isEnrolling}
                autoComplete="off"
                className="p-2 border rounded-[var(--radius-sm)] text-xs font-mono text-[var(--ink)] bg-[var(--surface)]"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </label>

            {/* Password */}
            <label className="flex flex-col gap-1.5 text-xs font-bold" style={{ color: "var(--ink-soft)" }}>
              <div className="flex items-center justify-between">
                <span>Password to Assign &amp; Mail</span>
                <button
                  type="button"
                  onClick={generatePassword}
                  disabled={isEnrolling}
                  className="text-[11px] font-semibold hover:underline cursor-pointer"
                  style={{ color: "var(--dusk)" }}
                >
                  Regenerate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  disabled={isEnrolling}
                  autoComplete="new-password"
                  className="w-full p-2 border rounded-[var(--radius-sm)] text-xs font-mono text-[var(--ink)] bg-[var(--surface)] pr-12"
                  style={{ borderColor: "var(--border-strong)" }}
                />
                {customPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-soft)] hover:text-[var(--dusk)] font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Assignment & Meeting Link Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <label className="flex flex-col gap-1.5 text-xs font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Assign Instructor</span>
            <select
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              className="p-2 border rounded-[var(--radius-sm)] text-xs text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <option value="matching_in_progress">
                ⏳ Matching in Progress (Within 24 Hours)
              </option>
              {INSTRUCTOR_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Initial Meeting URL (Optional)</span>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={classLink}
              onChange={(e) => setClassLink(e.target.value)}
              className="p-2 border rounded-[var(--radius-sm)] font-mono text-xs text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isEnrolling}
            className="btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isEnrolling || !email}
            className="btn btn--primary flex items-center gap-2"
          >
            {isEnrolling ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enrolling &amp; Sending Email…</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Enroll Student</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 8. DELETE ENROLLED STUDENT MODAL (2-STEP VERIFICATION) ================= */
export function DeleteEnrolledStudentModal({
  student,
  booking,
  enquiry,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const [step, setStep] = useState(1);
  const [alsoDeleteRecord, setAlsoDeleteRecord] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const studentName = student?.name || booking?.name || enquiry?.name || "Student";
  const studentId = student?.id || booking?.enrolledStudentId || enquiry?.convertedStudentId;
  const studentUsername =
    student?.username ||
    (booking?.enrolledStudentId
      ? `Student #${booking.enrolledStudentId}`
      : enquiry?.convertedStudentId
      ? `Student #${enquiry.convertedStudentId}`
      : "—");
  const studentEmail = student?.email || booking?.email || enquiry?.email || "—";
  const studentPhone = student?.phone || booking?.phone || enquiry?.phone || "—";
  const studentCountry = student?.country || booking?.country || enquiry?.country || "India";
  const classType = student?.classType || booking?.classType || (enquiry?.classTypeInterest || "private");
  const cohortOrTime =
    classType === "group"
      ? student?.groupName || booking?.groupCohort || "Group Cohort"
      : student?.classTimeIST
      ? `${formatISTTime(student.classTimeIST)} IST`
      : booking?.preferredTime || "1-to-1 Slot";
  const instructor = student?.instructor || booking?.instructorPreference || enquiry?.instructorPreference || "Rohan Mehta";
  const fee = student?.fee ?? (booking?.fee || (classType === "group" ? 2500 : 4000));
  const joiningDate = student?.joiningDate || booking?.joiningDate || "—";

  // Attendance and payment counts
  const attendanceCount = student?.attendance
    ? Object.keys(student.attendance instanceof Map ? Object.fromEntries(student.attendance) : student.attendance).length
    : 0;
  const paymentCount = Array.isArray(student?.paymentHistory) ? student.paymentHistory.length : 0;

  const recordType = booking ? "booking" : enquiry ? "inquiry" : null;
  const palette = avatarColor(studentId || studentName);

  // Challenge matching: user can type student's username or DELETE
  const expectedKeyword = student?.username ? student.username.toLowerCase() : "delete";
  const isInputValid =
    confirmInput.trim().toLowerCase() === expectedKeyword ||
    confirmInput.trim().toUpperCase() === "DELETE";

  const isStep2Ready = isInputValid && confirmCheckbox && !isDeleting;

  return (
    <ModalBackdrop onClose={() => !isDeleting && onClose()} maxWidth="620px">
      <div className="w-full">
        {/* Step Indicator Header */}
        <div className="border-b pb-3.5 mb-4 pr-10" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] leading-snug">
                  Delete Enrolled Student Account
                </h3>
                <span className="text-xs text-[var(--ink-soft)]">
                  Permanent data erasure and credentials revocation
                </span>
              </div>
            </div>

            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--ink-soft)]">
              Step {step} of 2
            </span>
          </div>

          {/* Visual Step Progress Bar & Labels */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  step >= 1 ? "bg-[var(--danger)]" : "bg-[var(--border)]"
                }`}
              />
              <div
                className={`text-[11px] mt-1.5 font-medium transition-colors ${
                  step === 1
                    ? "text-[var(--danger)] font-bold"
                    : "text-[var(--ink-soft)]"
                }`}
              >
                1. Review Student Details
              </div>
            </div>
            <div>
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  step === 2 ? "bg-[var(--danger)]" : "bg-[var(--border)]"
                }`}
              />
              <div
                className={`text-[11px] mt-1.5 font-medium transition-colors ${
                  step === 2
                    ? "text-[var(--danger)] font-bold"
                    : "text-[var(--ink-soft)]"
                }`}
              >
                2. Security Confirmation
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ STEP 1: REVIEW DETAILS & DESTRUCTION SCOPE ══════════ */}
        {step === 1 && (
          <div>
            {/* Student Profile Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-[var(--radius-md)] bg-[var(--bg-alt)] border border-[var(--border)] mb-3.5">
              <div
                className="avatar avatar--md shrink-0"
                style={{ backgroundColor: palette.bg, color: palette.fg }}
              >
                {getInitials(studentName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[var(--ink)] truncate">
                    {studentName}
                  </h4>
                  {studentId && (
                    <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-soft)]">
                      ID #{studentId}
                    </span>
                  )}
                  {booking ? (
                    <span className="tag tag--safe text-[10px]">From Booking ({booking.bookingRef || "Ref"})</span>
                  ) : enquiry ? (
                    <span className="tag tag--safe text-[10px]">From Inquiry (#{enquiry.id})</span>
                  ) : (
                    <span className="tag tag--muted text-[10px]">Active Student</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap text-xs">
                  <span className="tag tag--muted capitalize text-[11px]">
                    {classType === "private" ? "Private 1-to-1" : "Group Cohort"}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--ink-soft)] font-medium">
                    <CountryFlag country={studentCountry} size="xs" />
                    <span>{studentCountry}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Detail Fields Grid */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 mb-3.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-2.5">
                Account &amp; Registration Records
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Username:</span>
                  <strong className="font-mono font-bold text-[var(--ink)] bg-[var(--bg-alt)] px-1.5 py-0.5 rounded">
                    {studentUsername}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Password:</span>
                  <span className="font-mono text-[var(--ink-soft)]">
                    •••••••• (Bcrypt Hashed)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Registered Email:</span>
                  <span className="text-[var(--ink)] truncate max-w-[170px]" title={studentEmail}>
                    {studentEmail}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Phone / WhatsApp:</span>
                  <span className="mono text-[var(--ink)]">{studentPhone}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Assigned Instructor:</span>
                  <span className="text-[var(--ink)] font-medium">{instructor}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Schedule Slot:</span>
                  <span className="text-[var(--ink)] font-medium">{cohortOrTime}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Monthly Fee:</span>
                  <span className="mono font-bold text-[var(--ink)]">₹{fee.toLocaleString("en-IN")} INR</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Joining Date:</span>
                  <span className="mono text-[var(--ink)]">{joiningDate ? formatDateHuman(parseDateOnly(joiningDate)) : "—"}</span>
                </div>
                <div className="flex justify-between items-center py-1 sm:border-b sm:border-[var(--border)]/60">
                  <span className="text-[var(--ink-soft)]">Attendance Sessions:</span>
                  <span className="mono font-bold text-[var(--ink)]">{attendanceCount} sessions logged</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--ink-soft)]">Payment History:</span>
                  <span className="mono font-bold text-[var(--ink)]">{paymentCount} transactions</span>
                </div>
              </div>
            </div>

            {/* Permanent Destruction Scope Alert */}
            <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/30 rounded-[var(--radius-md)] p-3.5 mb-3.5 text-xs text-[var(--ink)]">
              <div className="flex items-center gap-1.5 font-bold text-[var(--danger)] mb-1.5">
                <AlertIcon className="w-4 h-4 shrink-0" />
                <span>Scope of Permanent Destruction</span>
              </div>
              <ul className="space-y-1 text-[11.5px] leading-relaxed list-disc list-inside text-[var(--ink)]/90">
                <li>
                  Student user login account (<span className="font-mono font-semibold">{studentUsername}</span>) and password will be deleted.
                </li>
                <li>
                  All {attendanceCount} attendance logs and {paymentCount} payment transaction ledger receipts will be wiped permanently.
                </li>
                <li>
                  The student will be removed from all active studio metrics, attendance registers, and rosters.
                </li>
              </ul>
            </div>

            {/* Record options if linked to a booking or enquiry */}
            {recordType && (
              <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 mb-3.5 bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)]">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={alsoDeleteRecord}
                    onChange={(e) => setAlsoDeleteRecord(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--danger)] focus:ring-[var(--danger)] cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="font-bold text-[var(--ink)]">
                      Also delete the original {recordType} record ({booking?.bookingRef || `#${enquiry?.id}`})
                    </span>
                    <p className="text-[var(--ink-soft)] text-[11px] mt-0.5 leading-relaxed">
                      {alsoDeleteRecord
                        ? `Both the student login account and the ${recordType} will be permanently destroyed.`
                        : `The student login account will be deleted, and this ${recordType} will be restored to ${
                            recordType === "booking" ? "Confirmed" : "Pending"
                          } so you can re-enroll or re-contact them later.`}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--ink-soft)] font-medium">
                Step 1 of 2: Profile Verification
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn--sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn--sm btn--danger flex items-center gap-1.5"
                >
                  <span>Proceed to Step 2</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 2: SECURITY VERIFICATION CHALLENGE ══════════ */}
        {step === 2 && (
          <div>
            <div className="flex gap-3 p-3.5 rounded-[var(--radius-md)] bg-[var(--danger-soft)] border border-[var(--danger)]/30 mb-4 text-xs">
              <div className="w-8 h-8 rounded-full bg-[var(--danger)]/15 text-[var(--danger)] flex items-center justify-center shrink-0 mt-0.5">
                <AlertIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[var(--danger)] text-xs mb-1">
                  Permanent Data Destruction Warning
                </h4>
                <p className="text-[var(--ink)] leading-relaxed text-[11.5px]">
                  You are about to permanently delete student <strong>{studentName}</strong> (Username:{" "}
                  <span className="font-mono font-bold text-[var(--danger)]">{studentUsername}</span>). This action{" "}
                  <strong>CANNOT</strong> be undone.
                </p>
              </div>
            </div>

            {/* Challenge input */}
            <div className="space-y-3 mb-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--ink-soft)]">
                <span>
                  Please type{" "}
                  {student?.username ? (
                    <>
                      <span className="font-mono text-[var(--danger)] font-bold">{student.username}</span> or{" "}
                    </>
                  ) : null}
                  <span className="font-mono text-[var(--danger)] font-bold">DELETE</span> to confirm:
                </span>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={student?.username ? `Type ${student.username} or DELETE` : "Type DELETE"}
                    className={`w-full h-11 px-3.5 pr-9 border rounded-[var(--radius-sm)] font-mono text-sm text-[var(--ink)] bg-[var(--surface)] transition-all ${
                      isInputValid
                        ? "border-green-500 focus:border-green-600 focus:ring-1 focus:ring-green-500"
                        : "border-[var(--border-strong)] focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)]"
                    }`}
                  />
                  {isInputValid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 flex items-center">
                      <CheckIcon className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </label>

              {/* Checkbox Acknowledgment */}
              <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)]">
                <label className="flex items-start gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={confirmCheckbox}
                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--danger)] focus:ring-[var(--danger)] cursor-pointer shrink-0"
                  />
                  <span className="text-[var(--ink)] leading-relaxed font-medium">
                    I acknowledge that the student username (<strong>{studentUsername}</strong>), password credentials, attendance logs, and financial records will be permanently destroyed.
                  </span>
                </label>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStep(1)}
                className="btn btn--sm gap-1.5"
              >
                <span>← Back to Review</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onClose}
                  className="btn btn--sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isStep2Ready}
                  onClick={() => onConfirm({ student, booking, enquiry, alsoDeleteRecord })}
                  className="btn btn--sm btn--danger flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isDeleting ? "Deleting Student…" : "Permanently Delete Student"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
}

/* ================= 9. EDIT STUDENT CREDENTIALS & PASSWORD MODAL ================= */
export function ResetStudentPasswordModal({
  student,
  onClose,
  onSave,
  isSaving = false,
}) {
  const [username, setUsername] = useState(student?.username || "");
  const [password, setPassword] = useState("");
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ!@#$";
    let p = "";
    for (let i = 0; i < 10; i++) {
      p += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(p);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {}
  };

  const handleCopyUsername = async () => {
    if (!username) return;
    try {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    } catch {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(cleanUser)) {
      setError("Username can only contain lowercase letters, numbers, dots, hyphens, and underscores.");
      return;
    }

    if (password.trim() && password.trim().length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    onSave(student, { username: cleanUser, password: password.trim() });
  };

  return (
    <ModalBackdrop onClose={onClose} maxWidth="500px">
      <div className="w-full">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border)] pr-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <KeyIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--ink)]">Manage Student Credentials</h3>
              <p className="text-[11.5px] text-[var(--ink-soft)]">
                Update username and/or password for {student?.name}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-3 text-xs bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)] rounded-[var(--radius-sm)] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[var(--bg-alt)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[var(--ink-soft)] font-medium">Student:</span>
              <span className="text-[var(--ink-faint)] font-mono">ID #{student?.id}</span>
            </div>
            <div className="font-bold text-sm text-[var(--ink)]">{student?.name}</div>
            <div className="text-[var(--ink-soft)] truncate">Email: {student?.email || "No email"}</div>
          </div>

          {/* Editable Username */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--ink-soft)]">
            <div className="flex items-center justify-between">
              <span>Username:</span>
              {username && (
                <button
                  type="button"
                  onClick={handleCopyUsername}
                  className="text-[11px] text-[var(--dusk)] hover:underline font-normal cursor-pointer"
                >
                  {copiedUsername ? "✓ Copied" : "Copy Username"}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="e.g. john.doe"
                className="input w-full font-mono text-sm h-10 px-3 pr-8"
              />
            </div>
            <span className="text-[10.5px] text-[var(--ink-faint)]">
              Used by student to log into their dashboard. Letters, numbers, hyphens, and dots.
            </span>
          </label>

          {/* Editable Password */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--ink-soft)]">
            <div className="flex items-center justify-between">
              <span>New Password:</span>
              <span className="text-[11px] font-normal text-[var(--ink-faint)]">
                (Leave empty to keep existing)
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type new password or click Generate"
                className="input flex-1 font-mono text-sm h-10 px-3"
              />
              <button
                type="button"
                onClick={handleGenerate}
                className="btn btn--sm text-xs shrink-0"
              >
                Generate
              </button>
              {password && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="btn btn--sm text-xs shrink-0"
                >
                  {copiedPassword ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <span className="text-[10.5px] text-[var(--ink-faint)]">
              Minimum 6 characters. If left empty, the current password will remain unchanged.
            </span>
          </label>

          <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
            💡 <strong>Login Tip:</strong> The student can log in using either their username (<strong>{username || student?.username}</strong>) or registered email address.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn btn--sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !username.trim()}
              className="btn btn--sm btn--primary"
            >
              {isSaving ? "Saving…" : "Save Credentials"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 10. DELETE RECORD MODAL (BOOKINGS & ENQUIRIES 2-STEP) ================= */
export function DeleteRecordModal({
  record,
  recordType = "booking",
  linkedStudent = null,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const [step, setStep] = useState(1);
  const [deleteLinkedStudent, setDeleteLinkedStudent] = useState(true);
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  if (!record) return null;

  const isBooking = recordType === "booking";
  const title = isBooking ? "Delete Booking Record" : "Delete Inquiry Record";
  const refCode = isBooking ? record.bookingRef || "No Ref" : `#${record.id}`;
  const name = record.name || "Unknown";
  const email = record.email || "—";
  const phone = record.phone || "—";
  const country = record.country || "India";
  const classType = isBooking ? record.classType : (record.classTypeInterest || "private");
  const timing = isBooking
    ? record.preferredTime || record.preferredTime2 || "Not Specified"
    : record.preferredTimings || "Not Specified";
  const status = record.status || "pending";
  const hasLinkedStudent = Boolean(
    linkedStudent ||
    record.enrolledStudentId ||
    record.convertedStudentId ||
    status === "converted" ||
    status === "accepted"
  );

  const isChallengeValid =
    confirmInput.trim().toUpperCase() === "DELETE" ||
    (refCode && confirmInput.trim().toLowerCase() === refCode.toLowerCase());

  const isStep2Ready = isChallengeValid && confirmCheckbox && !isDeleting;

  return (
    <ModalBackdrop onClose={() => !isDeleting && onClose()} maxWidth="560px">
      <div className="w-full">
        {/* Step Indicator Header */}
        <div className="border-b pb-3.5 mb-4 pr-10" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] leading-snug">
                  {title}
                </h3>
                <span className="text-xs text-[var(--ink-soft)]">
                  {isBooking ? "Permanent booking removal" : "Permanent inquiry removal"}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--ink-soft)]">
              Step {step} of 2
            </span>
          </div>

          {/* Progress bar */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div className={`h-1.5 rounded-full ${step >= 1 ? "bg-[var(--danger)]" : "bg-[var(--border)]"}`} />
              <div className={`text-[11px] mt-1.5 font-medium ${step === 1 ? "text-[var(--danger)] font-bold" : "text-[var(--ink-soft)]"}`}>
                1. Review Details
              </div>
            </div>
            <div>
              <div className={`h-1.5 rounded-full ${step === 2 ? "bg-[var(--danger)]" : "bg-[var(--border)]"}`} />
              <div className={`text-[11px] mt-1.5 font-medium ${step === 2 ? "text-[var(--danger)] font-bold" : "text-[var(--ink-soft)]"}`}>
                2. Security Challenge
              </div>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <p className="text-xs text-[var(--ink-soft)] mb-3 leading-relaxed">
              Please review the {isBooking ? "booking" : "inquiry"} details below before proceeding with permanent deletion:
            </p>

            <div className="bg-[var(--bg-alt)] border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 mb-3 text-xs space-y-2">
              <div className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/60">
                <span className="text-[var(--ink-soft)]">Reference:</span>
                <span className="font-mono font-bold text-[var(--ink)]">{refCode}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/60">
                <span className="text-[var(--ink-soft)]">Contact Name:</span>
                <span className="font-bold text-[var(--ink)]">{name}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/60">
                <span className="text-[var(--ink-soft)]">Email Address:</span>
                <span className="text-[var(--ink)]">{email}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/60">
                <span className="text-[var(--ink-soft)]">Phone Number:</span>
                <span className="mono text-[var(--ink)]">{phone}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/60">
                <span className="text-[var(--ink-soft)]">Country:</span>
                <div className="flex items-center gap-1">
                  <CountryFlag country={country} size="xs" />
                  <span>{country}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-[var(--border)]/60">
                <span className="text-[var(--ink-soft)]">Class Format:</span>
                <span className="capitalize text-[var(--ink)] font-medium">{classType}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[var(--ink-soft)]">Schedule / Timing:</span>
                <span className="text-[var(--ink)]">{timing}</span>
              </div>
            </div>

            {/* Linked Student Warning & Option */}
            {hasLinkedStudent && (
              <div className="border border-amber-500/30 bg-amber-500/10 rounded-[var(--radius-md)] p-3.5 mb-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
                  <AlertIcon className="w-4 h-4 shrink-0" />
                  <span>Linked Enrolled Student Found</span>
                </div>
                <p className="text-[var(--ink)] text-[11.5px] leading-relaxed mb-2">
                  This {recordType} is currently linked to an enrolled student account
                  {linkedStudent ? ` (${linkedStudent.name}, Username: ${linkedStudent.username})` : ""}.
                </p>
                <label className="flex items-start gap-2.5 cursor-pointer font-medium text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={deleteLinkedStudent}
                    onChange={(e) => setDeleteLinkedStudent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--danger)] focus:ring-[var(--danger)] shrink-0"
                  />
                  <span className="leading-snug">
                    Also permanently delete the enrolled student profile, username, password, attendance, and fee ledgers.
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--ink-soft)] font-medium">
                Step 1 of 2: Record Overview
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn btn--sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn--sm btn--danger flex items-center gap-1.5"
                >
                  <span>Proceed to Step 2</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex gap-3 p-3.5 rounded-[var(--radius-md)] bg-[var(--danger-soft)] border border-[var(--danger)]/30 mb-4 text-xs">
              <div className="w-8 h-8 rounded-full bg-[var(--danger)]/15 text-[var(--danger)] flex items-center justify-center shrink-0 mt-0.5">
                <AlertIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[var(--danger)] text-xs mb-1">
                  Security Verification Required
                </h4>
                <p className="text-[var(--ink)] leading-relaxed text-[11.5px]">
                  Permanently deleting this {recordType} ({refCode} - {name}) is irreversible.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <label className="flex flex-col gap-1.5 font-semibold text-[var(--ink-soft)]">
                <span>
                  Please type <span className="font-mono text-[var(--danger)] font-bold">DELETE</span> to confirm:
                </span>
                <input
                  type="text"
                  autoFocus
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type DELETE"
                  className={`w-full h-11 px-3.5 border rounded-[var(--radius-sm)] font-mono text-sm text-[var(--ink)] bg-[var(--surface)] transition-all ${
                    isChallengeValid
                      ? "border-green-500 focus:border-green-600 focus:ring-1 focus:ring-green-500"
                      : "border-[var(--border-strong)] focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)]"
                  }`}
                />
              </label>

              <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)]">
                <label className="flex items-start gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={confirmCheckbox}
                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--danger)] focus:ring-[var(--danger)] cursor-pointer shrink-0"
                  />
                  <span className="text-[var(--ink)] font-medium leading-relaxed">
                    I confirm that I want to permanently delete this {recordType} record from the system.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStep(1)}
                className="btn btn--sm gap-1.5"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onClose}
                  className="btn btn--sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isStep2Ready}
                  onClick={() => onConfirm({ record, recordType, deleteStudent: deleteLinkedStudent })}
                  className="btn btn--sm btn--danger flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{isDeleting ? "Deleting…" : "Permanently Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
}
