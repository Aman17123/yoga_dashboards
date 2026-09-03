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
  avatarColor,
  toWhatsAppDigits,
  fmtISO,
} from "../utils/dateUtils";

/* ================= MODAL SHELL ================= */
function ModalBackdrop({ children, onClose, title = "" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#171A32]/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-[#F6F7FB] border border-[#E3E6F2] rounded-3xl w-full max-w-2xl sm:max-w-3xl p-5 sm:p-7 shadow-2xl z-10 my-auto max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#CDD2E8] hover:bg-[#FCE4E1] hover:text-[#E1483C] hover:border-[#FCE4E1] flex items-center justify-center text-[#6B7089] transition-all"
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
}) {
  if (!student) return null;
  const palette = avatarColor(student.id);

  const localTime = convertISTTimeToZone(student.classTimeIST, student.timezone);
  const istTime = formatISTTime(student.classTimeIST);

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
          <span>{istTime} IST</span>
          <span className="block text-xs text-[#6B7089] font-normal">
            → {localTime} ({student.country})
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
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-5">
        <div className="flex justify-between items-center pr-10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-none"
              style={{ backgroundColor: palette.bg, color: palette.fg }}
            >
              {getInitials(student.name)}
            </div>
            <div>
              <h2 className="font-bold text-xl text-[#171A32]">
                {student.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-[#6B7089]">
                  {student.country}
                </span>
                <span className="text-xs text-[#A3A8C3]">·</span>
                <span className="text-xs font-semibold text-[#6B7089]">
                  {student.phone}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditStudent(student);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-xs font-bold text-[#171A32] transition-all"
          >
            <EditIcon className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* 2-Column Clocks & Fee */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 bg-white border border-[#E3E6F2] rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-3">
              Right now, both sides
            </div>
            <TimeBridge student={student} currentTime={currentTime} />
          </div>
          <div className="md:col-span-5 bg-white border border-[#E3E6F2] rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-3">
              Fee cycle
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
              className="bg-white border border-[#E3E6F2] rounded-2xl p-3 flex items-start gap-2.5 shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EEF0FA] flex items-center justify-center flex-none">
                {card.icon}
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A3A8C3]">
                  {card.label}
                </div>
                <div className="font-semibold text-xs text-[#171A32] mt-0.5">
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
      alert("Please pick at least one class day for the group.");
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
          <h2 className="text-xl font-bold text-[#171A32]">
            {isNew
              ? prefill
                ? `Enroll ${formData.name || "Student"}`
                : "Add a new student"
              : `Edit ${student.name}`}
          </h2>
          {prefill && (
            <p className="text-xs text-[#A3A8C3] mt-0.5">
              Contact info came from enquiry — assign instructor, schedule & credentials to finish enrollment.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Country</span>
            <input
              type="text"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Student timezone</span>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            >
              {TIMEZONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Class type</span>
            <select
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            >
              <option value="private">Private (1-to-1)</option>
              <option value="group">Group</option>
            </select>
          </label>

          {formData.classType === "group" && (
            <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
              <span>Group name</span>
              <input
                type="text"
                name="groupName"
                value={formData.groupName || ""}
                onChange={handleChange}
                placeholder="e.g. Group A"
                className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Instructor</span>
            <select
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            >
              {INSTRUCTOR_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Class time (IST)</span>
            <input
              type="time"
              name="classTimeIST"
              required
              value={formData.classTimeIST}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Duration</span>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            >
              {["30 Min", "45 Min", "1 Hour", "1.5 Hour"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Fee (₹ / month)</span>
            <input
              type="number"
              name="fee"
              min="0"
              required
              value={formData.fee}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Joining date</span>
            <input
              type="date"
              name="joiningDate"
              required
              value={formData.joiningDate}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Last payment date</span>
            <input
              type="date"
              name="lastPaymentDate"
              required
              value={formData.lastPaymentDate}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>
        </div>

        {/* Days picker for Group */}
        {formData.classType === "group" && (
          <div className="pt-2">
            <span className="text-xs font-bold text-[#6B7089] block mb-2">
              Class days (group meets on)
            </span>
            <div className="flex flex-wrap gap-2">
              {dayLabels.map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => handleDayToggle(v)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    (formData.scheduleDays || []).includes(v)
                      ? "bg-[#171A32] text-white"
                      : "bg-[#EEF0FA] text-[#6B7089] hover:bg-[#CDD2E8]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        <div className="pt-3 border-t border-[#CDD2E8]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#F2994A] mb-2.5">
            Login credentials
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
              <span>Username</span>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
              <span>Password</span>
              <input
                type="text"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#CDD2E8]">
          {!isNew && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove ${student.name} and their login? This cannot be undone.`)) {
                  onDelete(student.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FCE4E1] hover:bg-[#E1483C] text-[#E1483C] hover:text-white text-xs font-bold transition-all"
            >
              Delete student
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-[#171A32] text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
            >
              {isNew ? "Create login & save" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </ModalBackdrop>
  );
}

/* ================= 3. PAY NOW MODAL ================= */
export function PayNowModal({ student, paymentSettings, onClose, onShowToast }) {
  if (!student) return null;
  const due = getCurrentDueDate(student);
  const dl = getDaysLeft(student);
  const amount = student.fee;
  const p = paymentSettings;

  const upiNote = encodeURIComponent(`Class fee - ${student.name}`);
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
    if (onShowToast) onShowToast("Copied to clipboard.");
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#171A32]">
            Pay your class fee
          </h2>
          <p className="text-xs text-[#6B7089] mt-0.5">
            ₹{amount.toLocaleString("en-IN")} · {dueLine}
          </p>
        </div>

        {/* UPI QR & Deep Link */}
        <div className="bg-white border border-[#E3E6F2] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3]">
            Scan &amp; pay with any UPI app
          </div>
          <div className="flex justify-center my-2">
            <img
              src={qrSrc}
              alt="UPI QR Code"
              className="w-44 h-44 rounded-xl border border-[#CDD2E8]"
            />
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#EEF0FA] rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-[#6B7089]">UPI ID</span>
            <code className="font-mono text-sm font-semibold text-[#171A32] truncate">
              {p.upiId}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(p.upiId)}
              className="p-1.5 rounded-lg bg-white hover:bg-[#E6E9FB] hover:text-[#4C5FD5] text-[#6B7089] transition-all"
            >
              <CopyIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={upiUri}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Open in a UPI app</span>
          </a>
        </div>

        {/* Bank Transfer */}
        <div className="bg-white border border-[#E3E6F2] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3]">
            Or bank transfer
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#EEF0FA] rounded-xl p-3 text-xs">
            <div>
              <span className="text-[#A3A8C3] font-bold block mb-0.5">Account name</span>
              <strong className="text-[#171A32] font-semibold">{p.accountName}</strong>
            </div>
            <div>
              <span className="text-[#A3A8C3] font-bold block mb-0.5">Account number</span>
              <strong className="font-mono text-[#171A32] font-semibold">{p.accountNumber}</strong>
            </div>
            <div>
              <span className="text-[#A3A8C3] font-bold block mb-0.5">IFSC</span>
              <strong className="font-mono text-[#171A32] font-semibold">{p.ifsc}</strong>
            </div>
            <div>
              <span className="text-[#A3A8C3] font-bold block mb-0.5">Bank</span>
              <strong className="text-[#171A32] font-semibold">{p.bankName}</strong>
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
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1E9E63] hover:bg-[#177A4B] text-white text-xs font-bold shadow-xs transition-all"
            >
              <ChatIcon className="w-4 h-4" />
              <span>I've paid — notify instructor on WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onShowToast) onShowToast("Thanks! Your instructor will confirm the payment shortly.");
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
            >
              <CheckIcon className="w-4 h-4" />
              <span>I've completed the payment</span>
            </button>
          )}
        </div>

        <p className="text-xs text-[#6B7089] text-center">
          Payments aren't verified automatically here — your instructor confirms it on their console once received.
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
          <h2 className="text-xl font-bold text-[#171A32]">
            Payment details
          </h2>
          <p className="text-xs text-[#A3A8C3] mt-0.5">
            Shown to students on their "Pay now" screen and used to generate the UPI QR code and WhatsApp pings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089] sm:col-span-2">
            <span>UPI ID</span>
            <input
              type="text"
              name="upiId"
              required
              value={formData.upiId}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089] sm:col-span-2">
            <span>Payee name (shown to students)</span>
            <input
              type="text"
              name="payeeName"
              required
              value={formData.payeeName}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Bank account name</span>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Account number</span>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>IFSC code</span>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089]">
            <span>Bank name</span>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-[#6B7089] sm:col-span-2">
            <span>Your WhatsApp number (for "I've paid" pings)</span>
            <input
              type="tel"
              name="adminWhatsApp"
              value={formData.adminWhatsApp}
              onChange={handleChange}
              className="p-2.5 bg-white border border-[#CDD2E8] rounded-xl text-sm font-medium text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#CDD2E8]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-[#171A32] text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            Save payment details
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
  const palette = avatarColor(enquiry.id);

  const statusTags = {
    pending: "bg-[#E6E9FB] text-[#4C5FD5]",
    in_progress: "bg-[#FBEDD6] text-[#C87A12]",
    accepted: "bg-[#DFF5EA] text-[#1E9E63]",
    declined: "bg-[#EEF0FA] text-[#A3A8C3]",
  };

  const statusLabels = {
    pending: "Pending",
    in_progress: "In progress",
    accepted: "Accepted",
    declined: "Declined",
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-none"
            style={{ backgroundColor: palette.bg, color: palette.fg }}
          >
            {getInitials(enquiry.name)}
          </div>
          <div>
            <h2 className="font-bold text-xl text-[#171A32]">
              {enquiry.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-[#6B7089]">
                {enquiry.country}
              </span>
              <span className="text-xs text-[#A3A8C3]">·</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  statusTags[enquiry.status]
                }`}
              >
                {statusLabels[enquiry.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Lead Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white border border-[#E3E6F2] rounded-2xl p-4 shadow-xs text-xs">
          <div>
            <span className="text-[#A3A8C3] font-bold block mb-0.5">Gender</span>
            <strong className="text-[#171A32]">{enquiry.gender || "—"}</strong>
          </div>
          <div>
            <span className="text-[#A3A8C3] font-bold block mb-0.5">Age</span>
            <strong className="text-[#171A32]">{enquiry.age ? `${enquiry.age} yrs` : "—"}</strong>
          </div>
          <div>
            <span className="text-[#A3A8C3] font-bold block mb-0.5">Height &amp; Weight</span>
            <strong className="text-[#171A32]">{enquiry.heightWeight || "—"}</strong>
          </div>
          <div>
            <span className="text-[#A3A8C3] font-bold block mb-0.5">Preferred timing (IST)</span>
            <strong className="text-[#171A32]">{enquiry.preferredTimings || "—"}</strong>
          </div>
          <div>
            <span className="text-[#A3A8C3] font-bold block mb-0.5">Demo trial date</span>
            <strong className="text-[#171A32]">
              {enquiry.demoDate ? formatDateHuman(parseDateOnly(enquiry.demoDate)) : "—"}
            </strong>
          </div>
          <div>
            <span className="text-[#A3A8C3] font-bold block mb-0.5">Instructor preference</span>
            <strong className="text-[#171A32]">{enquiry.instructorPreference || "Any"}</strong>
          </div>
        </div>

        {/* Reason / Goals */}
        <div className="bg-white border border-[#E3E6F2] rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-1">
            Reason / Expectations
          </div>
          <p className="text-sm text-[#171A32]">
            {enquiry.reason || "General fitness & health."}
          </p>
          {enquiry.otherInfo && (
            <div className="mt-3 pt-3 border-t border-[#EEF0FA]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-1">
                Other Information / Health Conditions
              </div>
              <p className="text-xs text-[#6B7089]">
                {enquiry.otherInfo}
              </p>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="bg-white border border-[#E3E6F2] rounded-2xl p-4 shadow-xs text-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8C3] mb-2">
            Contact
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7089]">Phone:</span>
            <strong className="font-mono text-[#171A32]">{enquiry.phone}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7089]">Email:</span>
            <strong className="text-[#171A32]">{enquiry.email}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7089]">Submitted on:</span>
            <strong className="text-[#171A32]">
              {formatDateHuman(parseDateOnly(enquiry.submittedDate))}
            </strong>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {enquiry.status === "accepted" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E9E63]">
              <CheckIcon className="w-4 h-4" />
              <span>Student Enrolled</span>
            </span>
          ) : enquiry.status === "declined" ? (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(enquiry.id, "pending");
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-xs font-bold text-[#171A32] transition-all"
            >
              Reopen
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
                className="px-3.5 py-2 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-xs font-semibold text-[#171A32] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                In progress
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(enquiry.id, "declined");
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FCE4E1] hover:bg-[#E1483C] text-[#E1483C] hover:text-white text-xs font-semibold transition-all"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAcceptEnquiry(enquiry);
                }}
                className="px-4 py-2 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
              >
                Accept &amp; Enroll
              </button>
            </>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
