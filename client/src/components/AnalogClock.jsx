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
        className={`stroke-[1.3] ${
          major ? "stroke-[#444846] stroke-[2]" : "stroke-[#C8C4BC]"
        }`}
      />
    );
  });

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = (m + s / 60) * 6;
  const secAngle = s * 6;

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 mb-2 relative flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle
          cx="60"
          cy="60"
          r="56"
          className="fill-[#FCFAF7] stroke-[#DCD8D0] stroke-[1.5]"
        />
        {ticks}
        {/* Hour Hand */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="34"
          strokeLinecap="round"
          className="stroke-[#161918] stroke-[4]"
          transform={`rotate(${hourAngle} 60 60)`}
        />
        {/* Minute Hand */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="24"
          strokeLinecap="round"
          className="stroke-[#161918] stroke-[2.5]"
          transform={`rotate(${minAngle} 60 60)`}
        />
        {/* Second Hand - Terracotta */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="18"
          strokeLinecap="round"
          className="stroke-[#B64E30] stroke-[1.5]"
          transform={`rotate(${secAngle} 60 60)`}
        />
        {/* Center Pin */}
        <circle cx="60" cy="60" r="3" className="fill-[#161918]" />
      </svg>
    </div>
  );
}
