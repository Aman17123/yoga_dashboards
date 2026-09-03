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
    pending: "Pending Review",
    in_progress: "In Communication",
    accepted: "Enrolled & Active",
    declined: "Declined",
  };

  const statusTags = {
    pending: "bg-[#FAF2E6] text-[#8A6D3B] border border-[#ECD9BD]",
    in_progress: "bg-[#F4F2EB] text-[#161918] border border-[#DCD8D0]",
    accepted: "bg-[#EAF5EE] text-[#1D7344] border border-[#C6E6D3]",
    declined: "bg-[#FBEAE8] text-[#B64E30] border border-[#F2C5BE]",
  };

  const statCards = [
    {
      icon: <ChatIcon className="w-3.5 h-3.5" />,
      label: "Total Inquiries",
      value: stats.total,
      color: "text-[#161918]",
    },
    {
      icon: <ClockIcon className="w-3.5 h-3.5" />,
      label: "Pending Review",
      value: stats.pending,
      color: stats.pending > 0 ? "text-[#8A6D3B]" : "text-[#161918]",
    },
    {
      icon: <UsersIcon className="w-3.5 h-3.5" />,
      label: "In Communication",
      value: stats.inProgress,
      color: "text-[#161918]",
    },
    {
      icon: <CheckIcon className="w-3.5 h-3.5" />,
      label: "Enrolled",
      value: stats.accepted,
      color: "text-[#1D7344]",
    },
    {
      icon: <XIcon className="w-3.5 h-3.5" />,
      label: "Declined",
      value: stats.declined,
      color: "text-[#B64E30]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] border border-[#DCD8D0] bg-[#F2EFE9] text-[#6B706E] font-mono text-[10.5px] uppercase tracking-wider mb-2">
          <span>Inbound Studio Lead Queue</span>
        </div>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-normal text-[#161918] tracking-tight">
          Prospective Student Applications
        </h1>
        <p className="text-xs sm:text-sm text-[#444846] mt-1 max-w-2xl leading-relaxed">
          Review candidate health disclosures, verify time alignment, and convert qualifying candidates into active student rosters with one click.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((st, idx) => (
          <div
            key={idx}
            className="bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#6B706E] mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider truncate">
                {st.label}
              </span>
              <div className="text-[#6B706E] flex-none">{st.icon}</div>
            </div>
            <div
              className={`font-serif-editorial text-2xl sm:text-[26px] font-bold leading-none ${st.color}`}
            >
              {st.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="flex items-center gap-2 bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] px-3 flex-1 min-w-[220px]">
          <SearchIcon className="w-3.5 h-3.5 text-[#8E8A82]" />
          <input
            type="text"
            placeholder="Search prospective students by name, email, or country…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 text-xs sm:text-sm bg-transparent outline-none text-[#161918] placeholder-[#8E8A82]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] px-2.5 py-2 text-xs font-mono text-[#161918] outline-none cursor-pointer"
        >
          <option value="all">All review statuses</option>
          <option value="pending">Pending review</option>
          <option value="in_progress">In communication</option>
          <option value="accepted">Enrolled into studio</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Enquiries Table */}
      <div className="border border-[#E4E1DB] rounded-[6px] bg-[#FCFAF7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="bg-[#F4F2EB] text-[#6B706E] font-mono text-[10px] uppercase tracking-wider border-b border-[#E4E1DB]">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Cohort Preference</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Review State</th>
                <th className="py-3 px-4">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1DB]/70 text-xs">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B706E] font-mono text-xs">
                    No applicant inquiries match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((q) => {
                  const typeLabel =
                    q.classTypeInterest === "group"
                      ? "Group Cohort"
                      : q.classTypeInterest === "private"
                      ? "Private 1-on-1"
                      : "Open / Either";

                  return (
                    <tr
                      key={q.id}
                      onClick={() => onViewEnquiry(q)}
                      className="hover:bg-[#F4F2EB]/60 transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-[#161918]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-[4px] bg-[#161918] text-[#F8F7F4] font-mono text-[10px] flex items-center justify-center font-bold flex-none">
                            {getInitials(q.name)}
                          </div>
                          <span>{q.name}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[10.5px] border border-[#DCD8D0] bg-[#F4F2EB] text-[#444846]">
                          {typeLabel}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-[#161918]">
                          {q.phone}
                        </div>
                        <div className="text-[11px] text-[#6B706E]">
                          {q.email}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 text-[#6B706E]">
                        {q.country}
                      </td>

                      {/* Submitted */}
                      <td className="py-3 px-4 font-mono text-xs text-[#444846]">
                        {formatDateHuman(parseDateOnly(q.submittedDate))}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[10.5px] font-medium ${statusTags[q.status]}`}
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
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-[#1D7344] font-medium">
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Enrolled Student</span>
                          </span>
                        ) : q.status === "declined" ? (
                          <button
                            type="button"
                            onClick={() => onUpdateEnquiryStatus(q.id, "pending")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] text-xs font-mono text-[#161918] transition-colors cursor-pointer"
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
                              className="px-2 py-1 rounded-[4px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] text-xs font-mono text-[#161918] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              Follow up
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateEnquiryStatus(q.id, "declined")}
                              className="px-2 py-1 rounded-[4px] border border-[#F2C5BE] bg-[#FBEAE8] hover:bg-[#B64E30] text-[#B64E30] hover:text-[#F8F7F4] text-xs font-mono transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => onAcceptEnquiry(q)}
                              className="px-2.5 py-1 rounded-[4px] bg-[#161918] hover:bg-[#2A2E2C] text-[#F8F7F4] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Enroll
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
