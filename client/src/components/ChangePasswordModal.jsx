import React, { useState } from "react";
import { XIcon, CheckIcon } from "./Icons";
import { api } from "../services/api";

export default function ChangePasswordModal({ student, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.trim().length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match. Please re-check.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.students.changePassword(
        student.id,
        currentPassword,
        newPassword.trim()
      );
      if (res?.success) {
        setSuccessMsg(res.message || "Password changed successfully.");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res?.error || "Failed to update password.");
      }
    } catch (err) {
      setError(err?.data?.error || err?.message || "Failed to update password. Please verify current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={!loading ? onClose : undefined} />
      <div className="modal__panel max-w-md" role="dialog" aria-modal="true">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="modal__close"
        >
          <XIcon className="w-4 h-4" />
        </button>

        <div>
          <div className="eyebrow">Student Account Settings</div>
          <h2 className="modal__title">Change Password</h2>
          <p className="view__note" style={{ margin: "-4px 0 16px" }}>
            Update your login password for <strong>@{student.username}</strong>.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-[var(--radius-sm)] text-xs bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30 font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-[var(--radius-sm)] text-xs bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30 font-medium flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
              <span>Current Password</span>
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </label>

            <label className="flex flex-col gap-1 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
              <span>New Password (min 6 characters)</span>
              <input
                type={showPasswords ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </label>

            <label className="flex flex-col gap-1 text-[12.5px] font-bold" style={{ color: "var(--ink-soft)" }}>
              <span>Confirm New Password</span>
              <input
                type={showPasswords ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="p-[9px_11px] border rounded-[var(--radius-sm)] font-medium text-sm text-[var(--ink)] bg-[var(--surface)]"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </label>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="accent-[#4C5FD5]"
                />
                <span>Show passwords</span>
              </label>

              <span className="text-[11px] text-[var(--ink-faint)]">Bcrypt hashed</span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn--primary"
              >
                {loading ? "Updating password…" : "Save New Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
