import React from "react";
import { CheckIcon, UndoIcon, WalletIcon } from "./Icons";
import {
  getCurrentDueDate,
  getDaysLeft,
  feeTier,
  formatDateHuman,
  addMonthsClamped,
  stripTime,
  fmtISO,
} from "../utils/dateUtils";

export default function FeeRing({
  student,
  mode = "student",
  onPayNow,
  onUpdatePayment,
}) {
  if (!student) return null;

  const due = getCurrentDueDate(student);
  const daysLeft = getDaysLeft(student);
  const cycleStart = addMonthsClamped(due, -1);
  const today = stripTime(new Date());
  const cycleLenMs = due - cycleStart;
  const fracRemaining = Math.max(0, Math.min(1, (due - today) / cycleLenMs));

  const tier = feeTier(daysLeft);
  const tierLabel = {
    overdue: "Overdue",
    urgent: "Due very soon",
    soon: "Due soon",
    safe: "On track",
  }[tier];

  const centerText =
    daysLeft < 0
      ? `${Math.abs(daysLeft)}d`
      : daysLeft === 0
      ? "Today"
      : daysLeft === 1
      ? "1d"
      : `${daysLeft}d`;

  const subText =
    daysLeft < 0
      ? "overdue"
      : daysLeft === 0
      ? "due today"
      : daysLeft === 1
      ? "day left"
      : "days left";

  const circumference = 2 * Math.PI * 52;
  const dash = fracRemaining * circumference;

  const tierStrokeColor = {
    safe: "var(--success)",
    soon: "var(--warning)",
    urgent: "var(--danger)",
    overdue: "var(--overdue)",
  }[tier];

  const handleMarkPaid = () => {
    if (!onUpdatePayment) return;
    const history = student.paymentHistory || [];
    const updatedHistory = [...history, student.lastPaymentDate];
    const newPaymentDate = fmtISO(due);
    onUpdatePayment(student.id, newPaymentDate, updatedHistory);
  };

  const handleReset = () => {
    if (!onUpdatePayment || !student.paymentHistory || !student.paymentHistory.length) return;
    const updatedHistory = [...student.paymentHistory];
    const lastDate = updatedHistory.pop();
    onUpdatePayment(student.id, lastDate, updatedHistory);
  };

  const canUndo = Boolean(student.paymentHistory && student.paymentHistory.length > 0);

  return (
    <div className="flex items-center gap-[18px] w-full">
      {/* Circular Progress Visual */}
      <div className="relative w-[110px] h-[110px] flex-none">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={tierStrokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference.toFixed(1)}
            strokeDashoffset={(circumference - dash).toFixed(1)}
            transform="rotate(-90 60 60)"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mono font-semibold text-[22px] leading-tight" style={{ color: "var(--ink)" }}>
            {centerText}
          </div>
          <div className="text-[11px] leading-tight" style={{ color: "var(--ink-soft)" }}>
            {subText}
          </div>
        </div>
      </div>

      {/* Meta Information & Context Actions */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div>
          <span className={`tag tag--${tier}`}>{tierLabel}</span>
        </div>

        <div className="flex justify-between gap-2.5 text-[13px]" style={{ color: "var(--ink-soft)" }}>
          <span>Next due</span>
          <strong className="mono font-semibold" style={{ color: "var(--ink)" }}>
            {formatDateHuman(due)}
          </strong>
        </div>

        <div className="flex justify-between gap-2.5 text-[13px]" style={{ color: "var(--ink-soft)" }}>
          <span>Amount</span>
          <strong className="mono font-semibold" style={{ color: "var(--ink)" }}>
            ₹{student.fee?.toLocaleString("en-IN")}/mo
          </strong>
        </div>

        {mode === "admin" && (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleMarkPaid}
              className="btn btn--primary flex-1 text-xs"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Mark fee received</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canUndo}
              title={canUndo ? "Undo the last payment update" : "Nothing to undo yet"}
              className="btn text-xs px-2.5"
            >
              <UndoIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {mode === "student" && (
          <button
            type="button"
            onClick={() => onPayNow && onPayNow(student)}
            className="btn btn--primary w-full mt-1"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Pay now</span>
          </button>
        )}
      </div>
    </div>
  );
}
