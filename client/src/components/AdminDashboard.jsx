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
      if (dl < 0) overdue++;
      else if (dl <= 7) dueSoon++;
    });

    const monthlyRevenue = students.reduce((sum, s) => sum + (Number(s.fee) || 0), 0);
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

  const statCards = [
    {
      icon: <UsersIcon className="w-4 h-4 text-[#4C5FD5]" />,
      label: "Total students",
      value: stats.total,
      color: "text-[#171A32]",
    },
    {
      icon: <UserIcon className="w-4 h-4 text-[#4C5FD5]" />,
      label: "Private",
      value: stats.priv,
      color: "text-[#171A32]",
    },
    {
      icon: <UsersIcon className="w-4 h-4 text-[#4C5FD5]" />,
      label: "Group",
      value: stats.grp,
      color: "text-[#171A32]",
    },
    {
      icon: <ClockIcon className="w-4 h-4 text-[#C87A12]" />,
      label: "Due within 7 days",
      value: stats.dueSoon,
      color: stats.dueSoon > 0 ? "text-[#C87A12]" : "text-[#171A32]",
    },
    {
      icon: <AlertIcon className="w-4 h-4 text-[#E1483C]" />,
      label: "Overdue",
      value: stats.overdue,
      color: stats.overdue > 0 ? "text-[#E1483C]" : "text-[#171A32]",
    },
    {
      icon: <WalletIcon className="w-4 h-4 text-[#4C5FD5]" />,
      label: "Monthly revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
      color: "text-[#171A32]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#F2994A] mb-1">
          Admin Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171A32]">
          All students
        </h1>
        <p className="text-xs text-[#A3A8C3] mt-1">
          Manage enrolled students, track fee cycles, send WhatsApp reminders, and update class profiles.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((st, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E3E6F2] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EEF0FA] flex items-center justify-center flex-none">
              {st.icon}
            </div>
            <div>
              <div className={`font-mono font-bold text-lg leading-tight ${st.color}`}>
                {st.value}
              </div>
              <div className="text-[11.5px] text-[#6B7089]">
                {st.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap gap-2.5 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#CDD2E8] rounded-xl px-3 flex-1 min-w-[220px]">
          <SearchIcon className="w-4 h-4 text-[#A3A8C3]" />
          <input
            type="text"
            placeholder="Search name, instructor, country…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 text-sm bg-transparent outline-none text-[#171A32]"
          />
        </div>

        {/* Filter Type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-[#CDD2E8] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#171A32] outline-none"
        >
          <option value="all">All types</option>
          <option value="private">Private</option>
          <option value="group">Group</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-[#CDD2E8] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#171A32] outline-none"
        >
          <option value="days">Sort: Fee due soonest</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="joined">Sort: Joining date</option>
          <option value="fee">Sort: Fee (high–low)</option>
        </select>

        {/* Action Buttons */}
        <button
          type="button"
          onClick={onOpenPaymentSettings}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-[#171A32] text-xs font-bold transition-all shadow-xs"
        >
          <GearIcon className="w-4 h-4" />
          <span>Payment details</span>
        </button>

        <button
          type="button"
          onClick={onAddStudent}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold transition-all shadow-xs active:scale-95"
        >
          <span>+ Add student</span>
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-[#E3E6F2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#EEF0FA] text-[#A3A8C3] text-[11.5px] uppercase tracking-wider font-bold border-b border-[#E3E6F2]">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Instructor</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Class time</th>
                <th className="py-3.5 px-4">Fee</th>
                <th className="py-3.5 px-4">Next due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Edit</th>
                <th className="py-3.5 px-4 text-center">Remind</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6F2] text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#6B7089]">
                    No students match your search or filter.
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
                  const typeLabel =
                    s.classType === "group" ? s.groupName || "Group" : "Private";

                  const remindEnabled = dl <= 2;
                  const waDigits = toWhatsAppDigits(s.phone);
                  const dueText =
                    dl < 0
                      ? `was due on ${formatDateHuman(getCurrentDueDate(s))}`
                      : dl === 0
                      ? "is due today"
                      : `is due in ${dl} day${dl === 1 ? "" : "s"}`;
                  const waMsg = encodeURIComponent(
                    `Hi ${s.name.split(" ")[0]}, friendly reminder that your class fee of ₹${s.fee.toLocaleString("en-IN")} ${dueText}. Please make the payment at your earliest convenience. Thank you!`
                  );

                  const badgeStyles = {
                    safe: "bg-[#DFF5EA] text-[#1E9E63]",
                    soon: "bg-[#FBEDD6] text-[#C87A12]",
                    urgent: "bg-[#FCE4E1] text-[#E1483C]",
                    overdue: "bg-[#F6DAD6] text-[#9A2B23]",
                  };

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onViewStudent(s)}
                      className="hover:bg-[#EEF0FA] transition-colors cursor-pointer"
                    >
                      {/* Student */}
                      <td className="py-3 px-4 font-semibold text-[#171A32]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-none"
                            style={{ backgroundColor: palette.bg, color: palette.fg }}
                          >
                            {getInitials(s.name)}
                          </div>
                          <span>{s.name}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            s.classType === "group"
                              ? "bg-[#EFE7FE] text-[#8B5CF6]"
                              : "bg-[#E6E9FB] text-[#4C5FD5]"
                          }`}
                        >
                          {typeLabel}
                        </span>
                      </td>

                      {/* Instructor */}
                      <td className="py-3 px-4 text-[#171A32]">
                        {s.instructor || "—"}
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 text-[#6B7089]">
                        {s.country}
                      </td>

                      {/* Class time */}
                      <td className="py-3 px-4 font-mono text-xs text-[#171A32]">
                        {formatISTTime(s.classTimeIST)} IST
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-4 font-mono font-semibold text-[#171A32]">
                        ₹{s.fee.toLocaleString("en-IN")}
                      </td>

                      {/* Next due */}
                      <td className="py-3 px-4 font-mono text-xs text-[#171A32]">
                        {formatDateHuman(getCurrentDueDate(s))}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeStyles[tier]}`}
                        >
                          {dlText}
                        </span>
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
                          className="w-8 h-8 rounded-lg bg-[#EEF0FA] hover:bg-[#E6E9FB] hover:text-[#4C5FD5] inline-flex items-center justify-center text-[#6B7089] transition-all"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
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
                            className="w-8 h-8 rounded-lg bg-[#DFF5EA] hover:bg-[#1E9E63] hover:text-white inline-flex items-center justify-center text-[#1E9E63] transition-all"
                          >
                            <ChatIcon className="w-4 h-4" />
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
                            className="w-8 h-8 rounded-lg bg-[#EEF0FA] opacity-35 cursor-not-allowed inline-flex items-center justify-center text-[#6B7089]"
                          >
                            <ChatIcon className="w-4 h-4" />
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
