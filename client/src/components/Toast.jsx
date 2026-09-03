import React from "react";
import { CheckIcon } from "./Icons";

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#171A32] text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold max-w-[90vw] animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="w-4 h-4 text-[#1E9E63] flex-none">
        <CheckIcon className="w-full h-full stroke-[2.5]" />
      </div>
      <span className="leading-snug">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-[#A3A8C3] hover:text-white text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}
