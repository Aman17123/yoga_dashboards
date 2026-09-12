import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

// Brand Sun Logo
function SunLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="5.5" fill="#F2994A" />
      <circle cx="17" cy="17" r="11" stroke="#F2994A" strokeWidth="1.5" strokeDasharray="3.5 2.8" fill="none" />
      <path d="M17 3.5v3M17 27.5v3M3.5 17h3M27.5 17h3M7.2 7.2l2 2M24.8 24.8l2 2M24.8 7.2l-2 2M7.2 24.8l2-2" stroke="#F2994A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage({
  onLogin,
  onQuickLogin,
  session,
  currentStudent,
  onLogout,
  onNavigateDashboard,
}) {
  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!username.trim() || !password) {
      setLoginError("Please enter both username and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const success = await onLogin(username.trim(), password);
      if (!success) {
        setLoginError("Invalid username or password.");
      } else {
        setShowLoginModal(false);
      }
    } catch (err) {
      setLoginError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFAF7] text-[#171A32] font-sans antialiased selection:bg-[#F2994A]/20 selection:text-[#171A32]">
      {/* ═══ TOP NAVBAR ═══ */}
      <Navbar
        session={session}
        currentStudent={currentStudent}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={onLogout}
        onNavigateDashboard={onNavigateDashboard}
        showBookNow={true}
      />

      {/* ═══ LOGGED-IN STUDENT WELCOME BANNER ═══ */}
      {session?.role === "student" && currentStudent && (
        <div className="bg-gradient-to-r from-[#EEF2FD] via-[#F4F1FB] to-[#FFF8F0] border-b border-[#E2E6FA] py-3 px-4 sm:px-8 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧘‍♀️</span>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#171A32]">
                  Welcome back, {currentStudent.name}!
                </div>
                <div className="text-[11px] text-[#6B7089]">
                  {currentStudent.classType === "group" ? "Group Cohort" : "Private 1-on-1 Practice"} · Instructor:{" "}
                  <strong className="text-[#4C5FD5]">{currentStudent.instructor || "Assigned"}</strong> · Daily Slot:{" "}
                  <strong>{currentStudent.classTimeIST || "19:00"} IST</strong>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="banner-open-dashboard-btn"
                onClick={onNavigateDashboard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#4C5FD5] hover:bg-[#3B4DBF] text-white text-xs font-bold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Go to My Dashboard</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden flex-1 flex items-center justify-center py-16 sm:py-24">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#4C5FD5]/10 via-[#F2994A]/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E4E1DB] text-xs font-bold uppercase tracking-wider text-[#F2994A] shadow-xs mb-6">
            <span>✨ Live Interactive Yoga Sessions · 1-to-1 &amp; Group Cohorts</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#171A32] leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Transform your mind &amp; body with live guided yoga.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#5B607A] max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Personalized 1-on-1 private coaching and interactive small cohorts led by certified masters. Practice in your timezone with live posture corrections.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
            {session?.role === "student" ? (
              <button
                type="button"
                id="hero-student-dashboard-btn"
                onClick={onNavigateDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[10px] bg-gradient-to-r from-[#4C5FD5] to-[#6B3FA8] hover:from-[#3D4EC4] hover:to-[#5B3195] text-white text-base font-bold shadow-xl shadow-[#4C5FD5]/25 hover:shadow-2xl hover:shadow-[#4C5FD5]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <span>🧘 Open My Student Dashboard</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <a
                href="/book"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[10px] bg-gradient-to-r from-[#4C5FD5] to-[#6B3FA8] hover:from-[#3D4EC4] hover:to-[#5B3195] text-white text-base font-bold shadow-xl shadow-[#4C5FD5]/25 hover:shadow-2xl hover:shadow-[#4C5FD5]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer no-underline"
              >
                <span>Book Your Free Trial Class</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>

          {/* Social Proof Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-[#6B7089]">
            <div className="flex items-center gap-2">
              <span className="text-[#F2994A] text-base">★★★★★</span>
              <span>4.9/5 Rating (2,500+ Sessions)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌍 Students across 18+ Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎁 100% Free First Class · Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#E7E4DC] bg-[#FFFFFF] py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SunLogo size={28} />
            <span
              className="text-xl font-bold tracking-tight text-[#171A32]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              yogaonlive
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#7B8098]">
            <span>© 2026 yogaonlive. All rights reserved.</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="text-[#4C5FD5] hover:underline cursor-pointer font-semibold"
            >
              Studio Staff / Student Login
            </button>
          </div>
        </div>
      </footer>

      {/* ═══ STUDIO SIGN-IN MODAL (FOR ADMIN & REGISTERED STUDENTS) ═══ */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[16px] border border-[#DCD8D0] p-7 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <SunLogo size={30} />
              <span className="font-bold text-xl text-[#171A32]" style={{ fontFamily: "var(--font-display)" }}>
                yogaonlive Login
              </span>
            </div>

            <p className="text-xs text-[#6B7089] mb-5">
              Enter your credentials to access class schedules, fee cycle ledgers, and attendance records.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7089] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or aarav.sharma"
                  required
                  autoFocus
                  className="w-full text-sm bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] px-3.5 py-2.5 text-[#171A32] focus:outline-none focus:border-[#4C5FD5]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7089]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#6B7089] hover:text-[#171A32] font-mono cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full text-sm bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] px-3.5 py-2.5 text-[#171A32] focus:outline-none focus:border-[#4C5FD5]"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-[6px] bg-[#FBEAE8] border border-[#F2C5BE] text-[#B64E30] text-xs font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full text-sm font-semibold text-white bg-[#171A32] hover:bg-[#2A2E46] py-3 rounded-[6px] transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-sm"
              >
                <span>{loginLoading ? "Signing in…" : "Sign in to Studio"}</span>
              </button>
            </form>

            {/* Quick Demo Logins */}
            {onQuickLogin && (
              <div className="mt-6 pt-5 border-t border-[#E7E4DC]">
                <div className="text-[11px] font-mono text-[#7B8098] uppercase tracking-wider mb-2.5">
                  Quick Demo Access:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onQuickLogin("admin");
                      setShowLoginModal(false);
                    }}
                    className="p-2 rounded-[6px] border border-[#DCD8D0] text-xs font-semibold text-[#171A32] hover:bg-[#FCFAF7] cursor-pointer"
                  >
                    👨‍💼 Admin Console
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickLogin("student", 1);
                      setShowLoginModal(false);
                    }}
                    className="p-2 rounded-[6px] border border-[#DCD8D0] text-xs font-semibold text-[#171A32] hover:bg-[#FCFAF7] cursor-pointer"
                  >
                    🧘 Student Desk
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
