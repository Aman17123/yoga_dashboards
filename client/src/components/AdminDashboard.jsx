import React, { useState, useMemo } from "react";
import {
  UsersIcon,
  UserIcon,
  ClockIcon,
  AlertIcon,
  WalletIcon,
  SearchIcon,
  GearIcon,
  EditIcon,
  TrashIcon,
  ChatIcon,
} from "./Icons";
import {
  getDaysLeft,
  getCurrentDueDate,
  feeTier,
  formatDateHuman,
  formatISTTime,
  parseDateOnly,
  getInitials,
  avatarColor,
  toWhatsAppDigits,
} from "../utils/dateUtils";

export default function AdminDashboard({
  students,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onAddStudent,
  onOpenPaymentSettings,
  onResendWelcomeEmail,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("days");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Compute stats
  const stats = useMemo(() => {
    const total = students.length;
    const priv = students.filter((s) => s.classType === "private").length;
    const grp = total - priv;
    let dueSoon = 0;
    let overdue = 0;

    students.forEach((s) => {
      const dl = getDaysLeft(s);
      if (dl < 0) {
        overdue++;
      } else if (dl <= 7) {
        dueSoon++;
      }
    });

    const monthlyRevenue = students.reduce(
      (sum, s) => sum + (Number(s.fee) || 0),
      0
    );
    return { total, priv, grp, dueSoon, overdue, monthlyRevenue };
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = students.filter((s) => {
      if (filterType !== "all" && s.classType !== filterType) return false;
      if (
        q &&
        !(
          s.name.toLowerCase().includes(q) ||
          (s.instructor && s.instructor.toLowerCase().includes(q)) ||
          (s.country && s.country.toLowerCase().includes(q))
        )
      ) {
        return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === "days") return getDaysLeft(a) - getDaysLeft(b);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "joined")
        return parseDateOnly(a.joiningDate) - parseDateOnly(b.joiningDate);
      if (sortBy === "fee") return b.fee - a.fee;
      return 0;
    });

    return list;
  }, [students, searchQuery, filterType, sortBy]);

  return (
    <section className="w-full">
      {/* View Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="eyebrow">Admin Console</div>
          <h1 className="view__title">All students</h1>
          <p className="view__note">
            yogaonlive practice ledger — view cohort schedules, fees, and reminders.
          </p>
        </div>
      </header>

      {/* Stat Row */}
      <div className="stat-row">
        <div className="statcard">
          <div className="statcard__icon">
            <UsersIcon />
          </div>
          <div>
            <div className="statcard__value">{stats.total}</div>
            <div className="statcard__label">Total students</div>
          </div>
        </div>

        <div className="statcard">
          <div className="statcard__icon">
            <UserIcon />
          </div>
          <div>
            <div className="statcard__value">{stats.priv}</div>
            <div className="statcard__label">Private</div>
          </div>
        </div>

        <div className="statcard">
          <div className="statcard__icon">
            <UsersIcon />
          </div>
          <div>
            <div className="statcard__value">{stats.grp}</div>
            <div className="statcard__label">Group</div>
          </div>
        </div>

        <div className={`statcard ${stats.dueSoon > 0 ? "statcard--warn" : ""}`}>
          <div className="statcard__icon">
            <ClockIcon />
          </div>
          <div>
            <div className="statcard__value">{stats.dueSoon}</div>
            <div className="statcard__label">Due within 7 days</div>
          </div>
        </div>

        <div className={`statcard ${stats.overdue > 0 ? "statcard--danger" : ""}`}>
          <div className="statcard__icon">
            <AlertIcon />
          </div>
          <div>
            <div className="statcard__value">{stats.overdue}</div>
            <div className="statcard__label">Overdue</div>
          </div>
        </div>

        <div className="statcard">
          <div className="statcard__icon">
            <WalletIcon />
          </div>
          <div>
            <div className="statcard__value">₹{stats.monthlyRevenue.toLocaleString("en-IN")}</div>
            <div className="statcard__label">Expected monthly revenue</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2.5 mb-3.5 flex-wrap items-stretch">
        <div className="search flex items-center gap-2 bg-[var(--surface)] border rounded-[var(--radius-sm)] px-3 flex-1 min-w-[220px]" style={{ borderColor: "var(--border-strong)" }}>
          <span className="w-4 h-4 flex-none" style={{ color: "var(--ink-faint)" }}>
            <SearchIcon className="w-full h-full" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, instructor, country…"
            className="border-none outline-none bg-transparent py-2.5 w-full text-sm"
            style={{ color: "var(--ink)" }}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 text-sm font-semibold cursor-pointer"
          style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
        >
          <option value="all">All types</option>
          <option value="private">Private</option>
          <option value="group">Group</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 text-sm font-semibold cursor-pointer"
          style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
        >
          <option value="days">Sort: Fee due soonest</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="joined">Sort: Joining date</option>
          <option value="fee">Sort: Fee (high–low)</option>
        </select>

        <button
          type="button"
          onClick={onOpenPaymentSettings}
          className="btn gap-1.5"
        >
          <GearIcon className="w-3.5 h-3.5" />
          <span>Payment details</span>
        </button>

        <button
          type="button"
          onClick={onAddStudent}
          className="btn btn--primary"
        >
          + Add student
        </button>
      </div>

      {/* Student Table */}
      <div className="table-wrap">
        <table className="stable">
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Instructor</th>
              <th>Country</th>
              <th>Class time</th>
              <th>Fee</th>
              <th>Next due</th>
              <th>Status</th>
              <th>Credentials</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Remind</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={12} className="empty-row">
                  No students match this search.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => {
                const dl = getDaysLeft(s);
                const tier = feeTier(dl);
                const dlText =
                  dl < 0
                    ? `${Math.abs(dl)}d overdue`
                    : dl === 0
                    ? "Due today"
                    : dl === 1
                    ? "1 day left"
                    : `${dl} days left`;
                const palette = avatarColor(s.id);
                const typeLabel = s.classType === "group" ? (s.groupName || "Group") : "Private";

                const remindEnabled = dl <= 2;
                const waDigits = toWhatsAppDigits(s.phone);
                const dueText =
                  dl < 0
                    ? `was due on ${formatDateHuman(getCurrentDueDate(s))}`
                    : dl === 0
                    ? "is due today"
                    : `is due in ${dl} day${dl === 1 ? "" : "s"}`;
                const waMsg = encodeURIComponent(
                  `Hi ${s.name.split(" ")[0]}, friendly reminder from yogaonlive that your class fee of ₹${s.fee.toLocaleString(
                    "en-IN"
                  )} ${dueText}. Please make the payment at your earliest convenience. Thank you!`
                );

                return (
                  <tr
                    key={s.id}
                    onClick={() => onViewStudent(s)}
                    className="stable__row"
                  >
                    <td>
                      <div className="stable__student">
                        <span
                          className="avatar avatar--sm"
                          style={{
                            backgroundColor: palette.bg,
                            color: palette.fg,
                          }}
                        >
                          {getInitials(s.name)}
                        </span>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tag tag--${s.classType === "group" ? "group" : "private"}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td>{s.instructor || "—"}</td>
                    <td>{s.country}</td>
                    <td className="mono">{formatISTTime(s.classTimeIST)} IST</td>
                    <td className="mono">₹{s.fee.toLocaleString("en-IN")}</td>
                    <td className="mono">{formatDateHuman(getCurrentDueDate(s))}</td>
                    <td>
                      <span className={`tag tag--${tier}`}>{dlText}</span>
                    </td>
                    <td>
                      {s.welcomeEmailStatus === "sent" ? (
                        <span className="tag tag--safe text-[11px]" title={`Welcome email sent on ${s.welcomeEmailSentAt ? new Date(s.welcomeEmailSentAt).toLocaleDateString() : "enrollment"}`}>
                          ✉️ Sent
                        </span>
                      ) : s.welcomeEmailStatus === "failed" ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResendWelcomeEmail && onResendWelcomeEmail(s.id);
                          }}
                          className="tag tag--urgent text-[11px] hover:opacity-80 cursor-pointer"
                          title={s.welcomeEmailError || "Email failed - click to retry sending credentials"}
                        >
                          ⚠️ Retry
                        </button>
                      ) : (
                        <span className="tag tag--muted text-[11px]" title="Standard membership">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStudent(s);
                        }}
                        aria-label={`Edit ${s.name}`}
                        title={`Edit details for ${s.name}`}
                        className="icon-btn"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentToDelete(s);
                        }}
                        aria-label={`Delete ${s.name}`}
                        title={`Delete ${s.name}'s account and records`}
                        className="icon-btn icon-btn--danger"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td>
                      {remindEnabled && waDigits ? (
                        <a
                          href={`https://wa.me/${waDigits}?text=${waMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Send WhatsApp reminder to ${s.name}`}
                          className="icon-btn icon-btn--wa"
                        >
                          <ChatIcon className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title={
                            waDigits
                              ? "Unlocks 2 days before the due date"
                              : "No phone number on file"
                          }
                          className="icon-btn"
                        >
                          <ChatIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => !isDeleting && setStudentToDelete(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center flex-none">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[var(--ink)] leading-snug">
                  Delete Student &amp; Account?
                </h3>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  Permanently remove this student and their login credentials from the studio.
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-alt)] border border-[var(--border)] rounded-[var(--radius-sm)] p-3.5 mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--ink-soft)] font-medium">Student Name:</span>
                <span className="font-bold text-[var(--ink)]">{studentToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--ink-soft)] font-medium">Username / Login:</span>
                <span className="font-mono font-semibold text-[var(--ink)]">{studentToDelete.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--ink-soft)] font-medium">Email:</span>
                <span className="text-[var(--ink)]">{studentToDelete.email || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--ink-soft)] font-medium">Class Type:</span>
                <span className="capitalize text-[var(--ink)]">{studentToDelete.classType}</span>
              </div>
            </div>

            <div className="text-xs text-[var(--danger)] bg-[var(--danger-soft)] p-3 rounded-[var(--radius-sm)] mb-5 leading-relaxed font-medium">
              ⚠️ <strong>Warning:</strong> This student will no longer be able to log in to the student portal. All attendance history and payment ledgers will be permanently deleted.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
                className="btn"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteStudent) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteStudent(studentToDelete.id);
                    setStudentToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="btn btn--danger flex items-center gap-1.5"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting…" : "Yes, Delete Account"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
