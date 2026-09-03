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
  toWhatsAppDigits,
  addMonthsClamped,
  fmtISO,
} from "../utils/dateUtils";
import { generateReceiptPDF, printReceiptWindow } from "../utils/pdfGenerator";

/* ================= MODAL SHELL ================= */
function ModalBackdrop({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#000000]/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] w-full max-w-2xl sm:max-w-3xl p-5 sm:p-7 shadow-2xl z-10 my-auto max-h-[88vh] overflow-y-auto text-[#121413]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-7 h-7 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] flex items-center justify-center text-[#444846] transition-colors cursor-pointer"
        >
          <XIcon className="w-3.5 h-3.5" />
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

  const infoCards = [
    {
      icon: <UserIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Instructor",
      value: student.instructor,
    },
    {
      icon: <ClockIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Class Schedule",
      value: (
        <div>
          <span>{istTime} IST</span>
          <span className="block text-[11px] text-[#6B706E] font-normal">
            Local: {localTime} ({student.country})
          </span>
        </div>
      ),
    },
    {
      icon: <CalendarIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Duration",
      value: student.duration,
    },
    {
      icon: <WalletIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Monthly Tuition",
      value: `₹${student.fee.toLocaleString("en-IN")}`,
    },
    {
      icon: <UsersIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Cohort Group",
      value:
        student.classType === "group"
          ? `Group · ${student.groupName || "Standard"}`
          : "Private (1-on-1 Practice)",
    },
    {
      icon: <CalendarIcon className="w-3.5 h-3.5 text-[#6B706E]" />,
      label: "Enrollment Date",
      value: formatDateHuman(parseDateOnly(student.joiningDate)),
    },
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#121413] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm flex-none">
              {getInitials(student.name)}
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#121413] tracking-tight">
                {student.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-[#6B706E]">
                <span>{student.country}</span>
                <span>·</span>
                <span>{student.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenReceipt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReceipt(student);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-xs font-mono text-[#121413] transition-colors cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Receipt</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditStudent(student);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-xs font-mono text-[#121413] transition-colors cursor-pointer"
            >
              <EditIcon className="w-3 h-3" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* 2-Column Clocks & Fee */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-3">
              Dual Timezone Alignment
            </div>
            <TimeBridge student={student} currentTime={currentTime} />
          </div>
          <div className="md:col-span-5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-3">
              Settlement Cycle
            </div>
            <FeeRing
              student={student}
              mode="admin"
              onUpdatePayment={onUpdatePayment}
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-3 flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] flex items-center justify-center flex-none">
                {card.icon}
              </div>
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#6B706E]">
                  {card.label}
                </div>
                <div className="font-medium text-xs text-[#121413] mt-0.5">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance (Read Only for Admin) */}
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
        username: (prefill.name || "").toLowerCase().replace(/\s+/g, ".") || "",
        password: "pass" + Math.floor(100 + Math.random() * 900),
      };
    }
    return base;
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleDayToggle = (dayNum) => {
    setFormData((prev) => {
      const current = prev.scheduleDays || [];
      const updated = current.includes(dayNum)
        ? current.filter((d) => d !== dayNum)
        : [...current, dayNum];
      return { ...prev, scheduleDays: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.classType === "group" && (!formData.scheduleDays || formData.scheduleDays.length === 0)) {
      alert("Please choose at least one class day for the group cohort.");
      return;
    }
    onSave(formData, student?.id, enquiryId);
  };

  const dayLabels = [
    [1, "Mon"],
    [2, "Tue"],
    [3, "Wed"],
    [4, "Thu"],
    [5, "Fri"],
    [6, "Sat"],
    [0, "Sun"],
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#121413] tracking-tight">
            {isNew
              ? prefill
                ? `Enroll ${formData.name || "Student"}`
                : "Enroll New Practice Student"
              : `Edit Practice Profile: ${student.name}`}
          </h2>
          {prefill && (
            <p className="font-mono text-xs text-[#6B706E] mt-0.5">
              Contact record hydrated from application — assign schedule &amp; credentials to complete enrollment.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Phone / WhatsApp</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Country</span>
            <input
              type="text"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Student Timezone</span>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413] cursor-pointer"
            >
              {TIMEZONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Cohort Type</span>
            <select
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413] cursor-pointer"
            >
              <option value="private">Private (1-on-1)</option>
              <option value="group">Group Cohort</option>
            </select>
          </label>

          {formData.classType === "group" && (
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
              <span>Group Name</span>
              <input
                type="text"
                name="groupName"
                value={formData.groupName || ""}
                onChange={handleChange}
                placeholder="e.g. Morning Pranayama Cohort"
                className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Assigned Instructor</span>
            <select
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413] cursor-pointer"
            >
              {INSTRUCTOR_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Class Time (IST)</span>
            <input
              type="time"
              name="classTimeIST"
              required
              value={formData.classTimeIST}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Duration</span>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans font-medium text-[#121413] focus:outline-none focus:border-[#121413] cursor-pointer"
            >
              {["30 Min", "45 Min", "1 Hour", "1.5 Hour"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Monthly Tuition (₹)</span>
            <input
              type="number"
              name="fee"
              min="0"
              required
              value={formData.fee}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Enrollment Date</span>
            <input
              type="date"
              name="joiningDate"
              required
              value={formData.joiningDate}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Last Payment Date</span>
            <input
              type="date"
              name="lastPaymentDate"
              required
              value={formData.lastPaymentDate}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono font-medium text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>
        </div>

        {/* Days picker for Group */}
        {formData.classType === "group" && (
          <div className="pt-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#6B706E] block mb-2">
              Weekly Cohort Days
            </span>
            <div className="flex flex-wrap gap-2">
              {dayLabels.map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => handleDayToggle(v)}
                  className={`px-3 py-1 rounded-[4px] font-mono text-xs font-medium transition-colors cursor-pointer ${
                    (formData.scheduleDays || []).includes(v)
                      ? "bg-[#121413] text-[#FFFFFF]"
                      : "border border-[#E6E5E0] bg-[#FFFFFF] text-[#6B706E] hover:bg-[#F0EFEA]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        <div className="pt-3 border-t border-[#E6E5E0]">
          <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B706E] mb-2.5">
            Student Portal Credentials
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
              <span>Username</span>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono text-[#121413] focus:outline-none focus:border-[#121413]"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
              <span>Password</span>
              <input
                type="text"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono text-[#121413] focus:outline-none focus:border-[#121413]"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E6E5E0]">
          {!isNew && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Permanently remove ${student.name}'s account and records?`)) {
                  onDelete(student.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-[4px] border border-[#F2C5BE] bg-[#FBEAE8] hover:bg-[#B64E30] text-[#B64E30] hover:text-[#FFFFFF] font-mono text-xs transition-colors cursor-pointer"
            >
              Purge Record
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[6px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
            >
              {isNew ? "Complete Enrollment" : "Save Record Changes"}
            </button>
          </div>
        </div>
      </form>
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

  const upiNote = encodeURIComponent(`Devbhoomi Infotech - ${student.name}`);
  const upiUri = `upi://pay?pa=${encodeURIComponent(p.upiId)}&pn=${encodeURIComponent(
    p.payeeName
  )}&am=${amount}&cu=INR&tn=${upiNote}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUri
  )}`;
  const waDigits = toWhatsAppDigits(p.adminWhatsApp);
  const waMsg = encodeURIComponent(
    `Namaste, this is ${student.name}. I have completed my class tuition settlement of ₹${amount.toLocaleString(
      "en-IN"
    )}. Kindly confirm upon receipt. Thank you!`
  );
  const dueLine =
    dl < 0
      ? `Overdue since ${formatDateHuman(due)}`
      : dl === 0
      ? "Due today"
      : `Due ${formatDateHuman(due)}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (onShowToast) onShowToast("Copied to clipboard.");
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start justify-between pr-8">
          <div>
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#121413] tracking-tight">
              Practice Tuition Settlement
            </h2>
            <p className="font-mono text-xs text-[#6B706E] mt-0.5">
              ₹{amount.toLocaleString("en-IN")} · {dueLine}
            </p>
          </div>
          {onOpenReceipt && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceipt(student);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-xs font-mono text-[#121413] cursor-pointer"
            >
              <span>View Receipt</span>
            </button>
          )}
        </div>

        {/* UPI QR & Deep Link */}
        <div className="bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
            Direct UPI Settlement
          </div>
          <div className="flex justify-center my-2">
            <img
              src={qrSrc}
              alt="UPI QR Code"
              className="w-40 h-40 rounded-[4px] border border-[#E6E5E0] p-1 bg-white"
            />
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#FFFFFF] border border-[#E6E5E0] rounded-[4px] px-3 py-2">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B706E]">
              Studio UPI ID
            </span>
            <code className="font-mono text-xs font-bold text-[#121413] truncate">
              {p.upiId}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(p.upiId)}
              className="p-1 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] transition-colors cursor-pointer"
            >
              <CopyIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={upiUri}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-[6px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] text-xs font-semibold transition-colors"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Launch Installed UPI App</span>
          </a>
        </div>

        {/* Bank Transfer */}
        <div className="bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
            Direct Wire / NEFT / IMPS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFFFFF] border border-[#E6E5E0] rounded-[4px] p-3 text-xs">
            <div>
              <span className="font-mono text-[10px] text-[#6B706E] uppercase tracking-wider block mb-0.5">
                Account Holder
              </span>
              <strong className="text-[#121413] font-medium">{p.accountName}</strong>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#6B706E] uppercase tracking-wider block mb-0.5">
                Account Number
              </span>
              <strong className="font-mono text-[#121413] font-bold">{p.accountNumber}</strong>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#6B706E] uppercase tracking-wider block mb-0.5">
                IFSC Code
              </span>
              <strong className="font-mono text-[#121413] font-bold">{p.ifsc}</strong>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#6B706E] uppercase tracking-wider block mb-0.5">
                Bank Branch
              </span>
              <strong className="text-[#121413] font-medium">{p.bankName}</strong>
            </div>
          </div>
        </div>

        {/* Confirmation Button */}
        <div>
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-[6px] border border-[#C6E6D3] bg-[#EAF5EE] hover:bg-[#1D7344] text-[#1D7344] hover:text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ChatIcon className="w-4 h-4" />
              <span>Payment Transferred — Notify Instructor on WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onShowToast) onShowToast("Settlement notification recorded. Your instructor will update your ledger.");
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-[6px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Confirm Settlement Submission</span>
            </button>
          )}
        </div>

        <p className="font-mono text-[11px] text-[#8E8A82] text-center">
          Tuition reconciliations are confirmed directly by your instructor onto your practice ledger.
        </p>
      </div>
    </ModalBackdrop>
  );
}

/* ================= 4. PAYMENT SETTINGS MODAL ================= */
export function PaymentSettingsModal({ settings, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...settings });

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#121413] tracking-tight">
            Studio Payment Infrastructure
          </h2>
          <p className="font-mono text-xs text-[#6B706E] mt-0.5">
            Banking coordinates displayed on student payment vouchers, QR codes, and automated WhatsApp receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E] sm:col-span-2">
            <span>Primary UPI ID</span>
            <input
              type="text"
              name="upiId"
              required
              value={formData.upiId}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E] sm:col-span-2">
            <span>Payee Name (Displayed to Students)</span>
            <input
              type="text"
              name="payeeName"
              required
              value={formData.payeeName}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Bank Account Holder</span>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Account Number</span>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>IFSC Code</span>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E]">
            <span>Bank Name &amp; Branch</span>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-sans text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono uppercase tracking-wider text-[#6B706E] sm:col-span-2">
            <span>Teacher WhatsApp (with Country Code e.g. +91)</span>
            <input
              type="tel"
              name="adminWhatsApp"
              value={formData.adminWhatsApp}
              onChange={handleChange}
              className="p-2.5 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] text-xs sm:text-sm font-mono text-[#121413] focus:outline-none focus:border-[#121413]"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6E5E0]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-[6px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
          >
            Save Coordinates
          </button>
        </div>
      </form>
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

  const statusTags = {
    pending: "bg-[#FAF2E6] text-[#8A6D3B] border border-[#ECD9BD]",
    in_progress: "bg-[#F0EFEA] text-[#121413] border border-[#E6E5E0]",
    accepted: "bg-[#EAF5EE] text-[#1D7344] border border-[#C6E6D3]",
    declined: "bg-[#FBEAE8] text-[#B64E30] border border-[#F2C5BE]",
  };

  const statusLabels = {
    pending: "Pending Review",
    in_progress: "In Communication",
    accepted: "Enrolled & Active",
    declined: "Declined",
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-[#121413] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm flex-none">
            {getInitials(enquiry.name)}
          </div>
          <div>
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#121413] tracking-tight">
              {enquiry.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-[#6B706E]">
                {enquiry.country}
              </span>
              <span className="text-xs text-[#8E8A82]">·</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[10.5px] font-medium ${
                  statusTags[enquiry.status]
                }`}
              >
                {statusLabels[enquiry.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Lead Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4 text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-0.5">
              Gender
            </span>
            <strong className="text-[#121413] font-medium">{enquiry.gender || "—"}</strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-0.5">
              Age
            </span>
            <strong className="text-[#121413] font-medium">{enquiry.age ? `${enquiry.age} yrs` : "—"}</strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-0.5">
              Height &amp; Weight
            </span>
            <strong className="text-[#121413] font-medium">{enquiry.heightWeight || "—"}</strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-0.5">
              Preferred Timing (IST)
            </span>
            <strong className="text-[#121413] font-medium">{enquiry.preferredTimings || "—"}</strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-0.5">
              Demo Trial Date
            </span>
            <strong className="text-[#121413] font-mono">
              {enquiry.demoDate ? formatDateHuman(parseDateOnly(enquiry.demoDate)) : "—"}
            </strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-0.5">
              Instructor Preference
            </span>
            <strong className="text-[#121413] font-medium">{enquiry.instructorPreference || "Any"}</strong>
          </div>
        </div>

        {/* Reason / Goals */}
        <div className="bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-1">
            Reason / Expectations
          </div>
          <p className="text-xs sm:text-sm text-[#121413] leading-relaxed">
            {enquiry.reason || "General physical conditioning and mindfulness practice."}
          </p>
          {enquiry.otherInfo && (
            <div className="mt-3 pt-3 border-t border-[#E6E5E0]">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-1">
                Health Notes &amp; Physical Observations
              </div>
              <p className="text-xs text-[#444846] leading-relaxed">
                {enquiry.otherInfo}
              </p>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="bg-[#FBFBFA] border border-[#E6E5E0] rounded-[6px] p-4 text-xs space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-2">
            Applicant Contact Coordinates
          </div>
          <div className="flex justify-between items-baseline border-b border-[#E6E5E0]/60 pb-1.5">
            <span className="text-[#6B706E]">Telephone / WhatsApp:</span>
            <strong className="font-mono text-[#121413]">{enquiry.phone}</strong>
          </div>
          <div className="flex justify-between items-baseline border-b border-[#E6E5E0]/60 pb-1.5">
            <span className="text-[#6B706E]">Email:</span>
            <strong className="font-mono text-[#121413]">{enquiry.email}</strong>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[#6B706E]">Application Submitted:</span>
            <strong className="font-mono text-[#121413]">
              {formatDateHuman(parseDateOnly(enquiry.submittedDate))}
            </strong>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E5E0]">
          {enquiry.status === "accepted" ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#1D7344] font-medium">
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
              className="px-3.5 py-1.5 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] font-mono text-xs text-[#121413] transition-colors cursor-pointer"
            >
              Reopen Inquiry
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
                className="px-3 py-1.5 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] font-mono text-xs text-[#121413] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Mark In Progress
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(enquiry.id, "declined");
                  onClose();
                }}
                className="px-3 py-1.5 rounded-[4px] border border-[#F2C5BE] bg-[#FBEAE8] hover:bg-[#B64E30] text-[#B64E30] hover:text-[#FFFFFF] font-mono text-xs transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAcceptEnquiry(enquiry);
                }}
                className="px-4 py-1.5 rounded-[4px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                Enroll Directly
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
  const receiptNumber = `REC-${new Date().getFullYear()}-${String(student.id).padStart(4, "0")}`;
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
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-receipt" className="border border-[#E6E5E0] rounded-[6px] p-6 sm:p-8 bg-[#FFFFFF] text-[#121413]">
          {/* Masthead Header */}
          <div className="flex items-start justify-between border-b border-[#E6E5E0] pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-[4px] bg-[#121413] text-[#FFFFFF] flex items-center justify-center font-bold text-xs">
                  D
                </div>
                <span className="font-sans font-bold text-lg text-[#121413] tracking-tight">
                  Devbhoomi Infotech
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#6B706E]">
                Studio Practice &amp; Client Learning Ledger
              </p>
              <p className="font-mono text-[10.5px] text-[#8E8A82] mt-0.5">
                GST / Service Tax Code: 07AAACD1234F1Z8
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#EAF5EE] text-[#1D7344] border border-[#C6E6D3] font-mono text-xs font-bold uppercase tracking-wider mb-1.5">
                Settled &amp; Verified
              </span>
              <div className="font-mono text-xs font-bold text-[#121413]">
                {receiptNumber}
              </div>
              <div className="font-mono text-[11px] text-[#6B706E]">
                Issued: {todayStr}
              </div>
            </div>
          </div>

          {/* Student & Cohort Coordinates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-[#E6E5E0] pb-6 mb-6 text-xs">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-1">
                Student Name
              </span>
              <strong className="font-sans text-sm font-bold text-[#121413] block">
                {student.name}
              </strong>
              <span className="font-mono text-[#6B706E] text-[11px] block">
                {student.country}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-1">
                Enrolled Cohort
              </span>
              <strong className="font-sans text-xs font-semibold text-[#121413] block">
                {student.classType === "group"
                  ? `Group Cohort (${student.groupName})`
                  : "Private 1-on-1 Practice"}
              </strong>
              <span className="font-mono text-[#6B706E] text-[11px] block">
                Instructor: {student.instructor}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] block mb-1">
                Billing Cycle Period
              </span>
              <strong className="font-mono text-xs font-medium text-[#121413] block">
                {formatDateHuman(cycleStart)}
              </strong>
              <span className="font-mono text-[#6B706E] text-[11px] block">
                to {formatDateHuman(due)}
              </span>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E6E5E0] font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Frequency</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E5E0]/60">
                <tr>
                  <td className="py-3 font-medium text-[#121413]">
                    Yoga Practice &amp; Asana Guidance Cohort Membership
                    <span className="block text-[11px] text-[#6B706E] font-normal">
                      Includes personalized live guidance, attendance ledgering, and timezone synchronization.
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono text-[#6B706E]">
                    30-Day Cycle
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-[#121413]">
                    ₹{student.fee.toLocaleString("en-IN")}.00
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E6E5E0]">
                  <td colSpan={2} className="py-3 text-right font-mono font-bold text-xs uppercase tracking-wider text-[#121413]">
                    Total Settlement Paid:
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-sm text-[#121413]">
                    ₹{student.fee.toLocaleString("en-IN")}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Settlement Details & Sign-off */}
          <div className="bg-[#FBFBFA] border border-[#E6E5E0] rounded-[4px] p-4 text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-mono font-bold text-[#121413]">
                Payment Route: Direct Verified Settlement
              </div>
              <div className="text-[#6B706E] mt-0.5">
                Payee UPI ID: <span className="font-mono font-bold">{paymentSettings?.upiId || "devbhoomi@upi"}</span>
              </div>
            </div>
            <div className="text-right sm:text-right text-[#8E8A82] font-mono text-[10px]">
              Devbhoomi Infotech Studio System Stamp
              <br />
              Digital Authorization Validated
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#6B706E] font-mono self-start sm:self-auto">
            Official PDF voucher for accounting, GST, or tuition expense records.
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] text-xs font-medium cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Print receipt on paper or send to printer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 rounded-[6px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{isDownloading ? "Generating PDF…" : "Download PDF File"}</span>
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
