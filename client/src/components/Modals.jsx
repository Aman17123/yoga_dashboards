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
} from "./Icons";
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
function ModalBackdrop({ children, onClose }) {
  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel" role="dialog" aria-modal="true">
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
  onUpdatePayment,
  onOpenReceipt,
  onResendWelcomeEmail,
  isResendingEmail = false,
}) {
  if (!student) return null;

  const localTime = convertISTTimeToZone(student.classTimeIST, student.timezone);
  const istTime = formatISTTime(student.classTimeIST);
  const palette = avatarColor(student.id);

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
          {onDeleteStudent && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${student.name} and their user login account (${student.username})? This action cannot be undone.`
                  )
                ) {
                  onDeleteStudent(student.id);
                  onClose();
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
            <div className="flex items-end justify-start sm:justify-end">
              {onResendWelcomeEmail && (
                <button
                  type="button"
                  onClick={() => onResendWelcomeEmail(student.id)}
                  disabled={isResendingEmail}
                  className="btn btn--sm gap-1.5"
                  title="Generate fresh secure password and dispatch welcome email to student"
                >
                  <SunIcon className="w-3.5 h-3.5" />
                  <span>{isResendingEmail ? "Sending…" : "Resend Credentials Email"}</span>
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
      };
    }
    return base;
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const isGroup = formData.classType === "group";
    if (isGroup && (!formData.scheduleDays || formData.scheduleDays.length === 0)) {
      alert("Please select at least one class day for the group cohort.");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      instructor: formData.instructor.trim(),
      fee: Number(formData.fee) || 0,
      username: formData.username.trim(),
      groupName: isGroup ? (formData.groupName.trim() || "Group") : null,
      scheduleDays: isGroup ? formData.scheduleDays : [0, 1, 2, 3, 4, 5, 6],
    };

    onSave(payload, student?.id, enquiryId, bookingId);
    onClose();
  };

  const heading = isNew
    ? prefill
      ? `Enroll ${formData.name || "student"}`
      : "Add a new student"
    : `Edit ${formData.name}`;

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        <h2 className="modal__title">{heading}</h2>
        {prefill && (
          <p className="view__note" style={{ margin: "-4px 0 14px" }}>
            Name, contact info, and class type came from their enquiry — fill in the rest to enroll them.
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

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Instructor</span>
            <select
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)] cursor-pointer"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <option value="">Choose instructor…</option>
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

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Username</span>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Password</span>
            <input
              type="text"
              name="password"
              required
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
                  if (window.confirm(`Remove ${student.name} and their login? This can't be undone.`)) {
                    onDelete(student.id);
                    onClose();
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
                {isNew ? "Create login & save" : "Save changes"}
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div>
        <h2 className="modal__title">Payment details</h2>
        <p className="view__note" style={{ margin: "-4px 0 14px" }}>
          Shown to students on their "Pay now" screen, and used to build the WhatsApp "I've paid" message.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

          <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-2">
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
              Save payment details
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
        <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          {enquiry.status === "accepted" ? (
            <span className="tag tag--safe">
              <CheckIcon className="w-4 h-4" />
              <span>Enrolled Student Profile Created</span>
            </span>
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
        <div className="flex justify-end items-center gap-2 pt-2 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
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
  const instructor =
    target.instructorPreference && target.instructorPreference !== "Any"
      ? target.instructorPreference
      : "Rohan Mehta";

  return (
    <ModalBackdrop onClose={!isEnrolling ? onClose : () => {}}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4">
          <div className="eyebrow flex items-center gap-1.5">
            <SunIcon className="w-3.5 h-3.5" />
            <span>Automated Studio Enrollment</span>
          </div>
          <h2 className="modal__title">Enroll {name}</h2>
          <p className="view__note" style={{ margin: "-2px 0 0" }}>
            Review enrollment parameters before automatically generating credentials and dispatching the welcome email.
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
            <span>⚡ Automated System Workflow</span>
          </div>
          <ul className="text-xs space-y-1.5 text-[var(--ink)] font-medium">
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-[var(--success)] flex-none mt-0.5" />
              <span>Creates official student account with active membership in studio roster.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-[var(--success)] flex-none mt-0.5" />
              <span>Generates a unique username and secure bcrypt-hashed password.</span>
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
              <span>Updates all dashboard statistics and active rosters across clients in real-time.</span>
            </li>
          </ul>
        </div>

        {/* Enrollment Summary Card */}
        <div
          className="rounded-[var(--radius-md)] border p-4 mb-5 text-sm"
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
              <span className="text-[var(--ink-soft)]">Country:</span>
              <span className="text-[var(--ink)] font-medium">{country}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Class Type:</span>
              <span className="text-[var(--ink)] font-bold capitalize">
                {classType === "private" ? "Private (1-to-1)" : "Group Cohort"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Cohort / Slot:</span>
              <span className="text-[var(--ink)] font-medium">{cohortOrTime}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Assigned Instructor:</span>
              <span className="text-[var(--ink)] font-medium">{instructor}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-[var(--ink-soft)]">Monthly Tuition Fee:</span>
              <strong className="text-[var(--success)]">₹{Number(fee).toLocaleString("en-IN")}</strong>
            </div>
          </div>
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
            onClick={() => onConfirmEnroll && onConfirmEnroll(target, type)}
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

