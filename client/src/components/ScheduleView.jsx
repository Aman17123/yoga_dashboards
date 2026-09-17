import React, { useState, useMemo } from "react";
import {
  CalendarIcon,
  ClockIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  LinkIcon,
  ExternalLinkIcon,
  UserIcon,
  TeacherIcon,
  CheckIcon,
  AlertIcon,
} from "./Icons";
import { getInitials, avatarColor } from "../utils/dateUtils";
import { normalizeTimeSlot } from "../constants/initialData";

export default function ScheduleView({
  classes = [],
  instructors = [],
  onAddClass,
  onEditClass,
  onDeleteClass,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "assigned" | "free"
  const [languageFilter, setLanguageFilter] = useState("all"); // "all" | "English" | "Hindi"
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "group" | "private"

  // Compute "Who is Free?" and scheduling metrics
  const metrics = useMemo(() => {
    const total = classes.length;
    const assigned = classes.filter(
      (c) => c.status === "assigned" || Boolean(c.instructorName)
    ).length;
    const freeSlots = total - assigned;

    // Instructors assigned to at least 1 class
    const busyInstructorNames = new Set(
      classes
        .map((c) => (c.instructorName || "").trim().toLowerCase())
        .filter(Boolean)
    );

    // Free instructors: active instructors not assigned to any class
    const freeInstructors = instructors.filter(
      (inst) => !busyInstructorNames.has((inst.name || "").trim().toLowerCase())
    );

    return {
      total,
      assigned,
      freeSlots,
      freeInstructorsCount: freeInstructors.length,
      freeInstructors,
    };
  }, [classes, instructors]);

  // Real-time client-side filter
  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return classes.filter((c) => {
      // Status filter
      const isAssigned = c.status === "assigned" || Boolean(c.instructorName);
      if (statusFilter === "assigned" && !isAssigned) return false;
      if (statusFilter === "free" && isAssigned) return false;

      // Language filter
      if (languageFilter !== "all" && c.language !== languageFilter) {
        return false;
      }

      // Class Type filter
      if (typeFilter !== "all" && c.classType !== typeFilter) {
        return false;
      }

      // Search query (title, instructor, time slot, language)
      if (q) {
        const titleMatch = (c.title || "").toLowerCase().includes(q);
        const instructorMatch = (c.instructorName || "").toLowerCase().includes(q);
        const timeMatch = (normalizeTimeSlot(c.timeSlot) || "").toLowerCase().includes(q);
        const langMatch = (c.language || "").toLowerCase().includes(q);

        if (!titleMatch && !instructorMatch && !timeMatch && !langMatch) {
          return false;
        }
      }

      return true;
    });
  }, [classes, searchQuery, statusFilter, languageFilter, typeFilter]);

  return (
    <section className="w-full">
      {/* Top Bar */}
      <header className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--dawn)]" />
            <span>Studio Timetable &amp; Slots</span>
          </div>
          <h1 className="view__title">Class Schedule</h1>
          <p className="view__note">
            Coordinate teacher assignments, track available free slots, and inspect live classroom coordinates.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClass}
          id="add-class-btn"
          className="btn btn--primary flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span className="text-base leading-none font-normal">+</span>
          <span>Add New Class</span>
        </button>
      </header>

      {/* Metrics & "Who is Free?" Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Total Classes */}
        <div
          className="p-3.5 rounded-[var(--radius-md)] border bg-[var(--surface)] shadow-2xs"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--dusk)]" />
            <span>Total Slots</span>
          </div>
          <div className="text-2xl font-bold text-[var(--ink)] font-mono">
            {metrics.total}
          </div>
        </div>

        {/* Assigned Classes */}
        <div
          className="p-3.5 rounded-[var(--radius-md)] border bg-[var(--surface)] shadow-2xs"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1.5 mb-1">
            <CheckIcon className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>Assigned</span>
          </div>
          <div className="text-2xl font-bold text-[var(--success)] font-mono">
            {metrics.assigned}
          </div>
        </div>

        {/* Free Slots */}
        <div
          className={`p-3.5 rounded-[var(--radius-md)] border bg-[var(--surface)] shadow-2xs ${
            metrics.freeSlots > 0 ? "border-amber-300 dark:border-amber-700/60" : ""
          }`}
          style={{ borderColor: metrics.freeSlots > 0 ? undefined : "var(--border)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1.5 mb-1">
            <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Free Slots</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {metrics.freeSlots}
          </div>
        </div>

        {/* Free Instructors Chip */}
        <div
          className="p-3.5 rounded-[var(--radius-md)] border bg-[var(--surface)] shadow-2xs flex flex-col justify-between"
          style={{ borderColor: "var(--border)" }}
          title={
            metrics.freeInstructors.length > 0
              ? `Unassigned faculty: ${metrics.freeInstructors.map((i) => i.name).join(", ")}`
              : "All active instructors are currently assigned to at least one class."
          }
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)] flex items-center gap-1.5 mb-1">
            <TeacherIcon className="w-3.5 h-3.5 text-[var(--violet)]" />
            <span>Free Instructors</span>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-2xl font-bold text-[var(--violet)] font-mono">
              {metrics.freeInstructorsCount}
            </span>
            <span className="text-[11px] text-[var(--ink-faint)] font-normal">
              of {instructors.length} faculty
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex gap-2.5 mb-5 flex-wrap items-center">
        {/* Real-time Search Input */}
        <div
          className="search flex items-center gap-2 bg-[var(--surface)] border rounded-[var(--radius-sm)] px-3 flex-1 min-w-[220px] transition-all focus-within:border-[var(--dusk)]"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <span className="w-4 h-4 flex-none" style={{ color: "var(--ink-faint)" }}>
            <SearchIcon className="w-full h-full" />
          </span>
          <input
            type="text"
            id="schedule-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by class title, instructor, or time slot…"
            className="border-none outline-none bg-transparent py-2.5 w-full text-sm font-medium"
            style={{ color: "var(--ink)" }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold px-1.5 py-0.5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2 text-xs sm:text-sm font-semibold cursor-pointer outline-none"
          style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
        >
          <option value="all">All Slots ({classes.length})</option>
          <option value="assigned">Assigned Only ({metrics.assigned})</option>
          <option value="free">Free Slots ({metrics.freeSlots})</option>
        </select>

        {/* Medium Filter */}
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2 text-xs sm:text-sm font-semibold cursor-pointer outline-none"
          style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
        >
          <option value="all">All Media</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
        </select>

        {/* Class Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2 text-xs sm:text-sm font-semibold cursor-pointer outline-none"
          style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
        >
          <option value="all">All Types</option>
          <option value="group">Group Classes</option>
          <option value="private">Private 1:1</option>
        </select>

        {/* Counter */}
        <div className="text-xs font-medium text-[var(--ink-soft)] px-1 whitespace-nowrap">
          Showing <span className="font-bold text-[var(--ink)]">{filteredClasses.length}</span> of {classes.length}
        </div>
      </div>

      {/* Schedule Table / Board */}
      <div className="table-wrap">
        <table className="stable">
          <thead>
            <tr>
              <th>Class Title</th>
              <th>Time Slot</th>
              <th>Instructor</th>
              <th>Link Type</th>
              <th>Classroom Link</th>
              <th>Medium</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <CalendarIcon className="w-10 h-10 text-[var(--ink-faint)] mb-2" />
                    <div className="font-bold text-base text-[var(--ink)] mb-1">
                      {searchQuery || statusFilter !== "all" || languageFilter !== "all"
                        ? "No class slots match your active filters"
                        : "No classes scheduled yet"}
                    </div>
                    <div className="text-xs text-[var(--ink-soft)] max-w-sm mb-4">
                      {searchQuery || statusFilter !== "all" || languageFilter !== "all"
                        ? "Try clearing your search query or adjusting your medium/status filters."
                        : "Create your studio's first class timetable entry by assigning an instructor and time."}
                    </div>
                    {searchQuery || statusFilter !== "all" || languageFilter !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setLanguageFilter("all");
                          setTypeFilter("all");
                        }}
                        className="btn btn--sm"
                      >
                        Reset filters
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onAddClass}
                        className="btn btn--primary btn--sm"
                      >
                        + Add New Class
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredClasses.map((item) => {
                const isAssigned = Boolean(item.instructorName);
                const assignedInstructorObj = instructors.find(
                  (i) =>
                    i.id === item.instructorId ||
                    (i.name && item.instructorName && i.name.toLowerCase() === item.instructorName.toLowerCase())
                );
                const palette = avatarColor(item.instructorId || item.instructorName || item.id);

                return (
                  <tr
                    key={item.id}
                    className={`stable__row ${
                      !isAssigned ? "bg-[var(--bg)]/40 hover:bg-[var(--bg)]" : ""
                    }`}
                  >
                    {/* Class Title */}
                    <td>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-[var(--ink)] text-sm leading-snug">
                          {item.title}
                        </span>
                        {item.notes && (
                          <span
                            className="text-[11px] text-[var(--ink-soft)] line-clamp-1 max-w-xs mt-0.5"
                            title={item.notes}
                          >
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Time Slot */}
                    <td>
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border" style={{ borderColor: "var(--border)" }}>
                        <ClockIcon className="w-3 h-3 text-[var(--dusk)]" />
                        <span>{normalizeTimeSlot(item.timeSlot)}</span>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td>
                      {isAssigned ? (
                        <div className="flex items-center gap-2">
                          {assignedInstructorObj?.profileImage ? (
                            <img
                              src={assignedInstructorObj.profileImage}
                              alt={item.instructorName}
                              className="w-6 h-6 rounded-full object-cover border flex-none"
                              style={{ borderColor: "var(--border)" }}
                            />
                          ) : (
                            <span
                              className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center flex-none"
                              style={{ background: palette.bg, color: palette.fg }}
                            >
                              {getInitials(item.instructorName) || <UserIcon className="w-3.5 h-3.5" />}
                            </span>
                          )}
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-xs text-[var(--ink)]">
                              {item.instructorName}
                            </span>
                            {assignedInstructorObj?.language && (
                              <span className="text-[10px] text-[var(--ink-faint)]">
                                {assignedInstructorObj.language}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span
                          className="tag tag--muted text-[11px] font-medium py-0.5 px-2 inline-flex items-center gap-1"
                          title="No instructor assigned yet"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Free Slot (Unassigned)</span>
                        </span>
                      )}
                    </td>

                    {/* Link Type (Group / Private) */}
                    <td>
                      <span
                        className={`tag text-[11px] py-0.5 px-2 font-semibold ${
                          item.classType === "private" ? "tag--private" : "tag--group"
                        }`}
                      >
                        {item.classType === "private" ? "Private 1:1" : "Group Class"}
                      </span>
                    </td>

                    {/* Meeting Link */}
                    <td>
                      {item.meetingLink ? (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[var(--dusk)] hover:underline inline-flex items-center gap-1 font-mono text-xs truncate max-w-[170px]"
                          title={item.meetingLink}
                        >
                          <LinkIcon className="w-3 h-3 flex-none" />
                          <span className="truncate">{item.meetingLink.replace(/^https?:\/\//i, "")}</span>
                          <ExternalLinkIcon className="w-2.5 h-2.5 flex-none opacity-70" />
                        </a>
                      ) : (
                        <span className="text-[var(--ink-faint)] text-xs font-mono">—</span>
                      )}
                    </td>

                    {/* Medium */}
                    <td>
                      {(() => {
                        const med = (item.medium || item.language || "").toLowerCase();
                        const label = med.includes("english") ? "English" : med.includes("hindi") ? "Hindi" : "—";
                        return (
                          <span className={`tag text-[11px] py-0.5 px-2.5 font-bold ${
                            label === "English"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : label === "Hindi"
                              ? "bg-orange-100 text-orange-800 border border-orange-200"
                              : "bg-[var(--bg-alt)] text-[var(--ink-soft)]"
                          }`}>
                            {label}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Status */}
                    <td>
                      {isAssigned ? (
                        <span className="tag tag--safe text-[11px] py-0.5 px-2 font-bold inline-flex items-center gap-1">
                          <CheckIcon className="w-3 h-3" />
                          <span>Assigned</span>
                        </span>
                      ) : (
                        <span className="tag tag--muted text-[11px] py-0.5 px-2 font-semibold inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                          <span>Free Slot</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditClass(item)}
                          className="icon-btn cursor-pointer"
                          title={`Edit ${item.title}`}
                          aria-label={`Edit ${item.title}`}
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete class slot "${item.title}"?`)) {
                              onDeleteClass(item.id);
                            }
                          }}
                          className="icon-btn icon-btn--danger cursor-pointer"
                          title={`Delete ${item.title}`}
                          aria-label={`Delete ${item.title}`}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
