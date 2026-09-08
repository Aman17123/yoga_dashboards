import React, { useState, useRef, useEffect } from "react";
import {
  AlertIcon,
  ClockIcon,
  ChatIcon,
  CheckIcon,
  XIcon,
  UsersIcon,
  CalendarIcon,
} from "./Icons";
import { getDaysLeft, formatDateHuman, getCurrentDueDate, toWhatsAppDigits } from "../utils/dateUtils";

export default function NotificationCenter({
  students = [],
  enquiries = [],
  bookings = [],
  session,
  onSelectStudent,
  onSelectEnquiry,
  onSelectBooking,
  onPayNow,
  onResendStudentEmail,
  onRetryBookingEmail,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const panelRef = useRef(null);

  // Generate real-time notifications based on active data
  const notifications = [];

  if (session?.role === "admin") {
    // 1. Overdue students
    students.forEach((s) => {
      const dl = getDaysLeft(s);
      if (dl < 0) {
        notifications.push({
          id: `overdue-${s.id}`,
          type: "overdue",
          severity: "high",
          title: `${s.name} — Tuition Overdue`,
          desc: `Tuition of ₹${s.fee.toLocaleString("en-IN")} was due on ${formatDateHuman(
            getCurrentDueDate(s)
          )} (${Math.abs(dl)} days overdue).`,
          time: `${Math.abs(dl)}d overdue`,
          student: s,
          action: "remind",
        });
      } else if (dl <= 3) {
        notifications.push({
          id: `due-soon-${s.id}`,
          type: "due_soon",
          severity: "medium",
          title: `${s.name} — Due in ${dl === 0 ? "Today" : `${dl} days`}`,
          desc: `Tuition of ₹${s.fee.toLocaleString("en-IN")} is due on ${formatDateHuman(
            getCurrentDueDate(s)
          )}.`,
          time: dl === 0 ? "Today" : `${dl}d left`,
          student: s,
          action: "view",
        });
      }
    });

    // 2. Pending Inquiries
    enquiries
      .filter((q) => q.status === "pending")
      .forEach((q) => {
        notifications.push({
          id: `enquiry-${q.id}`,
          type: "enquiry",
          severity: "normal",
          title: `New Applicant — ${q.name}`,
          desc: `Interested in ${q.classTypeInterest === "group" ? "Group" : "Private"} cohort (${q.country}).`,
          time: "Pending Review",
          enquiry: q,
          action: "enquiry",
        });
      });

    // 3. Pending Online Bookings (Book Now form submissions)
    bookings
      .filter((b) => b.status === "pending")
      .forEach((b) => {
        notifications.push({
          id: `booking-${b._id || b.bookingRef}`,
          type: "booking",
          severity: "medium",
          title: `Online Booking — ${b.name}`,
          desc: `${b.classType === "private" ? "Private 1-on-1" : (b.groupCohort || "Group Cohort")} (${b.country || "Global"}). Ref: ${b.bookingRef || "Pending"}`,
          time: "Book Now Form",
          booking: b,
          action: "booking",
        });
      });

    // 4. Failed Welcome Emails (requires admin retry)
    students
      .filter((s) => s.welcomeEmailStatus === "failed")
      .forEach((s) => {
        notifications.push({
          id: `email-failed-${s.id}`,
          type: "email_failed",
          severity: "high",
          title: `Welcome Email Failed — ${s.name}`,
          desc: `Credentials could not be delivered to ${s.email}. Error: ${s.welcomeEmailError || "Delivery error"}. Click to retry.`,
          time: "Retry Available",
          student: s,
          action: "retry_student_email",
        });
      });

    bookings
      .filter((b) => b.status === "converted" && b.enrollmentEmailStatus === "failed")
      .forEach((b) => {
        notifications.push({
          id: `booking-email-failed-${b._id}`,
          type: "email_failed",
          severity: "high",
          title: `Enrollment Email Failed — ${b.name}`,
          desc: `Credentials could not be delivered to ${b.email}. Click to retry.`,
          time: "Retry Available",
          booking: b,
          action: "retry_booking_email",
        });
      });
  } else if (session?.role === "student") {
    const student = students.find((s) => s.id === session.id) || students[0];
    if (student) {
      const dl = getDaysLeft(student);
      if (dl < 0) {
        notifications.push({
          id: `student-overdue-${student.id}`,
          type: "overdue",
          severity: "high",
          title: "Practice Tuition Past Due",
          desc: `Your 30-day fee cycle was due on ${formatDateHuman(
            getCurrentDueDate(student)
          )} (${Math.abs(dl)}d overdue). Please settle online.`,
          time: "Immediate action required",
          student,
          action: "pay",
        });
      } else if (dl <= 7) {
        notifications.push({
          id: `student-due-${student.id}`,
          type: "due_soon",
          severity: "medium",
          title: "Next Tuition Cycle Approaching",
          desc: `Your tuition fee of ₹${student.fee.toLocaleString("en-IN")} is due on ${formatDateHuman(
            getCurrentDueDate(student)
          )}.`,
          time: `${dl}d left`,
          student,
          action: "pay",
        });
      }

      notifications.push({
        id: `student-class-scheduled`,
        type: "class",
        severity: "normal",
        title: "Session Schedule Confirmed",
        desc: `Daily practice at ${student.classTimeIST} IST with Instructor ${student.instructor}.`,
        time: "Active Schedule",
        student,
        action: "none",
      });
    }
  }

  // Filter out dismissed notifications
  const activeList = notifications.filter((n) => !dismissedIds.has(n.id));
  const unreadCount = activeList.length;

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleClearAll = () => {
    setDismissedIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
        className="relative p-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] transition-colors cursor-pointer flex items-center justify-center"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#B64E30] text-[9.5px] font-mono font-bold text-[#FFFFFF] ring-2 ring-[#FFFFFF]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-28px)] sm:w-96 max-w-sm rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-alt)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--ink)]">
                Operational Alerts
              </span>
              <span className="mono text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[var(--surface)] text-[var(--ink-soft)] border border-[var(--border)] font-bold">
                {unreadCount} Active
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] mono text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border)]">
            {activeList.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 rounded-full bg-[var(--success-soft)] text-[var(--success)] mx-auto flex items-center justify-center mb-2">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-[var(--ink)]">
                  All caught up
                </div>
                <div className="text-[11px] text-[var(--ink-soft)] mono mt-0.5">
                  No active fee or schedule alerts.
                </div>
              </div>
            ) : (
              activeList.map((item) => {
                const isOverdue = item.severity === "high" && item.type !== "email_failed";
                const isEmailFailed = item.type === "email_failed";
                const isDueSoon = item.severity === "medium" && item.type !== "booking";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.action === "remind" || item.action === "view") {
                        onSelectStudent && onSelectStudent(item.student);
                        setIsOpen(false);
                      } else if (item.action === "enquiry") {
                        onSelectEnquiry && onSelectEnquiry(item.enquiry);
                        setIsOpen(false);
                      } else if (item.action === "booking") {
                        onSelectBooking && onSelectBooking(item.booking);
                        setIsOpen(false);
                      } else if (item.action === "pay") {
                        onPayNow && onPayNow(item.student);
                        setIsOpen(false);
                      } else if (item.action === "retry_student_email") {
                        onResendStudentEmail && onResendStudentEmail(item.student.id);
                        setIsOpen(false);
                      } else if (item.action === "retry_booking_email") {
                        onRetryBookingEmail && onRetryBookingEmail(item.booking);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3.5 hover:bg-[var(--bg-alt)] transition-colors cursor-pointer group relative ${
                      isOverdue || isEmailFailed ? "bg-[var(--danger-soft)]/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-[4px] flex items-center justify-center flex-none mt-0.5 ${
                            isEmailFailed || isOverdue
                              ? "bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger-soft)]"
                              : item.type === "booking"
                              ? "bg-[var(--dusk-soft)] text-[var(--dusk)] border border-[var(--dusk-soft)]"
                              : isDueSoon
                              ? "bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-soft)]"
                              : "bg-[var(--bg-alt)] text-[var(--ink-soft)] border border-[var(--border)]"
                          }`}
                        >
                          {isEmailFailed || isOverdue ? (
                            <AlertIcon className="w-3.5 h-3.5" />
                          ) : item.type === "booking" ? (
                            <CalendarIcon className="w-3.5 h-3.5" />
                          ) : isDueSoon ? (
                            <ClockIcon className="w-3.5 h-3.5" />
                          ) : (
                            <ChatIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--ink)] leading-snug">
                            {item.title}
                          </div>
                          <p className="text-[11.5px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="mono text-[10px] text-[var(--ink-faint)]">
                              {item.time}
                            </span>
                            {isEmailFailed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.action === "retry_student_email") {
                                    onResendStudentEmail && onResendStudentEmail(item.student.id);
                                  } else {
                                    onRetryBookingEmail && onRetryBookingEmail(item.booking);
                                  }
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--danger)] text-white hover:opacity-90 transition-opacity font-bold"
                              >
                                Retry Dispatch
                              </button>
                            )}
                            {isOverdue && item.student?.phone && session?.role === "admin" && (
                              <a
                                href={`https://wa.me/${toWhatsAppDigits(item.student.phone)}?text=${encodeURIComponent(
                                  `Hi ${item.student.name.split(" ")[0]}, friendly reminder from yogaonlive that your class fee of ₹${item.student.fee.toLocaleString("en-IN")} is overdue. Please settle at your earliest convenience. Thank you!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--success-soft)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white border border-[var(--success-soft)] transition-colors"
                              >
                                <span>WhatsApp Ping</span>
                              </a>
                            )}
                            {item.action === "pay" && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[#121413] text-[#FFFFFF]">
                                Pay Now
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dismiss button */}
                      <button
                        type="button"
                        onClick={(e) => handleDismiss(item.id, e)}
                        className="text-[#8E8A82] hover:text-[#121413] p-1 rounded hover:bg-[#E6E5E0]/40 transition-colors"
                        title="Dismiss alert"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
