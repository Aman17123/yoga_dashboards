import React, { useState, useMemo } from "react";
import {
  SearchIcon,
  TeacherIcon,
  EditIcon,
  WhatsAppIcon,
  LinkIcon,
  ExternalLinkIcon,
  UserIcon,
} from "./Icons";
import { getInitials, avatarColor, toWhatsAppDigits } from "../utils/dateUtils";

export default function InstructorsView({
  instructors = [],
  classes = [],
  onAddInstructor,
  onEditInstructor,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time client-side filter by instructor name
  const filteredInstructors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((inst) =>
      (inst.name || "").toLowerCase().includes(q)
    );
  }, [instructors, searchQuery]);

  // Construct WhatsApp URL: prepends 91 for standard 10-digit Indian numbers, or retains country code if present
  const getWhatsAppUrl = (phone) => {
    if (!phone) return "";
    const digits = toWhatsAppDigits(phone);
    if (!digits) return "";
    const cleanDigits = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${cleanDigits}`;
  };

  return (
    <section className="w-full">
      {/* Top Bar */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <TeacherIcon className="w-3.5 h-3.5 text-[var(--dawn)]" />
            <span>Faculty &amp; Teaching Staff</span>
          </div>
          <h1 className="view__title">Instructors</h1>
          <p className="view__note">
            Manage teacher profiles, virtual classroom coordinates, and direct messaging channels.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddInstructor}
          id="add-instructor-btn"
          className="btn btn--primary flex items-center gap-2 shadow-sm"
        >
          <span className="text-base leading-none font-normal">+</span>
          <span>Add Instructor</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="flex gap-2.5 mb-5 flex-wrap items-center">
        <div
          className="search flex items-center gap-2 bg-[var(--surface)] border rounded-[var(--radius-sm)] px-3 flex-1 min-w-[240px] max-w-lg transition-all focus-within:border-[var(--dusk)]"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <span className="w-4 h-4 flex-none" style={{ color: "var(--ink-faint)" }}>
            <SearchIcon className="w-full h-full" />
          </span>
          <input
            type="text"
            id="instructor-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instructors by name…"
            className="border-none outline-none bg-transparent py-2.5 w-full text-sm font-medium"
            style={{ color: "var(--ink)" }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold px-1.5 py-0.5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)]"
              title="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs font-medium text-[var(--ink-soft)] px-1">
          Showing <span className="font-bold text-[var(--ink)]">{filteredInstructors.length}</span> of {instructors.length} {instructors.length === 1 ? "instructor" : "instructors"}
        </div>
      </div>

      {/* Instructor List / Grid */}
      {filteredInstructors.length === 0 ? (
        <div
          className="card text-center py-12 px-4 flex flex-col items-center justify-center"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-alt)] text-[var(--ink-faint)] mb-3">
            <TeacherIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[var(--ink)] mb-1">
            {searchQuery ? `No instructors found matching "${searchQuery}"` : "No instructors registered yet"}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] max-w-sm mb-4">
            {searchQuery
              ? "Check your spelling or clear your search term to see all faculty members."
              : "Get started by adding your studio's first yoga teacher or coach."}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn btn--sm"
            >
              Reset search filter
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddInstructor}
              className="btn btn--primary btn--sm"
            >
              + Add Instructor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
          {filteredInstructors.map((inst) => {
            const palette = avatarColor(inst.id || inst.name);
            const waUrl = getWhatsAppUrl(inst.phone);

            return (
              <div
                key={inst.id || inst.name}
                className="card flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                style={{
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {/* Card Top: Avatar, Name, Badges */}
                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Thumbnail / Avatar */}
                    {inst.profileImage ? (
                      <img
                        src={inst.profileImage}
                        alt={inst.name}
                        className="w-[52px] h-[52px] rounded-full object-cover flex-none border shadow-xs"
                        style={{ borderColor: "var(--border)" }}
                      />
                    ) : (
                      <div
                        className="avatar flex-none text-base font-bold shadow-xs"
                        style={{
                          width: "52px",
                          height: "52px",
                          background: palette.bg,
                          color: palette.fg,
                        }}
                      >
                        {getInitials(inst.name) || <UserIcon className="w-6 h-6" />}
                      </div>
                    )}

                    {/* Name & Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h2
                          className="font-bold text-base text-[var(--ink)] truncate"
                          title={inst.name}
                        >
                          {inst.name}
                        </h2>
                      </div>

                      {inst.username && (
                        <div className="font-mono text-[11px] text-[var(--ink-faint)] leading-tight -mt-0.5 mb-1">
                          @{inst.username}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {inst.gender && (
                          <span
                            className="tag text-[11px] py-0.5 px-2 font-semibold"
                            style={{
                              background: "var(--bg-alt)",
                              color: "var(--ink-soft)",
                            }}
                          >
                            {inst.gender}
                          </span>
                        )}

                        <span
                          className={`tag text-[11px] py-0.5 px-2.5 font-bold uppercase tracking-wider ${
                            (inst.medium || inst.language || "Hindi").toLowerCase().includes("english")
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-orange-100 text-orange-800 border border-orange-200"
                          }`}
                        >
                          Medium: {(inst.medium || inst.language || "Hindi").toLowerCase().includes("english") ? "English" : "Hindi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Schedule */}
                  <div className="text-xs bg-[var(--bg)] p-2.5 rounded-[var(--radius-sm)] border mb-2" style={{ borderColor: "var(--border)" }}>
                    <div className="font-semibold text-[var(--ink-soft)] mb-0.5 flex items-center gap-1.5">
                      <span>⏰ Availability Schedule:</span>
                    </div>
                    <div className="text-[var(--ink)] font-medium">
                      {inst.availabilitySchedule || (Array.isArray(inst.availableSlots) && inst.availableSlots.length > 0 ? inst.availableSlots.slice(0, 3).join(", ") + (inst.availableSlots.length > 3 ? ` (+${inst.availableSlots.length - 3} more)` : "") : "Morning & Evening Batches")}
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="text-xs bg-[var(--bg)] p-2.5 rounded-[var(--radius-sm)] border mb-2.5" style={{ borderColor: "var(--border)" }}>
                    <div className="font-semibold text-[var(--ink-soft)] mb-0.5 flex items-center gap-1.5">
                      <span>🧘 Assigned Classes:</span>
                    </div>
                    <div className="text-[var(--ink)] font-medium">
                      {Array.isArray(inst.assignedClasses) && inst.assignedClasses.length > 0
                        ? inst.assignedClasses.join(" • ")
                        : (classes?.filter(c => c.instructor === inst.name).map(c => c.title).join(" • ") || "Daily Live Interactive Practice")}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1.5 text-xs text-[var(--ink-soft)] bg-[var(--bg)] p-3 rounded-[var(--radius-sm)] border mb-3" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-[var(--ink-faint)] w-12 flex-none">Phone</span>
                      <span className="font-mono text-[var(--ink)] truncate select-all">
                        {inst.phone ? (inst.phone.startsWith("+") ? inst.phone : `+91 ${inst.phone}`) : "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-[var(--ink-faint)] w-12 flex-none">Email</span>
                      <span className="text-[var(--ink)] truncate select-all" title={inst.email}>
                        {inst.email || "—"}
                      </span>
                    </div>

                    {inst.zoomLink && (
                      <div className="flex items-center gap-2 truncate pt-0.5">
                        <span className="font-semibold text-[var(--ink-faint)] w-12 flex-none">Zoom</span>
                        <a
                          href={inst.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px] truncate"
                          title={inst.zoomLink}
                        >
                          <LinkIcon className="w-3 h-3 flex-none" />
                          <span className="truncate">{inst.zoomLink.replace(/^https?:\/\//i, "")}</span>
                          <ExternalLinkIcon className="w-2.5 h-2.5 flex-none opacity-70" />
                        </a>
                      </div>
                    )}

                    {inst.meetLink && (
                      <div className="flex items-center gap-2 truncate pt-0.5">
                        <span className="font-semibold text-[var(--ink-faint)] w-12 flex-none">Meet</span>
                        <a
                          href={inst.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-mono text-[11px] truncate"
                          title={inst.meetLink}
                        >
                          <LinkIcon className="w-3 h-3 flex-none" />
                          <span className="truncate">{inst.meetLink.replace(/^https?:\/\//i, "")}</span>
                          <ExternalLinkIcon className="w-2.5 h-2.5 flex-none opacity-70" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {inst.bio && (
                    <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed mb-3">
                      {inst.bio}
                    </p>
                  )}
                </div>

                {/* Action Buttons Bottom Bar */}
                <div
                  className="flex items-center justify-between gap-2 pt-3 border-t mt-auto"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* WhatsApp Direct Action Button */}
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn icon-btn--wa text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] inline-flex items-center gap-1.5"
                      title="Send direct WhatsApp message"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="btn icon-btn--wa text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  {/* Edit Action Button */}
                  <button
                    type="button"
                    onClick={() => onEditInstructor(inst)}
                    className="btn btn--sm flex items-center gap-1.5 text-xs"
                    title={`Edit ${inst.name}`}
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
