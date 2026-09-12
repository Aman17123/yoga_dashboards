import React, { useState, useMemo } from "react";
import {
  ChatIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
  XIcon,
  SearchIcon,
  UndoIcon,
  CalendarIcon,
  UserIcon,
  TrashIcon,
} from "./Icons";
import {
  formatDateHuman,
  parseDateOnly,
  getInitials,
  avatarColor,
} from "../utils/dateUtils";
import CountryFlag from "./CountryFlag";

// ─── Enquiries constants ──────────────────────────────────────────────────────
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

// ─── Booking status ───────────────────────────────────────────────────────────
const BOOKING_STATUS_LABEL = {
  pending: "Pending",
  contacted: "Contacted",
  confirmed: "Confirmed",
  converted: "Enrolled",
  declined: "Declined",
};

const BOOKING_STATUS_TAG = {
  pending: "pending",
  contacted: "inprogress",
  confirmed: "soon",
  converted: "safe",
  declined: "declined",
};

const CLASS_TYPE_LABEL = {
  private: "Private",
  group: "Group",
  not_sure: "Not sure",
};

function formatBookingDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
        active
          ? "bg-[var(--dusk-soft)] text-[var(--dusk)] border-[var(--dusk-soft)]"
          : "bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--border)] hover:bg-[var(--bg-alt)]"
      }`}
    >
      {children}
      {badge > 0 && (
        <span
          className="px-1.5 py-0.5 text-[10px] mono font-bold rounded-full"
          style={{
            background: active ? "var(--dusk)" : "var(--warning-soft)",
            color: active ? "#fff" : "var(--warning)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EnquiriesView({
  enquiries = [],
  bookings = [],
  onUpdateEnquiryStatus,
  onAcceptEnquiry,
  onViewEnquiry,
  onUpdateBookingStatus,
  onViewBooking,
  onEnrollBooking,
  onRetryEnrollEmail,
  onDeleteEnrolledStudent,
  onDeleteBooking,
  onDeleteEnquiry,
  onRefresh,
  isRefreshing = false,
}) {
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  // ── Enquiry stats ──
  const enquiryStats = useMemo(() => ({
    total: enquiries.length,
    pending: enquiries.filter((q) => q.status === "pending").length,
    inProgress: enquiries.filter((q) => q.status === "in_progress").length,
    accepted: enquiries.filter((q) => q.status === "accepted").length,
    declined: enquiries.filter((q) => q.status === "declined").length,
  }), [enquiries]);

  // ── Booking stats ──
  const bookingStats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    contacted: bookings.filter((b) => b.status === "contacted").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    converted: bookings.filter((b) => b.status === "converted").length,
    declined: bookings.filter((b) => b.status === "declined").length,
  }), [bookings]);

  // ── Filtered enquiries ──
  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = enquiries.filter((e) => {
      if (statusFilter === "active") {
        if (e.status !== "pending" && e.status !== "in_progress") return false;
      } else if (statusFilter !== "all" && e.status !== statusFilter) {
        return false;
      }
      if (q && !(
        e.name.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.country && e.country.toLowerCase().includes(q))
      )) return false;
      return true;
    });
    list.sort((a, b) => {
      const da = a.submittedDate ? parseDateOnly(a.submittedDate) : new Date(0);
      const db = b.submittedDate ? parseDateOnly(b.submittedDate) : new Date(0);
      return db - da;
    });
    return list;
  }, [enquiries, searchQuery, statusFilter]);

  // ── Filtered bookings ──
  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = bookings.filter((b) => {
      if (statusFilter === "active") {
        if (b.status === "converted" || b.status === "declined") return false;
      } else if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }
      if (q && !(
        b.name.toLowerCase().includes(q) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.country && b.country.toLowerCase().includes(q)) ||
        (b.bookingRef && b.bookingRef.toLowerCase().includes(q))
      )) return false;
      return true;
    });
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [bookings, searchQuery, statusFilter]);

  // ── Combined list (All submissions) ──
  const combinedList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const bMapped = bookings.map((b) => ({
      _kind: "booking",
      _id: b._id || b.bookingRef,
      item: b,
      name: b.name,
      email: b.email,
      phone: b.phone,
      country: b.country,
      status: b.status,
      ref: b.bookingRef || "Pending",
      detail: b.groupCohort || b.preferredTime || (b.classType === "private" ? "Private 1-on-1" : "Group"),
      date: new Date(b.createdAt || 0),
    }));

    const eMapped = enquiries.map((e) => ({
      _kind: "enquiry",
      _id: e.id,
      item: e,
      name: e.name,
      email: e.email,
      phone: e.phone,
      country: e.country,
      status: e.status,
      ref: `ENQ-${e.id}`,
      detail: e.classTypeInterest === "group" ? "Group Cohort" : "Private Session",
      date: e.submittedDate ? parseDateOnly(e.submittedDate) : new Date(e.createdAt || 0),
    }));

    let list = [...bMapped, ...eMapped];
    if (statusFilter !== "all") {
      list = list.filter((x) => x.status === statusFilter);
    }
    if (q) {
      list = list.filter((x) =>
        x.name.toLowerCase().includes(q) ||
        (x.email && x.email.toLowerCase().includes(q)) ||
        (x.country && x.country.toLowerCase().includes(q)) ||
        (x.ref && x.ref.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => b.date - a.date);
    return list;
  }, [enquiries, bookings, searchQuery, statusFilter]);

  // Reset filters when switching tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("active");
  };

  const pendingEnquiries = enquiryStats.pending + enquiryStats.inProgress;
  const pendingBookings = bookingStats.pending + bookingStats.contacted;
  const totalPending = pendingBookings + pendingEnquiries;

  return (
    <section className="w-full">
      {/* View Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="eyebrow">Admin Console</div>
          <h1 className="view__title">Enquiries &amp; Bookings</h1>
          <p className="view__note">
            Manage online Book Now form submissions and general student enquiries.
          </p>
        </div>

        {/* Action Controls & Tab switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg-alt)] text-[var(--ink)] transition-colors cursor-pointer"
              title="Synchronize database records"
            >
              <span className={`text-sm ${isRefreshing ? "animate-spin" : ""}`}>⟳</span>
              <span>{isRefreshing ? "Syncing…" : "Refresh"}</span>
            </button>
          )}
          <TabBtn
            active={activeTab === "bookings"}
            onClick={() => switchTab("bookings")}
            badge={pendingBookings}
          >
            <CalendarIcon className="w-4 h-4" />
            Online Bookings ({bookings.length})
          </TabBtn>
          <TabBtn
            active={activeTab === "enquiries"}
            onClick={() => switchTab("enquiries")}
            badge={pendingEnquiries}
          >
            <ChatIcon className="w-4 h-4" />
            General Enquiries ({enquiries.length})
          </TabBtn>
          <TabBtn
            active={activeTab === "all"}
            onClick={() => switchTab("all")}
            badge={totalPending}
          >
            <UsersIcon className="w-4 h-4" />
            All Submissions ({bookings.length + enquiries.length})
          </TabBtn>
        </div>
      </header>

      {/* ══════════ ENQUIRIES TAB ══════════ */}
      {activeTab === "enquiries" && (
        <>
          {/* Pending Bookings Banner in Enquiries Tab */}
          {pendingBookings > 0 && (
            <div className="mb-4 p-3.5 rounded-[var(--radius-md)] border flex items-center justify-between gap-3 flex-wrap bg-[var(--dusk-soft)] border-[var(--border)] text-[var(--dusk)]">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔔</span>
                <span className="text-sm font-medium">
                  <strong>{bookingStats.pending} new online booking submission(s)</strong> received from the Book Now form.
                </span>
              </div>
              <button
                type="button"
                onClick={() => switchTab("bookings")}
                className="btn btn--sm btn--primary cursor-pointer"
              >
                View Online Bookings ({bookings.length}) →
              </button>
            </div>
          )}

          {/* Stat Row */}
          <div className="stat-row">
            <div className="statcard">
              <div className="statcard__icon"><ChatIcon /></div>
              <div>
                <div className="statcard__value">{enquiryStats.total}</div>
                <div className="statcard__label">Total enquiries</div>
              </div>
            </div>
            <div className={`statcard ${enquiryStats.pending > 0 ? "statcard--warn" : ""}`}>
              <div className="statcard__icon"><ClockIcon /></div>
              <div>
                <div className="statcard__value">{enquiryStats.pending}</div>
                <div className="statcard__label">Pending</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><UsersIcon /></div>
              <div>
                <div className="statcard__value">{enquiryStats.inProgress}</div>
                <div className="statcard__label">In progress</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><CheckIcon /></div>
              <div>
                <div className="statcard__value">{enquiryStats.accepted}</div>
                <div className="statcard__label">Accepted</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><XIcon /></div>
              <div>
                <div className="statcard__value">{enquiryStats.declined}</div>
                <div className="statcard__label">Declined</div>
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
                placeholder="Search name, email, country…"
                className="border-none outline-none bg-transparent py-2.5 w-full text-sm"
                style={{ color: "var(--ink)" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 text-sm font-semibold cursor-pointer"
              style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
            >
              <option value="active">Active enquiries (Pending &amp; In progress)</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="accepted">Enrolled students (Accepted)</option>
              <option value="declined">Declined</option>
              <option value="all">All statuses</option>
            </select>
          </div>

          {/* Enquiries Table */}
          <div className="table-wrap">
            <table className="stable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Interested in</th>
                  <th>Contact</th>
                  <th>Country</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.length === 0 ? (
                  <tr><td colSpan={7} className="empty-row">No enquiries match this search.</td></tr>
                ) : (
                  filteredEnquiries.map((q) => {
                    const palette = avatarColor(q.id);
                    const typeLabel = q.classTypeInterest === "group" ? "Group" : q.classTypeInterest === "private" ? "Private" : "Any";
                    return (
                      <tr key={q.id} onClick={() => onViewEnquiry(q)} className="stable__row cursor-pointer hover:bg-[var(--bg-alt)]">
                        <td>
                          <div className="stable__student">
                            <span className="avatar avatar--sm" style={{ backgroundColor: palette.bg, color: palette.fg }}>{getInitials(q.name)}</span>
                            <span>{q.name}</span>
                          </div>
                        </td>
                        <td><span className="tag tag--muted">{typeLabel}</span></td>
                        <td>
                          <div className="mono text-xs">{q.phone}</div>
                          <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{q.email}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <CountryFlag country={q.country} size="xs" />
                            <span>{q.country}</span>
                          </div>
                        </td>
                        <td className="mono">{q.submittedDate ? formatDateHuman(parseDateOnly(q.submittedDate)) : "—"}</td>
                        <td><span className={`tag tag--${ENQUIRY_STATUS_TAG[q.status]}`}>{ENQUIRY_STATUS_LABEL[q.status]}</span></td>
                        <td>
                          <div className="flex gap-1.5 items-center flex-wrap" onClick={(e) => e.stopPropagation()}>
                            {q.status === "accepted" ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="tag tag--safe"><CheckIcon className="w-3.5 h-3.5" />Enrolled</span>
                                {onDeleteEnrolledStudent && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteEnrolledStudent(q, "enquiry")}
                                    className="btn btn--sm btn--danger text-xs py-0.5 px-2 flex items-center gap-1"
                                    title="Delete enrolled student and revoke credentials"
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                    <span>Delete Student</span>
                                  </button>
                                )}
                              </div>
                            ) : q.status === "declined" ? (
                              <div className="flex items-center gap-1.5">
                                <button type="button" onClick={() => onUpdateEnquiryStatus(q.id, "pending")} className="btn btn--sm gap-1">
                                  <UndoIcon className="w-3 h-3" /><span>Reopen</span>
                                </button>
                                {onDeleteEnquiry && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteEnquiry(q)}
                                    className="icon-btn icon-btn--danger"
                                    title="Delete this inquiry record"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <>
                                <button type="button" onClick={() => onUpdateEnquiryStatus(q.id, "in_progress")} disabled={q.status === "in_progress"} className="btn btn--sm">In progress</button>
                                <button type="button" onClick={() => onUpdateEnquiryStatus(q.id, "declined")} className="btn btn--sm btn--danger">Decline</button>
                                <button type="button" onClick={() => onAcceptEnquiry(q)} className="btn btn--sm btn--primary">Accept</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════ BOOKINGS TAB ══════════ */}
      {activeTab === "bookings" && (
        <>
          {/* Stat Row */}
          <div className="stat-row">
            <div className="statcard">
              <div className="statcard__icon"><CalendarIcon /></div>
              <div>
                <div className="statcard__value">{bookingStats.total}</div>
                <div className="statcard__label">Total bookings</div>
              </div>
            </div>
            <div className={`statcard ${bookingStats.pending > 0 ? "statcard--warn" : ""}`}>
              <div className="statcard__icon"><ClockIcon /></div>
              <div>
                <div className="statcard__value">{bookingStats.pending}</div>
                <div className="statcard__label">Pending review</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><ChatIcon /></div>
              <div>
                <div className="statcard__value">{bookingStats.contacted}</div>
                <div className="statcard__label">Contacted</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><CheckIcon /></div>
              <div>
                <div className="statcard__value">{bookingStats.confirmed}</div>
                <div className="statcard__label">Confirmed</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><UserIcon /></div>
              <div>
                <div className="statcard__value">{bookingStats.converted}</div>
                <div className="statcard__label">Enrolled</div>
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
                placeholder="Search name, email, country, ref…"
                className="border-none outline-none bg-transparent py-2.5 w-full text-sm"
                style={{ color: "var(--ink)" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 text-sm font-semibold cursor-pointer"
              style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
            >
              <option value="active">Active bookings (Pending, Contacted, Confirmed)</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="converted">Enrolled students (Converted)</option>
              <option value="declined">Declined</option>
              <option value="all">All bookings</option>
            </select>
          </div>

          {/* Bookings Table */}
          <div className="table-wrap">
            <table className="stable">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Ref</th>
                  <th>Contact</th>
                  <th>Class / Cohort</th>
                  <th>Source</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      {bookings.length === 0
                        ? "No booking submissions yet. Submissions from /book will appear here in real time."
                        : "No bookings match this search."}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const palette = avatarColor(b._id || b.bookingRef || b.email);
                    const classLabel = CLASS_TYPE_LABEL[b.classType] || "Class";
                    const cohortLabel = b.groupCohort || b.preferredTime || "Flexible";
                    return (
                      <tr
                        key={b._id || b.bookingRef}
                        onClick={() => onViewBooking && onViewBooking(b)}
                        className="stable__row cursor-pointer hover:bg-[var(--bg-alt)] transition-colors"
                        title="Click to view full booking details"
                      >
                        <td>
                          <div className="stable__student">
                            <span className="avatar avatar--sm" style={{ backgroundColor: palette.bg, color: palette.fg }}>
                              {getInitials(b.name)}
                            </span>
                            <div>
                              <div className="font-semibold text-sm">{b.name}</div>
                              <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
                                <CountryFlag country={b.country} size="xs" />
                                <span>{b.country || "—"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--dusk-soft)] text-[var(--dusk)]">
                            {b.bookingRef || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs font-medium">{b.email}</div>
                          {b.phone && <div className="mono text-xs" style={{ color: "var(--ink-soft)" }}>{b.phone}</div>}
                        </td>
                        <td>
                          <div className="text-xs font-semibold">{classLabel}</div>
                          <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
                            {cohortLabel}
                          </div>
                          {b.fee ? (
                            <div className="text-[11px] font-mono font-medium" style={{ color: "var(--dusk)" }}>
                              ₹{Number(b.fee).toLocaleString("en-IN")}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <span className="tag tag--muted text-xs">{b.source || "direct"}</span>
                        </td>
                        <td className="mono text-xs">{formatBookingDate(b.createdAt)}</td>
                        <td>
                          <span className={`tag tag--${BOOKING_STATUS_TAG[b.status] || "pending"}`}>
                            {BOOKING_STATUS_LABEL[b.status] || b.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onViewBooking && onViewBooking(b)}
                              className="btn btn--sm"
                              title="View details"
                            >
                              View
                            </button>
                            {b.status === "pending" && (
                              <>
                                <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "contacted")} className="btn btn--sm">Contact</button>
                                <button
                                  type="button"
                                  onClick={() => onEnrollBooking && onEnrollBooking(b)}
                                  className="btn btn--sm btn--primary flex items-center gap-1"
                                >
                                  <CheckIcon className="w-3 h-3" /> Enroll
                                </button>
                                <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "declined")} className="btn btn--sm btn--danger">Decline</button>
                              </>
                            )}
                            {b.status === "contacted" && (
                              <>
                                <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "confirmed")} className="btn btn--sm">Confirm</button>
                                <button
                                  type="button"
                                  onClick={() => onEnrollBooking && onEnrollBooking(b)}
                                  className="btn btn--sm btn--primary flex items-center gap-1"
                                >
                                  <CheckIcon className="w-3 h-3" /> Enroll
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => onEnrollBooking && onEnrollBooking(b)}
                                className="btn btn--sm btn--primary flex items-center gap-1"
                              >
                                <CheckIcon className="w-3 h-3" /> Enroll
                              </button>
                            )}
                            {b.status === "converted" && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="tag tag--safe flex items-center gap-1">
                                  <CheckIcon className="w-3.5 h-3.5" /> Enrolled
                                </span>
                                {b.enrollmentEmailStatus === "sent" && (
                                  <span className="text-[11px] font-semibold text-[var(--success)]" title="Login credentials successfully sent to student's email">
                                    ✉️ Emailed
                                  </span>
                                )}
                                {b.enrollmentEmailStatus === "failed" && (
                                  <button
                                    type="button"
                                    onClick={() => onRetryEnrollEmail && onRetryEnrollEmail(b)}
                                    className="btn btn--sm text-xs text-[var(--danger)] border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] py-0.5 px-1.5"
                                    title={b.enrollmentEmailError || "Email failed - click to retry sending credentials"}
                                  >
                                    Retry Email
                                  </button>
                                )}
                                {onDeleteEnrolledStudent && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteEnrolledStudent(b, "booking")}
                                    className="btn btn--sm btn--danger text-xs py-0.5 px-2 flex items-center gap-1"
                                    title="Delete enrolled student profile, username and password"
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                    <span>Delete Student</span>
                                  </button>
                                )}
                              </div>
                            )}
                            {b.status === "declined" && (
                              <div className="flex items-center gap-1.5">
                                <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "pending")} className="btn btn--sm gap-1">
                                  <UndoIcon className="w-3 h-3" /> Reopen
                                </button>
                                {onDeleteBooking && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteBooking(b)}
                                    className="icon-btn icon-btn--danger"
                                    title="Delete this booking record"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Booking link hint */}
          <div className="mt-4 p-4 border rounded-[var(--radius-md)] text-sm" style={{ background: "var(--dusk-soft)", borderColor: "var(--border)", color: "var(--dusk)" }}>
            <strong>Public Book Now page URL:</strong>{" "}
            <span className="mono text-xs font-semibold">{window.location.origin}/book</span>
            {" "} — Share this link with prospective students or append{" "}
            <span className="mono text-xs font-semibold">?source=yogasite1</span>
            {" "}to track referrals.
          </div>
        </>
      )}

      {/* ══════════ ALL SUBMISSIONS TAB ══════════ */}
      {activeTab === "all" && (
        <>
          {/* Stat Row */}
          <div className="stat-row">
            <div className="statcard">
              <div className="statcard__icon"><UsersIcon /></div>
              <div>
                <div className="statcard__value">{bookings.length + enquiries.length}</div>
                <div className="statcard__label">Total submissions</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><CalendarIcon /></div>
              <div>
                <div className="statcard__value">{bookings.length}</div>
                <div className="statcard__label">Online bookings</div>
              </div>
            </div>
            <div className="statcard">
              <div className="statcard__icon"><ChatIcon /></div>
              <div>
                <div className="statcard__value">{enquiries.length}</div>
                <div className="statcard__label">General enquiries</div>
              </div>
            </div>
            <div className={`statcard ${totalPending > 0 ? "statcard--warn" : ""}`}>
              <div className="statcard__icon"><ClockIcon /></div>
              <div>
                <div className="statcard__value">{totalPending}</div>
                <div className="statcard__label">Pending review</div>
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
                placeholder="Search across all submissions…"
                className="border-none outline-none bg-transparent py-2.5 w-full text-sm"
                style={{ color: "var(--ink)" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 text-sm font-semibold cursor-pointer"
              style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted / In Progress</option>
              <option value="confirmed">Confirmed / Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {/* Combined Table */}
          <div className="table-wrap">
            <table className="stable">
              <thead>
                <tr>
                  <th>Origin</th>
                  <th>Applicant</th>
                  <th>Ref</th>
                  <th>Contact</th>
                  <th>Class / Request</th>
                  <th>Country</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {combinedList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-row">
                      No submissions found matching this filter.
                    </td>
                  </tr>
                ) : (
                  combinedList.map((row) => {
                    const isB = row._kind === "booking";
                    const palette = avatarColor(row._id || row.ref || row.email);
                    return (
                      <tr
                        key={`${row._kind}-${row._id}`}
                        onClick={() => {
                          if (isB && onViewBooking) onViewBooking(row.item);
                          else if (!isB && onViewEnquiry) onViewEnquiry(row.item);
                        }}
                        className="stable__row cursor-pointer hover:bg-[var(--bg-alt)] transition-colors"
                        title="Click to view details"
                      >
                        <td>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            isB
                              ? "bg-[var(--dusk-soft)] text-[var(--dusk)]"
                              : "bg-[var(--bg-alt)] text-[var(--ink-soft)] border border-[var(--border)]"
                          }`}>
                            {isB ? "Book Now Form" : "Enquiry Form"}
                          </span>
                        </td>
                        <td>
                          <div className="stable__student">
                            <span className="avatar avatar--sm" style={{ backgroundColor: palette.bg, color: palette.fg }}>
                              {getInitials(row.name)}
                            </span>
                            <span className="font-semibold text-sm">{row.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="mono text-xs font-semibold" style={{ color: isB ? "var(--dusk)" : "var(--ink-soft)" }}>
                            {row.ref}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs">{row.email}</div>
                          {row.phone && <div className="mono text-xs" style={{ color: "var(--ink-soft)" }}>{row.phone}</div>}
                        </td>
                        <td>
                          <div className="text-xs font-semibold">{row.detail}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs">
                            <CountryFlag country={row.country} size="xs" />
                            <span>{row.country || "—"}</span>
                          </div>
                        </td>
                        <td className="mono text-xs">{formatBookingDate(row.date)}</td>
                        <td>
                          <span className={`tag tag--${BOOKING_STATUS_TAG[row.status] || ENQUIRY_STATUS_TAG[row.status] || "pending"}`}>
                            {BOOKING_STATUS_LABEL[row.status] || ENQUIRY_STATUS_LABEL[row.status] || row.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                if (isB && onViewBooking) onViewBooking(row.item);
                                else if (!isB && onViewEnquiry) onViewEnquiry(row.item);
                              }}
                              className="btn btn--sm"
                            >
                              View
                            </button>
                            {isB && row.status !== "converted" && (
                              <button
                                type="button"
                                onClick={() => onEnrollBooking && onEnrollBooking(row.item)}
                                className="btn btn--sm btn--primary"
                              >
                                Enroll
                              </button>
                            )}
                            {!isB && row.status !== "accepted" && (
                              <button
                                type="button"
                                onClick={() => onAcceptEnquiry && onAcceptEnquiry(row.item)}
                                className="btn btn--sm btn--primary flex items-center gap-1"
                              >
                                <CheckIcon className="w-3 h-3" /> Enroll
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
