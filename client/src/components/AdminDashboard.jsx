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
  toWhatsAppDigits,
} from "../utils/dateUtils";

export default function AdminDashboard({
  students,
  onViewStudent,
  onEditStudent,
  onAddStudent,
  onOpenPaymentSettings,
  onOpenReceipt,
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
    let overdueAmount = 0;

    students.forEach((s) => {
      const dl = getDaysLeft(s);
      if (dl < 0) {
        overdue++;
        overdueAmount += Number(s.fee) || 0;
      } else if (dl <= 7) {
        dueSoon++;
      }
    });

    const monthlyRevenue = students.reduce(
      (sum, s) => sum + (Number(s.fee) || 0),
      0
    );
    return { total, priv, grp, dueSoon, overdue, overdueAmount, monthlyRevenue };
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = students.filter((s) => {
      const dl = getDaysLeft(s);
      if (filterType === "overdue" && dl >= 0) return false;
      if (filterType === "dueSoon" && (dl < 0 || dl > 7)) return false;
      if (filterType === "private" && s.classType !== "private") return false;
      if (filterType === "group" && s.classType !== "group") return false;

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

  const statCards = [
    {
      icon: <UsersIcon className="w-3.5 h-3.5" />,
      label: "Total Enrolled",
      value: stats.total,
      color: "text-[#121413]",
    },
    {
      icon: <UserIcon className="w-3.5 h-3.5" />,
      label: "Private 1-on-1",
      value: stats.priv,
      color: "text-[#121413]",
    },
    {
      icon: <UsersIcon className="w-3.5 h-3.5" />,
      label: "Group Cohorts",
      value: stats.grp,
      color: "text-[#121413]",
    },
    {
      icon: <ClockIcon className="w-3.5 h-3.5" />,
      label: "Due in 7 Days",
      value: stats.dueSoon,
      color: stats.dueSoon > 0 ? "text-[#8A6D3B]" : "text-[#121413]",
    },
    {
      icon: <AlertIcon className="w-3.5 h-3.5" />,
      label: "Overdue Cycles",
      value: stats.overdue,
      color: stats.overdue > 0 ? "text-[#B64E30]" : "text-[#121413]",
    },
    {
      icon: <WalletIcon className="w-3.5 h-3.5" />,
      label: "Monthly Tuition",
      value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
      color: "text-[#121413]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border border-[#E6E5E0] bg-[#F0EFEA] text-[#6B706E] font-mono text-[10px] uppercase tracking-wider mb-2">
          <span>Devbhoomi Infotech Studio Console</span>
        </div>
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#121413] tracking-tight">
          Student Ledgers &amp; Cohort Operations
        </h1>
        <p className="text-xs sm:text-sm text-[#444846] mt-1 max-w-2xl leading-relaxed">
          Monitor student cohorts, inspect 30-day fee cycles, dispatch WhatsApp reminders, and issue printable tuition receipts.
        </p>
      </div>

      {/* Overdue Fee Alert Banner (Visible when any student is overdue) */}
      {stats.overdue > 0 && (
        <div className="bg-[#FBEAE8] border border-[#F2C5BE] rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#B64E30] text-white flex items-center justify-center flex-none">
              <AlertIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#121413] flex items-center gap-2">
                <span>Action Needed: {stats.overdue} Student {stats.overdue === 1 ? "Account is" : "Accounts are"} Overdue</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FFFFFF] text-[#B64E30] border border-[#F2C5BE]">
                  ₹{stats.overdueAmount.toLocaleString("en-IN")} pending
                </span>
              </div>
              <div className="text-xs text-[#444846] mt-0.5">
                Practice tuition has lapsed past the 30-day cycle. Tap to filter overdue students or send one-click WhatsApp pings.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterType(filterType === "overdue" ? "all" : "overdue")}
              className={`px-3 py-1.5 rounded-[4px] font-mono text-xs font-semibold transition-colors cursor-pointer ${
                filterType === "overdue"
                  ? "bg-[#121413] text-[#FFFFFF]"
                  : "bg-[#B64E30] hover:bg-[#963E24] text-[#FFFFFF]"
              }`}
            >
              {filterType === "overdue" ? "Showing Overdue (Clear)" : "Filter Overdue Accounts"}
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((st, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] p-3.5 flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between text-[#6B706E] mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider truncate">
                {st.label}
              </span>
              <div className="text-[#6B706E] flex-none">{st.icon}</div>
            </div>
            <div
              className={`font-sans text-2xl font-bold tracking-tight leading-none ${st.color}`}
            >
              {st.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-medium transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-[#121413] text-[#FFFFFF]"
                : "bg-[#FFFFFF] border border-[#E6E5E0] text-[#6B706E] hover:bg-[#F0EFEA]"
            }`}
          >
            All Students ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("overdue")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === "overdue"
                ? "bg-[#B64E30] text-[#FFFFFF]"
                : "bg-[#FBEAE8] border border-[#F2C5BE] text-[#B64E30] hover:bg-[#B64E30] hover:text-[#FFFFFF]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>Overdue ({stats.overdue})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType("dueSoon")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-medium transition-colors cursor-pointer ${
              filterType === "dueSoon"
                ? "bg-[#121413] text-[#FFFFFF]"
                : "bg-[#FFFFFF] border border-[#E6E5E0] text-[#6B706E] hover:bg-[#F0EFEA]"
            }`}
          >
            Due in 7d ({stats.dueSoon})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("private")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-medium transition-colors cursor-pointer ${
              filterType === "private"
                ? "bg-[#121413] text-[#FFFFFF]"
                : "bg-[#FFFFFF] border border-[#E6E5E0] text-[#6B706E] hover:bg-[#F0EFEA]"
            }`}
          >
            Private ({stats.priv})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("group")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-medium transition-colors cursor-pointer ${
              filterType === "group"
                ? "bg-[#121413] text-[#FFFFFF]"
                : "bg-[#FFFFFF] border border-[#E6E5E0] text-[#6B706E] hover:bg-[#F0EFEA]"
            }`}
          >
            Group ({stats.grp})
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex flex-wrap gap-2.5 items-center flex-1 min-w-[280px]">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] px-3 flex-1 min-w-[200px]">
              <SearchIcon className="w-3.5 h-3.5 text-[#8E8A82]" />
              <input
                type="text"
                placeholder="Filter by student, instructor, or country…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 text-xs sm:text-sm bg-transparent outline-none text-[#121413] placeholder-[#8E8A82]"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E6E5E0] rounded-[6px] px-2.5 py-2 text-xs font-mono text-[#121413] outline-none cursor-pointer"
            >
              <option value="days">Sort: Due soonest</option>
              <option value="name">Sort: Name (A–Z)</option>
              <option value="joined">Sort: Enrolled date</option>
              <option value="fee">Sort: Tuition (High–Low)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPaymentSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] text-[#121413] text-xs font-medium transition-colors cursor-pointer"
            >
              <GearIcon className="w-3.5 h-3.5 text-[#6B706E]" />
              <span>Tuition Settings</span>
            </button>

            <button
              type="button"
              onClick={onAddStudent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#121413] hover:bg-[#2A2E2C] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>+ Enroll Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="border border-[#E6E5E0] rounded-[6px] bg-[#FFFFFF] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#FBFBFA] text-[#6B706E] font-mono text-[10px] uppercase tracking-wider border-b border-[#E6E5E0]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Cohort</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Schedule (IST)</th>
                <th className="py-3 px-4">Tuition</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Cycle Status</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-center">Edit</th>
                <th className="py-3 px-4 text-center">Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E5E0]/70 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#6B706E] font-mono text-xs">
                    No active student records found matching this criterion.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const dl = getDaysLeft(s);
                  const isOverdue = dl < 0;
                  const tier = feeTier(dl);
                  const dlText =
                    dl < 0
                      ? `${Math.abs(dl)}d overdue`
                      : dl === 0
                      ? "Due today"
                      : dl === 1
                      ? "1 day left"
                      : `${dl} days left`;
                  const typeLabel =
                    s.classType === "group" ? s.groupName || "Group" : "Private (1-on-1)";

                  const remindEnabled = dl <= 2;
                  const waDigits = toWhatsAppDigits(s.phone);
                  const dueText =
                    dl < 0
                      ? `was due on ${formatDateHuman(getCurrentDueDate(s))}`
                      : dl === 0
                      ? "is due today"
                      : `is due in ${dl} day${dl === 1 ? "" : "s"}`;
                  const waMsg = encodeURIComponent(
                    `Namaste ${s.name.split(" ")[0]}, this is a courtesy reminder regarding your Devbhoomi Infotech class tuition of ₹${s.fee.toLocaleString("en-IN")}, which ${dueText}. Please submit settlement at your convenience. Thank you!`
                  );

                  const badgeStyles = {
                    safe: "bg-[#EAF5EE] text-[#1D7344] border border-[#C6E6D3]",
                    soon: "bg-[#FAF2E6] text-[#8A6D3B] border border-[#ECD9BD]",
                    urgent: "bg-[#FBEAE8] text-[#B64E30] border border-[#F2C5BE]",
                    overdue: "bg-[#FBEAE8] text-[#B64E30] border border-[#F2C5BE] font-bold",
                  };

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onViewStudent(s)}
                      className={`transition-colors cursor-pointer ${
                        isOverdue
                          ? "bg-[#FBEAE8]/20 hover:bg-[#FBEAE8]/40 border-l-4 border-l-[#B64E30]"
                          : "hover:bg-[#FBFBFA]"
                      }`}
                    >
                      {/* Student */}
                      <td className="py-3 px-4 font-semibold text-[#121413]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-[4px] font-mono text-[10px] flex items-center justify-center font-bold flex-none ${
                              isOverdue
                                ? "bg-[#B64E30] text-[#FFFFFF]"
                                : "bg-[#121413] text-[#FFFFFF]"
                            }`}
                          >
                            {getInitials(s.name)}
                          </div>
                          <span className={isOverdue ? "text-[#B64E30] font-bold" : ""}>
                            {s.name}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[10.5px] border border-[#E6E5E0] bg-[#FBFBFA] text-[#444846]">
                          {typeLabel}
                        </span>
                      </td>

                      {/* Instructor */}
                      <td className="py-3 px-4 text-[#444846]">
                        {s.instructor || "—"}
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 text-[#6B706E]">
                        {s.country}
                      </td>

                      {/* Class time */}
                      <td className="py-3 px-4 font-mono text-[#121413]">
                        {formatISTTime(s.classTimeIST)} IST
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-4 font-mono font-semibold text-[#121413]">
                        ₹{s.fee.toLocaleString("en-IN")}
                      </td>

                      {/* Next due */}
                      <td
                        className={`py-3 px-4 font-mono ${
                          isOverdue ? "text-[#B64E30] font-bold" : "text-[#444846]"
                        }`}
                      >
                        {formatDateHuman(getCurrentDueDate(s))}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[10.5px] font-medium ${badgeStyles[tier]}`}
                        >
                          {dlText}
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenReceipt && onOpenReceipt(s)}
                          title="Generate printable receipt"
                          className="w-7 h-7 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] inline-flex items-center justify-center text-[#121413] transition-colors cursor-pointer"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </button>
                      </td>

                      {/* Edit */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onEditStudent(s)}
                          aria-label={`Edit ${s.name}`}
                          className="w-7 h-7 rounded-[4px] border border-[#E6E5E0] bg-[#FFFFFF] hover:bg-[#F0EFEA] inline-flex items-center justify-center text-[#444846] transition-colors cursor-pointer"
                        >
                          <EditIcon className="w-3 h-3" />
                        </button>
                      </td>

                      {/* WhatsApp Remind */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {remindEnabled && waDigits ? (
                          <a
                            href={`https://wa.me/${waDigits}?text=${waMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Send WhatsApp reminder to ${s.name}`}
                            className={`w-7 h-7 rounded-[4px] inline-flex items-center justify-center transition-colors cursor-pointer ${
                              isOverdue
                                ? "border border-[#F2C5BE] bg-[#B64E30] text-[#FFFFFF] hover:bg-[#8F3B23]"
                                : "border border-[#C6E6D3] bg-[#EAF5EE] text-[#1D7344] hover:bg-[#1D7344] hover:text-[#FFFFFF]"
                            }`}
                          >
                            <ChatIcon className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title={
                              waDigits
                                ? "Unlocks 2 days before due date"
                                : "No phone number on file"
                            }
                            className="w-7 h-7 rounded-[4px] border border-[#E6E5E0] bg-[#FBFBFA] opacity-40 cursor-not-allowed inline-flex items-center justify-center text-[#8E8A82]"
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
      </div>
    </div>
  );
}
