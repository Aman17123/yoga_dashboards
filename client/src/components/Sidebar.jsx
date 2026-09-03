import React from "react";
import { SunIcon, UserIcon, UsersIcon, ChatIcon } from "./Icons";
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
    <aside className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-[#E3E6F2] flex flex-col p-4 md:p-5 md:sticky md:top-0 md:h-screen flex-none z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5 pb-4 md:pb-6 border-b md:border-b-0 border-[#E3E6F2]">
        <div className="w-7 h-7 text-[#F2994A] flex-none">
          <SunIcon className="w-full h-full" />
        </div>
        <span className="font-bold text-xl tracking-tight text-[#171A32]">
          Meridian
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex md:flex-col gap-1.5 my-3 md:my-5 flex-1 overflow-x-auto">
        {session.role === "admin" ? (
          <>
            <button
              type="button"
              onClick={() => onSwitchAdminTab("students")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeAdminTab === "students"
                  ? "bg-[#E6E9FB] text-[#4C5FD5]"
                  : "text-[#6B7089] hover:bg-[#EEF0FA] hover:text-[#171A32]"
              }`}
            >
              <div className="w-4 h-4">
                <UsersIcon className="w-full h-full" />
              </div>
              <span>Admin Console</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchAdminTab("enquiries")}
              className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeAdminTab === "enquiries"
                  ? "bg-[#E6E9FB] text-[#4C5FD5]"
                  : "text-[#6B7089] hover:bg-[#EEF0FA] hover:text-[#171A32]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4">
                  <ChatIcon className="w-full h-full" />
                </div>
                <span>Enquiries</span>
              </div>
              {pendingEnquiryCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10.5px] font-bold rounded-full bg-[#FCE4E1] text-[#E1483C]">
                  {pendingEnquiryCount}
                </span>
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm bg-[#E6E9FB] text-[#4C5FD5]"
          >
            <div className="w-4 h-4">
              <UserIcon className="w-full h-full" />
            </div>
            <span>My Dashboard</span>
          </button>
        )}
      </nav>

      {/* Footer Section */}
      <div className="pt-3 md:pt-4 border-t border-[#E3E6F2] flex flex-row md:flex-col items-center md:items-start justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-[#171A32]">
            {session.role === "admin" ? "Admin" : student?.name || "Student"}
          </div>
          <div className="text-[11.5px] text-[#A3A8C3]">
            {session.role === "admin" ? "Full access" : "Student account"}
          </div>
        </div>

        <div className="hidden md:block w-full my-1">
          <div className="text-[11px] text-[#A3A8C3] font-bold uppercase tracking-wider mb-0.5">
            Business time · IST
          </div>
          <div className="font-mono text-xl font-semibold text-[#171A32]">
            {istTimeStr}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-auto md:w-full py-2 px-3 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-[#171A32] text-xs font-bold transition-all"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
