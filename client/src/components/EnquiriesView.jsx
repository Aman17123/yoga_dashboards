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
  enquiries,
  bookings = [],
  onUpdateEnquiryStatus,
  onAcceptEnquiry,
  onViewEnquiry,
  onUpdateBookingStatus,
}) {
  const [activeTab, setActiveTab] = useState("enquiries");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
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
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
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

  // Reset filters when switching tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("all");
  };

  const pendingEnquiries = enquiryStats.pending + enquiryStats.inProgress;
  const pendingBookings = bookingStats.pending + bookingStats.contacted;

  return (
    <section className="w-full">
      {/* View Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-[18px]">
        <div>
          <div className="eyebrow">Admin Console</div>
          <h1 className="view__title">Enquiries & Bookings</h1>
          <p className="view__note">
            Manage inbound enquiries and online booking form submissions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <TabBtn
            active={activeTab === "enquiries"}
            onClick={() => switchTab("enquiries")}
            badge={pendingEnquiries}
          >
            <ChatIcon className="w-4 h-4" />
            Enquiries
          </TabBtn>
          <TabBtn
            active={activeTab === "bookings"}
            onClick={() => switchTab("bookings")}
            badge={pendingBookings}
          >
            <CalendarIcon className="w-4 h-4" />
            Bookings
          </TabBtn>
        </div>
      </header>

      {/* ══════════ ENQUIRIES TAB ══════════ */}
      {activeTab === "enquiries" && (
        <>
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
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
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
                      <tr key={q.id} onClick={() => onViewEnquiry(q)} className="stable__row">
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
                          <div className="flex gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            {q.status === "accepted" ? (
                              <span className="tag tag--safe"><CheckIcon className="w-3.5 h-3.5" />Enrolled</span>
                            ) : q.status === "declined" ? (
                              <button type="button" onClick={() => onUpdateEnquiryStatus(q.id, "pending")} className="btn btn--sm gap-1">
                                <UndoIcon className="w-3 h-3" /><span>Reopen</span>
                              </button>
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
                <div className="statcard__label">New / Pending</div>
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
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="converted">Enrolled</option>
              <option value="declined">Declined</option>
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
                  <th>Preference</th>
                  <th>Source</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      {bookings.length === 0
                        ? "No booking submissions yet. Share your booking link to get started!"
                        : "No bookings match this search."}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const palette = avatarColor(b._id || b.bookingRef || b.email);
                    const classLabel = CLASS_TYPE_LABEL[b.classType] || "—";
                    const daysLabel = b.preferredDays?.length ? b.preferredDays.join(", ") : "Flexible";
                    return (
                      <tr key={b._id || b.bookingRef} className="stable__row">
                        <td>
                          <div className="stable__student">
                            <span className="avatar avatar--sm" style={{ backgroundColor: palette.bg, color: palette.fg }}>
                              {getInitials(b.name)}
                            </span>
                            <div>
                              <div className="font-semibold text-sm">{b.name}</div>
                              <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
                                <CountryFlag country={b.country} size="xs" />
                                <span>{b.country}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="mono text-xs font-semibold" style={{ color: "var(--dusk)" }}>
                            {b.bookingRef || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs">{b.email}</div>
                          {b.phone && <div className="mono text-xs" style={{ color: "var(--ink-soft)" }}>{b.phone}</div>}
                        </td>
                        <td>
                          <div className="text-xs font-semibold">{classLabel}</div>
                          <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
                            {b.yogaStyle || "Any style"}
                          </div>
                          <div className="text-xs" style={{ color: "var(--ink-faint)" }}>
                            {daysLabel}
                          </div>
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
                          <div className="flex gap-1.5 flex-wrap">
                            {b.status === "pending" && (
                              <>
                                <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "contacted")} className="btn btn--sm">Contact</button>
                                <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "declined")} className="btn btn--sm btn--danger">Decline</button>
                              </>
                            )}
                            {b.status === "contacted" && (
                              <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "confirmed")} className="btn btn--sm btn--primary">Confirm</button>
                            )}
                            {b.status === "confirmed" && (
                              <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "converted")} className="btn btn--sm btn--primary">
                                <CheckIcon className="w-3 h-3" /> Enroll
                              </button>
                            )}
                            {b.status === "converted" && (
                              <span className="tag tag--safe"><CheckIcon className="w-3.5 h-3.5" />Enrolled</span>
                            )}
                            {b.status === "declined" && (
                              <button type="button" onClick={() => onUpdateBookingStatus && onUpdateBookingStatus(b._id, "pending")} className="btn btn--sm gap-1">
                                <UndoIcon className="w-3 h-3" /> Reopen
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

          {/* Booking link hint */}
          <div className="mt-4 p-4 border rounded-[var(--radius-md)] text-sm" style={{ background: "var(--dusk-soft)", borderColor: "var(--border)", color: "var(--dusk)" }}>
            <strong>Booking page URL:</strong>{" "}
            <span className="mono text-xs">{window.location.origin}/book</span>
            {" "} — Share this link or use{" "}
            <span className="mono text-xs">{window.location.origin}/book?source=yogasite1</span>
            {" "}to track which website referred the booking.
          </div>
        </>
      )}
    </section>
  );
}
