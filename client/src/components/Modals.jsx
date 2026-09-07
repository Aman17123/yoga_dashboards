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
  onUpdatePayment,
  onOpenReceipt,
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
        classType: prefill.classType || "private",
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

    onSave(payload, student?.id, enquiryId);
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

/* ================= 6. TUITION RECEIPT MODAL ================= */
export function ReceiptModal({ student, paymentSettings, onClose }) {
  if (!student) return null;

  const due = getCurrentDueDate(student);
  const cycleStart = addMonthsClamped(due, -1);
  const receiptNumber = `YOL-${new Date().getFullYear()}-${String(student.id).padStart(4, "0")}`;
  const todayStr = formatDateHuman(new Date());

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      generateReceiptPDF(student, paymentSettings);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    printReceiptWindow(student, paymentSettings);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-5">
        {/* Printable Area */}
        <div id="printable-receipt" className="border rounded-[var(--radius-lg)] p-6 sm:p-8 bg-white" style={{ borderColor: "var(--border)" }}>
          {/* Masthead Header */}
          <div className="flex items-start justify-between border-b pb-5 mb-5" style={{ borderColor: "var(--border)" }}>
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
                  <th className="py-2 text-right">Amount</th>
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
                    ₹{student.fee.toLocaleString("en-IN")}.00
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td colSpan={2} className="py-3 text-right mono font-bold text-xs uppercase" style={{ color: "var(--ink)" }}>
                    Total Settlement Paid:
                  </td>
                  <td className="py-3 text-right mono font-bold text-sm" style={{ color: "var(--ink)" }}>
                    ₹{student.fee.toLocaleString("en-IN")}.00
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
            Official electronic receipt for tuition records.
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
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn btn--primary"
            >
              {isDownloading ? "Generating PDF…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
