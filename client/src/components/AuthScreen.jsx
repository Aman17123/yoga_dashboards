import React, { useState } from "react";
import { SunIcon, UserIcon, UsersIcon, EyeIcon, EyeOffIcon } from "./Icons";

export default function AuthScreen({ onLogin, onQuickLogin, onBackToHome }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const success = onLogin(username.trim(), password);
    if (!success) {
      setError("That username or password doesn't match any account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FDEBDA] via-[#F6F7FB] to-[#E6E9FB]">
      <div className="bg-white border border-[#E3E6F2] rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-sm relative">
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7089] hover:text-[#171A32] transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        )}

        {/* Brand */}
        <div className="flex items-center gap-2.5 pb-4">
          <div className="w-8 h-8 text-[#F2994A]">
            <SunIcon className="w-full h-full" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#171A32]">
            Meridian
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#171A32] mb-1">
          Sign in
        </h1>
        <p className="text-[#6B7089] text-xs sm:text-[13px] mb-5">
          Use the username and password your instructor gave you.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#6B7089]">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 border border-[#CDD2E8] rounded-xl font-medium text-sm text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#6B7089]">
            <span>Password</span>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-3 pr-10 py-2.5 border border-[#CDD2E8] rounded-xl font-medium text-sm text-[#171A32] focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-[#A3A8C3] hover:text-[#171A32] p-1 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <div className="bg-[#FCE4E1] text-[#E1483C] text-xs font-semibold p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#171A32] hover:bg-black text-white text-sm font-bold shadow-xs transition-all active:scale-[0.98] mt-1"
          >
            Sign in
          </button>
        </form>

        <p className="text-[11.5px] text-[#A3A8C3] mt-4 leading-relaxed">
          Don't have a login yet? Ask your instructor to set one up for you — there's no self sign-up here.
        </p>

        {/* Quick Demo Section */}
        <div className="mt-5 pt-4 border-t border-dashed border-[#CDD2E8]">
          <div className="text-[10.5px] font-bold text-[#A3A8C3] uppercase tracking-wider mb-2.5">
            Quick test — skip the form
          </div>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => onQuickLogin("admin")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#E6E9FB] hover:text-[#4C5FD5] hover:border-[#E6E9FB] text-xs font-bold text-[#171A32] transition-all"
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickLogin("student")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#E6E9FB] hover:text-[#4C5FD5] hover:border-[#E6E9FB] text-xs font-bold text-[#171A32] transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>

          <div className="space-y-1 text-xs text-[#6B7089]">
            <div className="flex justify-between items-center">
              <span>Admin login</span>
              <code className="font-mono bg-[#EEF0FA] px-1.5 py-0.5 rounded text-[11px]">
                admin / admin123
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span>Student login</span>
              <code className="font-mono bg-[#EEF0FA] px-1.5 py-0.5 rounded text-[11px]">
                aarav.sharma / aarav123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
