import React from "react";
import { SunIcon, UsersIcon, UserIcon, ChatIcon } from "./Icons";
import { getWallTime } from "../utils/dateUtils";

export default function Sidebar({
  session,
  activeAdminTab,
  onSwitchAdminTab,
  onLogout,
  currentTime,
  student,
  pendingEnquiryCount = 0,
}) {
  const istWall = getWallTime("Asia/Kolkata", currentTime);
  const istTimeStr = `${String(istWall.h).padStart(2, "0")}:${String(
    istWall.m
  ).padStart(2, "0")}:${String(istWall.s).padStart(2, "0")}`;

  return (
    <aside
      className="w-full md:w-[220px] flex-none border-b md:border-b-0 md:border-r flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start p-3 sm:p-4 md:p-[22px_16px] md:sticky md:top-0 md:h-screen z-20 flex-wrap no-scrollbar overflow-y-auto"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 md:p-[4px_6px_26px] mr-4 md:mr-0">
        <span className="w-[30px] h-[30px] flex-none" style={{ color: "var(--dawn)" }}>
          <SunIcon className="w-full h-full" />
        </span>
        <span
          className="font-bold text-[19px] tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          yogaonlive
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex md:flex-col gap-1.5 order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0">
        {session.role === "admin" ? (
          <>
            <button
              type="button"
              onClick={() => onSwitchAdminTab("students")}
              className={`flex items-center gap-2.5 w-full p-[10px_12px] text-left text-sm font-semibold rounded-[var(--radius-sm)] border border-transparent transition-colors cursor-pointer ${
                activeAdminTab === "students"
                  ? "bg-[var(--dusk-soft)] text-[var(--dusk)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)]"
              }`}
            >
              <span className="w-[18px] h-[18px] flex-none">
                <UsersIcon className="w-full h-full" />
              </span>
              <span>Admin Console</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchAdminTab("enquiries")}
              className={`flex items-center justify-between gap-2.5 w-full p-[10px_12px] text-left text-sm font-semibold rounded-[var(--radius-sm)] border border-transparent transition-colors cursor-pointer ${
                activeAdminTab === "enquiries"
                  ? "bg-[var(--dusk-soft)] text-[var(--dusk)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-[18px] h-[18px] flex-none">
                  <ChatIcon className="w-full h-full" />
                </span>
                <span>Enquiries &amp; Bookings</span>
              </div>
              {pendingEnquiryCount > 0 && (
                <span
                  className="px-1.5 py-0.5 text-[10px] mono font-bold rounded-full"
                  style={{
                    background: "var(--warning-soft)",
                    color: "var(--warning)",
                  }}
                >
                  {pendingEnquiryCount}
                </span>
              )}
            </button>
          </>
        ) : (
          <div
            className="flex items-center gap-2.5 w-full p-[10px_12px] text-left text-sm font-semibold rounded-[var(--radius-sm)] bg-[var(--dusk-soft)] text-[var(--dusk)]"
          >
            <span className="w-[18px] h-[18px] flex-none">
              <UserIcon className="w-full h-full" />
            </span>
            <span>My Dashboard</span>
          </div>
        )}
      </nav>

      {/* Footer / User info & Clock */}
      <div className="order-2 md:order-3 md:mt-auto flex items-center md:flex-col md:items-stretch gap-3 md:gap-0 md:pt-5 md:border-t" style={{ borderColor: "var(--border)" }}>
        <div className="md:mb-3 text-right md:text-left">
          <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>
            {session.role === "admin" ? "Admin" : student?.name || "Student"}
          </div>
          <div className="text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
            {session.role === "admin" ? "Full access" : "Student"}
          </div>
        </div>

        <div className="hidden md:block mb-1">
          <div
            className="text-[11.5px] uppercase tracking-wider mb-1"
            style={{ color: "var(--ink-faint)" }}
          >
            Business time · IST
          </div>
          <div className="mono text-[20px] font-semibold" style={{ color: "var(--ink)" }}>
            {istTimeStr}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="btn text-[12.5px] p-2 md:w-full md:mt-3.5 justify-center"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
