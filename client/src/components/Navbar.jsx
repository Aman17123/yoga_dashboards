import React, { useState, useEffect, useRef } from "react";
import { getWallTime, digital12, getInitials, avatarColor } from "../utils/dateUtils";

// Brand Sun Logo
function SunLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="5.5" fill="#F2994A" />
      <circle cx="17" cy="17" r="11" stroke="#F2994A" strokeWidth="1.5" strokeDasharray="3.5 2.8" fill="none" />
      <path
        d="M17 3.5v3M17 27.5v3M3.5 17h3M27.5 17h3M7.2 7.2l2 2M24.8 24.8l2 2M24.8 7.2l-2 2M7.2 24.8l2-2"
        stroke="#F2994A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar({
  session,
  currentStudent,
  onLoginClick,
  onLogout,
  onNavigateDashboard,
  showBookNow = true,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Live IST reference clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istWall = getWallTime("Asia/Kolkata", now);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLoggedIn = Boolean(session);
  const isAdmin = session?.role === "admin";
  const displayName = isAdmin
    ? "Studio Admin"
    : currentStudent?.name || session?.username || "Student";
  const displayUsername = isAdmin
    ? "admin"
    : currentStudent?.username || (session?.username ? `@${session.username}` : "");

  const palette = !isAdmin && currentStudent?.id ? avatarColor(currentStudent.id) : { bg: "#4C5FD5", fg: "#FFFFFF" };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (onNavigateDashboard) {
      onNavigateDashboard();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF7]/95 backdrop-blur-md border-b border-[#E7E4DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3 no-underline group">
          <SunLogo size={36} />
          <div className="flex flex-col">
            <span
              className="text-2xl font-bold tracking-tight text-[#171A32] leading-none group-hover:text-[#4C5FD5] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              yogaonlive
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-[#7B8098] uppercase mt-0.5">
              Live Online Yoga Studio
            </span>
          </div>
        </a>

        {/* Actions: Live IST Clock + (Login OR User Profile) + Book Now CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live IST Clock */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#6B7089] border border-[#DCD8D0] bg-[#FFFFFF] px-3 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#1E9E63] animate-pulse" />
            <span>IST {digital12(istWall.h, istWall.m)}</span>
          </div>

          {/* User Auth State */}
          {!isLoggedIn ? (
            /* Logged Out: Simple "Login" Button */
            <button
              type="button"
              id="navbar-login-btn"
              onClick={onLoginClick}
              className="text-xs font-semibold text-[#171A32] hover:text-[#4C5FD5] border border-[#DCD8D0] hover:border-[#4C5FD5] bg-[#FFFFFF] px-4 py-2 rounded-[8px] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              Login
            </button>
          ) : (
            /* Logged In: Direct Dashboard Access Button + Account Profile Pill */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Direct "My Dashboard" / "Admin Console" Navigation Button */}
              <button
                type="button"
                id="navbar-dashboard-btn"
                onClick={onNavigateDashboard}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[8px] bg-gradient-to-r from-[#4C5FD5] to-[#6B3FA8] hover:from-[#3D4EC4] hover:to-[#5B3195] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#4C5FD5]/20 hover:shadow-lg transition-all cursor-pointer flex-none"
                title={isAdmin ? "Open Admin Console" : "Open My Student Dashboard"}
              >
                <span>{isAdmin ? "⚙️" : "🧘"}</span>
                <span>{isAdmin ? "Admin Console" : "My Dashboard"}</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="hidden sm:inline">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Account Dropdown Pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  id="navbar-user-profile-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#171A32] border border-[#DCD8D0] hover:border-[#4C5FD5] bg-[#FFFFFF] px-2.5 sm:px-3 py-1.5 rounded-[8px] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                  title="View your account"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-none shadow-xs"
                    style={{ backgroundColor: palette.bg, color: palette.fg }}
                  >
                    {isAdmin ? "⚙️" : getInitials(displayName)}
                  </div>
                  <div className="flex flex-col text-left max-w-[100px] sm:max-w-[150px]">
                    <span className="truncate leading-tight font-bold text-[#171A32]">
                      {displayName}
                    </span>
                    {displayUsername && (
                      <span className="text-[10px] text-[#7B8098] font-mono truncate leading-none mt-0.5">
                        {displayUsername}
                      </span>
                    )}
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`text-[#7B8098] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E7E4DC] rounded-[10px] shadow-xl py-2 z-50 text-xs text-[#171A32] animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 border-b border-[#F0ECE1]">
                      <div className="font-bold text-[13px] text-[#171A32] truncate">{displayName}</div>
                      <div className="text-[11px] text-[#7B8098] font-mono mt-0.5">
                        {isAdmin ? "Studio Administrator" : `@${currentStudent?.username || session?.username || "student"}`}
                      </div>
                      {!isAdmin && currentStudent?.email && (
                        <div className="text-[11px] text-[#7B8098] truncate mt-0.5">
                          {currentStudent.email}
                        </div>
                      )}
                    </div>

                    {!isAdmin && currentStudent && (
                      <div className="px-3.5 py-2 border-b border-[#F0ECE1] bg-[#FBFBFE]">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#7B8098]">Class:</span>
                          <span className="font-bold capitalize text-[#171A32]">
                            {currentStudent.classType === "group" ? "Group Cohort" : "Private (1-on-1)"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#7B8098]">Instructor:</span>
                          <span className="font-semibold text-[#4C5FD5]">
                            {currentStudent.instructor || "Assigned Master"}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        setDropdownOpen(false);
                        handleUserClick(e);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#F6F4EE] flex items-center gap-2 cursor-pointer font-bold text-[#4C5FD5]"
                    >
                      <span>🖥️</span>
                      <span>{isAdmin ? "Open Admin Console" : "Open Student Dashboard"}</span>
                    </button>

                    <div className="border-t border-[#F0ECE1] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#FFF1F0] text-[#D93025] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary CTA Button */}
          {showBookNow && !isLoggedIn && (
            <a
              href="/book"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-[8px] bg-[#4C5FD5] hover:bg-[#3B4DBF] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#4C5FD5]/20 hover:shadow-lg hover:shadow-[#4C5FD5]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer no-underline flex-none"
            >
              <span>Book Now</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
