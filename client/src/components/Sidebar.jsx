import React from "react";
import { UsersIcon, UserIcon, ChatIcon } from "./Icons";
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
    <aside className="w-full md:w-64 bg-[#FCFAF7] border-b md:border-b-0 md:border-r border-[#E4E1DB] flex flex-col p-4 sm:p-5 md:sticky md:top-0 md:h-screen flex-none z-20">
      {/* Brand Masthead matching Home Page */}
      <div className="flex items-center justify-between pb-4 md:pb-6 border-b border-[#E4E1DB]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[6px] bg-[#161918] flex items-center justify-center text-[#F8F7F4] flex-none">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-base sm:text-lg font-bold tracking-tight text-[#161918] leading-none">
              Devbhoomi Infotech
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#6B706E] mt-0.5">
              Studio &amp; Client Platform
            </span>
          </div>
        </div>

        {/* Mobile Logout shortcut */}
        <button
          type="button"
          onClick={onLogout}
          className="md:hidden text-xs font-mono text-[#6B706E] hover:text-[#161918] border border-[#DCD8D0] rounded-[6px] px-2.5 py-1 bg-[#F8F7F4]"
        >
          Exit
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex md:flex-col gap-1.5 my-3 md:my-5 flex-1 overflow-x-auto">
        {session.role === "admin" ? (
          <>
            <button
              type="button"
              onClick={() => onSwitchAdminTab("students")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeAdminTab === "students"
                  ? "bg-[#161918] text-[#F8F7F4]"
                  : "text-[#444846] hover:bg-[#F2EFE9] hover:text-[#161918]"
              }`}
            >
              <div className="w-4 h-4 flex-none">
                <UsersIcon className="w-full h-full" />
              </div>
              <span>Students &amp; Ledgers</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchAdminTab("enquiries")}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeAdminTab === "enquiries"
                  ? "bg-[#161918] text-[#F8F7F4]"
                  : "text-[#444846] hover:bg-[#F2EFE9] hover:text-[#161918]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 flex-none">
                  <ChatIcon className="w-full h-full" />
                </div>
                <span>Inbound Enquiries</span>
              </div>
              {pendingEnquiryCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded-[4px] border ${
                    activeAdminTab === "enquiries"
                      ? "bg-[#FCFAF7] text-[#161918] border-[#FCFAF7]"
                      : "bg-[#FBEAE8] text-[#B64E30] border-[#F2C5BE]"
                  }`}
                >
                  {pendingEnquiryCount}
                </span>
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium bg-[#161918] text-[#F8F7F4] whitespace-nowrap"
          >
            <div className="w-4 h-4 flex-none">
              <UserIcon className="w-full h-full" />
            </div>
            <span>My Practice Portal</span>
          </button>
        )}
      </nav>

      {/* Account & Clock Section */}
      <div className="pt-3 md:pt-4 border-t border-[#E4E1DB] flex flex-row md:flex-col items-center md:items-stretch justify-between gap-3">
        <div className="border border-[#DCD8D0] bg-[#F4F2EB] rounded-[6px] p-2.5 w-full hidden md:block">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E]">
              Active User
            </span>
            <span className="font-mono text-[10px] text-[#1D7344] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7344]" />
              Online
            </span>
          </div>
          <div className="font-medium text-xs text-[#161918] truncate">
            {session.role === "admin" ? "Studio Instructor" : student?.name || "Student"}
          </div>
          <div className="font-mono text-[10.5px] text-[#6B706E]">
            {session.role === "admin" ? "Full administrative rights" : student?.country || "Registered Student"}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between border border-[#DCD8D0] bg-[#FCFAF7] px-3 py-2 rounded-[6px]">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B706E]">
            IST Reference
          </span>
          <span className="font-mono text-xs font-bold text-[#161918]">
            {istTimeStr}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="hidden md:flex items-center justify-center py-2 px-3 rounded-[6px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] text-[#161918] text-xs font-medium transition-colors cursor-pointer"
        >
          Sign Out of Portal
        </button>
      </div>
    </aside>
  );
}
