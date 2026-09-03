import React, { useState, useMemo } from "react";
import {
  ChatIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
  XIcon,
  SearchIcon,
  UndoIcon,
} from "./Icons";
import {
  formatDateHuman,
  parseDateOnly,
  getInitials,
  avatarColor,
} from "../utils/dateUtils";

export default function EnquiriesView({
  enquiries,
  onUpdateEnquiryStatus,
  onAcceptEnquiry,
  onViewEnquiry,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    return {
      total: enquiries.length,
      pending: enquiries.filter((q) => q.status === "pending").length,
      inProgress: enquiries.filter((q) => q.status === "in_progress").length,
      accepted: enquiries.filter((q) => q.status === "accepted").length,
      declined: enquiries.filter((q) => q.status === "declined").length,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = enquiries.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (
        q &&
        !(
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });

    list.sort(
      (a, b) => parseDateOnly(b.submittedDate) - parseDateOnly(a.submittedDate)
    );
    return list;
  }, [enquiries, searchQuery, statusFilter]);

  const statusLabels = {
    pending: "Pending",
    in_progress: "In progress",
    accepted: "Accepted",
    declined: "Declined",
  };

  const statusTags = {
    pending: "bg-[#E6E9FB] text-[#4C5FD5]",
    in_progress: "bg-[#FBEDD6] text-[#C87A12]",
    accepted: "bg-[#DFF5EA] text-[#1E9E63]",
    declined: "bg-[#EEF0FA] text-[#A3A8C3]",
  };

  const statCards = [
    {
      icon: <ChatIcon className="w-4 h-4 text-[#4C5FD5]" />,
      label: "Total enquiries",
      value: stats.total,
      color: "text-[#171A32]",
    },
    {
      icon: <ClockIcon className="w-4 h-4 text-[#C87A12]" />,
      label: "Pending",
      value: stats.pending,
      color: stats.pending > 0 ? "text-[#C87A12]" : "text-[#171A32]",
    },
    {
      icon: <UsersIcon className="w-4 h-4 text-[#4C5FD5]" />,
      label: "In progress",
      value: stats.inProgress,
      color: "text-[#171A32]",
    },
    {
      icon: <CheckIcon className="w-4 h-4 text-[#1E9E63]" />,
      label: "Accepted",
      value: stats.accepted,
      color: "text-[#1E9E63]",
    },
    {
      icon: <XIcon className="w-4 h-4 text-[#E1483C]" />,
      label: "Declined",
      value: stats.declined,
      color: "text-[#E1483C]",
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
          New enquiries
        </h1>
        <p className="text-xs text-[#A3A8C3] mt-1">
          Inbound leads from your website. Accept to directly enroll students with assigned instructors and schedules.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="flex items-center gap-2 bg-white border border-[#CDD2E8] rounded-xl px-3 flex-1 min-w-[220px]">
          <SearchIcon className="w-4 h-4 text-[#A3A8C3]" />
          <input
            type="text"
            placeholder="Search name, email, country…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 text-sm bg-transparent outline-none text-[#171A32]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#CDD2E8] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#171A32] outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white border border-[#E3E6F2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#EEF0FA] text-[#A3A8C3] text-[11.5px] uppercase tracking-wider font-bold border-b border-[#E3E6F2]">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Interested in</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6F2] text-sm">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7089]">
                    No enquiries match this filter.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((q) => {
                  const palette = avatarColor(q.id);
                  const typeLabel =
                    q.classTypeInterest === "group"
                      ? "Group"
                      : q.classTypeInterest === "private"
                      ? "Private"
                      : "Any";

                  return (
                    <tr
                      key={q.id}
                      onClick={() => onViewEnquiry(q)}
                      className="hover:bg-[#EEF0FA] transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-[#171A32]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-none"
                            style={{ backgroundColor: palette.bg, color: palette.fg }}
                          >
                            {getInitials(q.name)}
                          </div>
                          <span>{q.name}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#EEF0FA] text-[#6B7089]">
                          {typeLabel}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-[#171A32]">
                          {q.phone}
                        </div>
                        <div className="text-xs text-[#6B7089]">
                          {q.email}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 text-[#6B7089]">
                        {q.country}
                      </td>

                      {/* Submitted */}
                      <td className="py-3 px-4 font-mono text-xs text-[#171A32]">
                        {formatDateHuman(parseDateOnly(q.submittedDate))}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusTags[q.status]}`}
                        >
                          {statusLabels[q.status]}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {q.status === "accepted" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1E9E63]">
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Enrolled</span>
                          </span>
                        ) : q.status === "declined" ? (
                          <button
                            type="button"
                            onClick={() => onUpdateEnquiryStatus(q.id, "pending")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-xs font-bold text-[#171A32] transition-all"
                          >
                            <UndoIcon className="w-3 h-3" />
                            <span>Reopen</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onUpdateEnquiryStatus(q.id, "in_progress")}
                              disabled={q.status === "in_progress"}
                              className="px-2 py-1 rounded-lg border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-xs font-semibold text-[#171A32] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              In progress
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateEnquiryStatus(q.id, "declined")}
                              className="px-2 py-1 rounded-lg bg-[#FCE4E1] hover:bg-[#E1483C] text-[#E1483C] hover:text-white text-xs font-semibold transition-all"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => onAcceptEnquiry(q)}
                              className="px-2.5 py-1 rounded-lg bg-[#171A32] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                            >
                              Accept
                            </button>
                          </div>
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
