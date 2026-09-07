import React from "react";
import { getWallTime } from "../utils/dateUtils";

export default function AnalogClock({ tz, currentTime }) {
  const { h, m, s } = getWallTime(tz, currentTime);

  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const major = i % 3 === 0;
    const r1 = major ? 44 : 49;
    const r2 = 54;
    const x1 = (60 + r1 * Math.sin(angle)).toFixed(1);
    const y1 = (60 - r1 * Math.cos(angle)).toFixed(1);
    const x2 = (60 + r2 * Math.sin(angle)).toFixed(1);
    const y2 = (60 - r2 * Math.cos(angle)).toFixed(1);

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={{
          stroke: major ? "var(--ink-soft)" : "var(--ink-faint)",
          strokeWidth: major ? 2.2 : 1.4,
        }}
      />
    );
  });

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = (m + s / 60) * 6;
  const secAngle = s * 6;

  return (
    <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] mb-2 relative flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle
          cx="60"
          cy="60"
          r="56"
          style={{
            fill: "var(--surface)",
            stroke: "var(--border-strong)",
            strokeWidth: 2,
          }}
        />
        {ticks}
        {/* Hour Hand */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="34"
          strokeLinecap="round"
          style={{
            stroke: "var(--ink)",
            strokeWidth: 4.5,
          }}
          transform={`rotate(${hourAngle} 60 60)`}
        />
        {/* Minute Hand */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="24"
          strokeLinecap="round"
          style={{
            stroke: "var(--ink)",
            strokeWidth: 3,
          }}
          transform={`rotate(${minAngle} 60 60)`}
        />
        {/* Second Hand - Dawn */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="18"
          strokeLinecap="round"
          style={{
            stroke: "var(--dawn)",
            strokeWidth: 1.6,
          }}
          transform={`rotate(${secAngle} 60 60)`}
        />
        {/* Center Pin */}
        <circle cx="60" cy="60" r="3.5" style={{ fill: "var(--ink)" }} />
      </svg>
    </div>
  );
}
