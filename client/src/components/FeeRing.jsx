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

  const strokeColors = {
    safe: "stroke-[#1E9E63]",
    soon: "stroke-[#C87A12]",
    urgent: "stroke-[#E1483C]",
    overdue: "stroke-[#9A2B23]",
  };

  const badgeStyles = {
    safe: "bg-[#DFF5EA] text-[#1E9E63]",
    soon: "bg-[#FBEDD6] text-[#C87A12]",
    urgent: "bg-[#FCE4E1] text-[#E1483C]",
    overdue: "bg-[#F6DAD6] text-[#9A2B23]",
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
    <div className="flex items-center gap-4 sm:gap-5 w-full">
      {/* Circular Progress Ring */}
      <div className="relative w-24 h-24 sm:w-[110px] sm:h-[110px] flex-none">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#E3E6F2"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={`${strokeColors[tier]} transition-all duration-500 origin-[60px_60px] -rotate-90`}
            strokeDasharray={circumference.toFixed(1)}
            strokeDashoffset={(circumference - dash).toFixed(1)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono font-semibold text-xl sm:text-[22px] text-[#171A32]">
            {centerText}
          </div>
          <div className="text-[11px] text-[#6B7089]">
            {subText}
          </div>
        </div>
      </div>

      {/* Details & Actions */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badgeStyles[tier]}`}>
            {tierLabel}
          </span>
        </div>

        <div className="flex justify-between gap-2 text-[13px] text-[#6B7089]">
          <span>Next due</span>
          <strong className="text-[#171A32] font-mono font-semibold">
            {formatDateHuman(due)}
          </strong>
        </div>

        <div className="flex justify-between gap-2 text-[13px] text-[#6B7089]">
          <span>Amount</span>
          <strong className="text-[#171A32] font-mono font-semibold">
            ₹{student.fee.toLocaleString("en-IN")}/mo
          </strong>
        </div>

        {mode === "admin" && (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleMarkPaid}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold py-2 px-2.5 transition-all shadow-xs active:scale-95"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Mark paid</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canUndo}
              title={canUndo ? "Undo last payment update" : "Nothing to undo"}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#CDD2E8] bg-white hover:bg-[#EEF0FA] text-[#171A32] text-xs font-bold py-2 px-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#171A32] hover:bg-black text-white text-xs font-bold py-2.5 px-3 transition-all shadow-xs mt-1 active:scale-95"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Pay now</span>
          </button>
        )}
      </div>
    </div>
  );
}
