import React from "react";
import { CheckIcon } from "./Icons";

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#161918] text-[#F8F7F4] border border-[#3E4240] px-4 py-2.5 rounded-[6px] shadow-lg text-xs sm:text-sm font-mono max-w-[90vw] animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="w-4 h-4 text-[#1D7344] flex-none">
        <CheckIcon className="w-full h-full stroke-[2.2]" />
      </div>
      <span className="leading-snug">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-[#8E8A82] hover:text-[#F8F7F4] text-xs cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
}
