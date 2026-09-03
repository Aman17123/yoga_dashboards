import React, { useState, useEffect } from "react";
import { getWallTime, digital12 } from "../utils/dateUtils";

export default function HomePage({ onLogin, onQuickLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [legalModalType, setLegalModalType] = useState(null); // "privacy" | "terms" | null

  // Live master clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istWall = getWallTime("Asia/Kolkata", currentTime);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please provide both username and password.");
      return;
    }
    try {
      const success = await onLogin(username.trim(), password);
      if (!success) {
        setError("The username or password provided does not match our records.");
      }
    } catch (err) {
      setError(err?.message || "The username or password provided does not match our records.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#161918] font-sans antialiased selection:bg-[#B64E30]/15 selection:text-[#B64E30] flex flex-col justify-between">
      {/* Top Editorial Masthead */}
      <header className="border-b border-[#E4E1DB] bg-[#F8F7F4]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[6px] bg-[#161918] flex items-center justify-center text-[#F8F7F4]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-base sm:text-lg font-bold tracking-tight text-[#161918] leading-none">
                Devbhoomi Infotech
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mt-0.5">
                Studio &amp; Practice Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#6B706E] border border-[#DCD8D0] bg-[#FCFAF7] px-2.5 py-1 rounded-[6px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7344]" />
              <span>Reference IST: {digital12(istWall.h, istWall.m)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Focused Center Authentication Portal */}
      <main className="flex-1 flex items-center justify-center py-12 sm:py-16 px-5 sm:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#DCD8D0] bg-[#F2EFE9] text-[#6B706E] font-mono text-[11px] uppercase tracking-wider mb-4">
              <span>Direct Studio Authentication</span>
            </div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#161918] font-normal tracking-tight mb-2">
              Sign in to your practice workspace.
            </h1>
            <p className="text-sm text-[#444846] leading-relaxed">
              Enter your credentials to access class schedules, fee cycle ledgers, and attendance records.
            </p>
          </div>

          <div className="border border-[#DCD8D0] rounded-[6px] bg-[#FCFAF7] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-[#6B706E] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  placeholder="e.g. admin or aarav.sharma"
                  className="w-full text-sm bg-[#F8F7F4] border border-[#DCD8D0] rounded-[6px] px-3.5 py-2.5 text-[#161918] placeholder-[#9E9E9E] focus:outline-none focus:border-[#161918] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-xs text-[#6B706E] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#6B706E] hover:text-[#161918] font-mono cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter account password"
                  className="w-full text-sm bg-[#F8F7F4] border border-[#DCD8D0] rounded-[6px] px-3.5 py-2.5 text-[#161918] placeholder-[#9E9E9E] focus:outline-none focus:border-[#161918] transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-[6px] bg-[#FBEAE8] border border-[#F2C5BE] text-[#B64E30] text-xs leading-relaxed font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-sm font-semibold text-[#F8F7F4] bg-[#161918] hover:bg-[#2A2E2C] active:bg-[#000000] py-3 rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>Log in to Studio</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>

            {/* 1-Click Verification / Demo Access */}
            <div className="mt-6 pt-6 border-t border-[#E4E1DB]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B706E]">
                  Fast Demo Sign-In
                </span>
                <span className="text-[11px] text-[#8F948F] font-mono">Pre-loaded Accounts</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => onQuickLogin?.("admin")}
                  className="px-3.5 py-2 text-xs font-semibold rounded-[6px] border border-[#DCD8D0] bg-[#F8F7F4] hover:bg-[#F2EFE9] text-[#161918] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Admin Portal</span>
                  <span className="font-mono text-[10px] text-[#6B706E]">Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => onQuickLogin?.("student")}
                  className="px-3.5 py-2 text-xs font-semibold rounded-[6px] border border-[#DCD8D0] bg-[#F8F7F4] hover:bg-[#F2EFE9] text-[#161918] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Student Portal</span>
                  <span className="font-mono text-[10px] text-[#6B706E]">Aarav</span>
                </button>
              </div>

              <div className="space-y-1 text-xs text-[#6B706E] font-mono bg-[#F4F2EB] p-3 rounded-[6px] border border-[#E4E1DB]">
                <div className="flex justify-between">
                  <span>Admin Credentials:</span>
                  <code className="text-[#161918] font-bold">admin / admin123</code>
                </div>
                <div className="flex justify-between">
                  <span>Student Credentials:</span>
                  <code className="text-[#161918] font-bold">aarav.sharma / aarav123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Editorial Footer with Comprehensive Legal Links */}
      <footer className="border-t border-[#E4E1DB] bg-[#F8F7F4] py-6 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B706E] gap-3">
          <div>
            &copy; {new Date().getFullYear()} Devbhoomi Infotech Studio Infrastructure. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLegalModalType("privacy")}
              className="hover:text-[#161918] underline underline-offset-4 cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModalType("terms")}
              className="hover:text-[#161918] underline underline-offset-4 cursor-pointer"
            >
              Terms of Service
            </button>
            <span>·</span>
            <span className="font-mono text-[11px]">UTC: {currentTime.toUTCString().slice(17, 22)}</span>
          </div>
        </div>
      </footer>

      {/* Accessible Legal Modals */}
      {legalModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60">
          <div className="bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#161918]">
            <div className="px-6 py-4 border-b border-[#E4E1DB] flex items-center justify-between bg-[#F4F2EB]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#B64E30]">
                  Studio Governance Documentation
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#161918]">
                  {legalModalType === "privacy" ? "Student Data & Privacy Policy" : "Studio Terms of Service & Liability Waiver"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalType(null)}
                className="p-1 rounded-[4px] hover:bg-[#E4E1DB] text-[#444846] transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#444846] leading-relaxed">
              {legalModalType === "privacy" ? (
                <>
                  <div>
                    <h4 className="font-bold text-[#161918] mb-1">1. Student Health Data Sovereignty</h4>
                    <p>
                      Devbhoomi Infotech provides dedicated infrastructure directly operated by your yoga instructor. Health intake disclosures—including spinal history, joint conditions, pregnancy status, and cardiovascular observations—are stored strictly within your instructor’s private studio instance and are never aggregated, commodified, or shared with commercial health brokers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#161918] mb-1">2. Payment &amp; Banking Data Safeguards</h4>
                    <p>
                      Because Devbhoomi Infotech facilitates direct-to-bank settlements (such as UPI IDs and international wire transfers), no full credit card numbers or banking passwords are ever stored on or processed through intermediate cloud aggregators. All transaction confirmations are logged solely for tuition cycle accounting.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#161918] mb-1">3. Right to Rectification &amp; Deletion</h4>
                    <p>
                      Every registered student maintains the right to inspect their complete attendance logs and contact details upon request to their instructor. Upon cessation of practice, personal records may be archived or permanently purged upon written request.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-[#161918] mb-1">1. Practice Safety &amp; Physical Liability Waiver</h4>
                    <p>
                      Yoga asana, pranayama, and mindful movement involve inherent physical demands. By participating in studio sessions, students acknowledge their responsibility to practice within personal physical boundaries, communicate injuries immediately to the teacher, and seek independent medical clearance when pregnant or managing chronic conditions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#161918] mb-1">2. Cancellation &amp; Rescheduling Windows</h4>
                    <p>
                      Private 1-on-1 sessions require a minimum 24-hour advance rescheduling notice. Cancellations made inside 24 hours of the scheduled session time are counted as completed classes against the monthly cohort allowance.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#161918] mb-1">3. Tuition Cycles &amp; Clamped 30-Day Due Dates</h4>
                    <p>
                      Studio fees cover a 30-day practice cycle from the date of initial payment. Monthly tuition is non-refundable once the cycle commences. Due dates clamp to the end of the succeeding calendar month for consistent billing regularity.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E4E1DB] bg-[#F4F2EB] flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModalType(null)}
                className="px-4 py-1.5 rounded-[4px] bg-[#161918] text-[#F8F7F4] text-xs font-medium hover:bg-[#2A2E2C] cursor-pointer"
              >
                Close Legal Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
