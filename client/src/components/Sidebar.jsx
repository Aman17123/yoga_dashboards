import React, { useState } from "react";
import { SunIcon, UsersIcon, UserIcon, ChatIcon } from "./Icons";
import { getWallTime } from "../utils/dateUtils";

export default function Sidebar({
  session,
  activeAdminTab,
  onSwitchAdminTab,
  onLogout,
  onVisitWebsite,
  currentTime,
  student,
  pendingEnquiryCount = 0,
  isRealtimeConnected = true,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const istWall = getWallTime("Asia/Kolkata", currentTime);
  const istTimeStr = `${String(istWall.h).padStart(2, "0")}:${String(
    istWall.m
  ).padStart(2, "0")}:${String(istWall.s).padStart(2, "0")}`;

  const handleTabClick = (tab) => {
    onSwitchAdminTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <aside
      className="w-full md:w-[230px] flex-none border-b md:border-b-0 md:border-r flex flex-col justify-between p-3.5 sm:p-4 md:p-[20px_16px] md:sticky md:top-0 md:h-screen z-30 transition-all"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Top Row: Brand, Live Badge & Mobile Hamburger */}
      <div className="flex items-center justify-between w-full md:mb-6">
        <div className="flex items-center gap-2">
          <span className="w-[28px] h-[28px] flex-none" style={{ color: "var(--dawn)" }}>
            <SunIcon className="w-full h-full" />
          </span>
          <span
            className="font-bold text-[18px] tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            yogaonlive
          </span>
        </div>

        {/* Live indicator & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isRealtimeConnected
                ? "bg-[#EBF7EE] text-[#1E7E34] border-[#C3E6CB]"
                : "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-soft)]"
            }`}
            title={isRealtimeConnected ? "Real-time updates active" : "Connecting to real-time service…"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRealtimeConnected ? "bg-[#28A745] animate-pulse" : "bg-[#FFC107]"
              }`}
            />
            <span className="tracking-wider uppercase">{isRealtimeConnected ? "Live" : "Syncing"}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-[var(--radius-sm)] border text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            aria-label="Toggle navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation (Always visible on desktop; collapsible on mobile) */}
      <nav
        className={`${
          mobileMenuOpen ? "flex" : "hidden md:flex"
        } flex-col gap-1.5 w-full mt-3 md:mt-0 transition-all`}
      >
        {session.role === "admin" ? (
          <>
            <button
              type="button"
              onClick={() => handleTabClick("students")}
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
              onClick={() => handleTabClick("enquiries")}
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
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2.5 w-full p-[10px_12px] text-left text-sm font-semibold rounded-[var(--radius-sm)] bg-[var(--dusk-soft)] text-[var(--dusk)]">
              <span className="w-[18px] h-[18px] flex-none">
                <UserIcon className="w-full h-full" />
              </span>
              <span>My Practice Desk</span>
            </div>

            {onVisitWebsite && (
              <button
                type="button"
                onClick={onVisitWebsite}
                className="flex items-center gap-2.5 w-full p-[10px_12px] text-left text-sm font-semibold rounded-[var(--radius-sm)] text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)] cursor-pointer transition-colors border border-transparent hover:border-[var(--border)]"
                title="Return to the live studio home page"
              >
                <span className="text-base">🏠</span>
                <span>Live Home Page</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Footer / User info & Clock (Visible on desktop; expandable on mobile) */}
      <div
        className={`${
          mobileMenuOpen ? "flex" : "hidden md:flex"
        } flex-col items-stretch pt-4 mt-3 md:mt-auto border-t w-full`}
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mb-2.5 text-left">
          <div className="font-bold text-sm text-[var(--ink)]">
            {session.role === "admin" ? "Admin" : student?.name || "Student"}
          </div>
          <div className="text-[11px] text-[var(--ink-faint)]">
            {session.role === "admin" ? "Full access" : "Student account"}
          </div>
        </div>

        <div className="mb-3">
          <div
            className="text-[10.5px] uppercase tracking-wider mb-0.5"
            style={{ color: "var(--ink-faint)" }}
          >
            Studio Time · IST
          </div>
          <div className="mono text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
            {istTimeStr}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="btn text-[12px] p-2 w-full justify-center"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

