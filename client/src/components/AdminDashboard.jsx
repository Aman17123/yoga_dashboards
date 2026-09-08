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
  onAddStudent,
  onOpenPaymentSettings,
  onResendWelcomeEmail,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("days");

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
              <th>Remind</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={11} className="empty-row">
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
                        className="icon-btn"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
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
    </section>
  );
}
