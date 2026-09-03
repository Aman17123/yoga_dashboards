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
  const due = getCurrentDueDate(student);
  const daysLeft = getDaysLeft(student);
  const cycleStart = addMonthsClamped(due, -1);
  const today = stripTime(new Date());
  const cycleLenMs = due - cycleStart;
  const fracRemaining = Math.max(0, Math.min(1, (due - today) / cycleLenMs));

  const tier = feeTier(daysLeft);
  const tierLabel = {
    overdue: "Overdue Cycle",
    urgent: "Due Immediately",
    soon: "Due Within 7 Days",
    safe: "Settled / On Track",
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

  const circumference = 2 * Math.PI * 50;
  const dash = fracRemaining * circumference;

  const strokeColors = {
    safe: "stroke-[#1D7344]",
    soon: "stroke-[#8A6D3B]",
    urgent: "stroke-[#B64E30]",
    overdue: "stroke-[#B64E30]",
  };

  const badgeStyles = {
    safe: "bg-[#EAF5EE] text-[#1D7344] border border-[#C6E6D3]",
    soon: "bg-[#FAF2E6] text-[#8A6D3B] border border-[#ECD9BD]",
    urgent: "bg-[#FBEAE8] text-[#B64E30] border border-[#F2C5BE]",
    overdue: "bg-[#FBEAE8] text-[#B64E30] border border-[#F2C5BE]",
  };

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

  const canUndo = !!(student.paymentHistory && student.paymentHistory.length);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
      {/* Circular Progress Ring */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-none">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#E4E1DB"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`${strokeColors[tier]} transition-all duration-500 origin-[60px_60px] -rotate-90`}
            strokeDasharray={circumference.toFixed(1)}
            strokeDashoffset={(circumference - dash).toFixed(1)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-serif-editorial text-2xl font-bold text-[#161918] leading-tight">
            {centerText}
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#6B706E]">
            {subText}
          </div>
        </div>
      </div>

      {/* Details & Actions */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full">
        <div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-[4px] font-mono text-[10.5px] font-medium ${badgeStyles[tier]}`}
          >
            {tierLabel}
          </span>
        </div>

        <div className="flex justify-between items-baseline gap-2 text-xs border-b border-[#E4E1DB]/60 pb-1.5">
          <span className="text-[#6B706E]">Next cycle due</span>
          <strong className="text-[#161918] font-mono font-medium">
            {formatDateHuman(due)}
          </strong>
        </div>

        <div className="flex justify-between items-baseline gap-2 text-xs border-b border-[#E4E1DB]/60 pb-1.5">
          <span className="text-[#6B706E]">Monthly tuition</span>
          <strong className="text-[#161918] font-mono font-semibold">
            ₹{student.fee.toLocaleString("en-IN")}
          </strong>
        </div>

        {mode === "admin" && (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleMarkPaid}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[#161918] hover:bg-[#2A2E2C] text-[#F8F7F4] text-xs font-semibold py-2 px-2.5 transition-colors cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Record Settlement</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canUndo}
              title={canUndo ? "Undo last payment update" : "No previous ledger entry to revert"}
              className="inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-[#DCD8D0] bg-[#FCFAF7] hover:bg-[#F2EFE9] text-[#161918] text-xs font-medium py-2 px-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <UndoIcon className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>
        )}

        {mode === "student" && (
          <button
            type="button"
            onClick={() => onPayNow && onPayNow(student)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#161918] hover:bg-[#2A2E2C] text-[#F8F7F4] text-xs font-semibold py-2.5 px-3 transition-colors mt-1 cursor-pointer"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Pay Tuition Online</span>
          </button>
        )}
      </div>
    </div>
  );
}
