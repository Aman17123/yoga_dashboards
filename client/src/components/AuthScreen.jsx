import React, { useState } from "react";
import { SunIcon, UserIcon, UsersIcon, EyeIcon, EyeOffIcon } from "./Icons";
import BrandLogo from "./BrandLogo";

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
          <BrandLogo size={30} className="w-[30px] h-[30px]" />
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
              placeholder="e.g. admin or user"
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
                placeholder="Enter password"
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
      </div>
    </div>
  );
}
