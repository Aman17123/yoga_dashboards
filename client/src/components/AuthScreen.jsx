import React, { useState } from "react";
import { SunIcon, UserIcon, UsersIcon, EyeIcon, EyeOffIcon } from "./Icons";

export default function AuthScreen({ onLogin, onQuickLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await onLogin(username.trim(), password);
      if (!success) {
        setError("That username or password doesn't match any account.");
      }
    } catch (err) {
      setError("Unable to sign in. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background: `
          radial-gradient(circle at 18% 18%, var(--dawn-soft), transparent 55%),
          radial-gradient(circle at 82% 82%, var(--dusk-soft), transparent 55%),
          var(--bg)
        `,
      }}
    >
      <div
        className="w-full max-w-[390px] border rounded-[var(--radius-lg)] p-[32px_30px] shadow-[var(--shadow-md)]"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 pb-[18px]">
          <span className="w-[30px] h-[30px] flex-none" style={{ color: "var(--dawn)" }}>
            <SunIcon className="w-full h-full" />
          </span>
          <span
            className="font-bold text-[19px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            yogaonlive
          </span>
        </div>

        <h1
          className="text-[22px] font-bold mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Sign in
        </h1>
        <p className="text-[13.5px] mb-5" style={{ color: "var(--ink-soft)" }}>
          Use the username and password your instructor gave you.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" autoComplete="on">
          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
              className="p-[10px_12px] border rounded-[var(--radius-sm)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--ink)",
                background: "var(--surface)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Password</span>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full p-[10px_12px] pr-[38px] border rounded-[var(--radius-sm)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#4C5FD5]"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--ink)",
                  background: "var(--surface)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 w-[26px] h-[26px] flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: "var(--ink-faint)" }}
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
            <div
              className="text-[12.5px] font-semibold p-[9px_10px] rounded-lg"
              style={{
                background: "var(--danger-soft)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary w-full p-[11px] mt-0.5"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs mt-4 leading-relaxed" style={{ color: "var(--ink-faint)" }}>
          Don't have a login yet? Ask your instructor to set one up for you — there's no self sign-up here.
        </p>

        {/* Quick Demo Section */}
        <div className="mt-4 pt-3.5 border-t border-dashed" style={{ borderColor: "var(--border-strong)" }}>
          <div
            className="font-bold uppercase tracking-wider text-[10.5px] mb-1.5"
            style={{ color: "var(--ink-faint)" }}
          >
            Quick test — skip the form
          </div>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => onQuickLogin("admin")}
              className="btn flex-1 p-[9px_8px] text-[12.5px] gap-1.5 hover:bg-[#E6E9FB] hover:text-[#4C5FD5] hover:border-[#E6E9FB]"
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Continue as Admin</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickLogin("student")}
              className="btn flex-1 p-[9px_8px] text-[12.5px] gap-1.5 hover:bg-[#E6E9FB] hover:text-[#4C5FD5] hover:border-[#E6E9FB]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Continue as Student</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 text-xs" style={{ color: "var(--ink-soft)" }}>
            <div className="flex justify-between items-center py-0.5">
              <span>Admin login</span>
              <code className="mono p-[1px_6px] rounded text-[11px]" style={{ background: "var(--bg-alt)" }}>
                admin / admin123
              </code>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Student login</span>
              <code className="mono p-[1px_6px] rounded text-[11px]" style={{ background: "var(--bg-alt)" }}>
                aarav.sharma / aarav123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
