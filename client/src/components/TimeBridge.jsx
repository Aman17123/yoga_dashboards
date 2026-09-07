import React from "react";
import AnalogClock from "./AnalogClock";
import { ArrowRightIcon } from "./Icons";
import { getWallTime, digital12, offsetSentence } from "../utils/dateUtils";

export default function TimeBridge({ student, currentTime }) {
  const istWall = getWallTime("Asia/Kolkata", currentTime);
  const studentTz = student?.timezone || "Asia/Kolkata";
  const studentWall = getWallTime(studentTz, currentTime);

  const istDateStr = currentTime.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const studentDateStr = currentTime.toLocaleDateString("en-US", {
    timeZone: studentTz,
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const offset = offsetSentence("Asia/Kolkata", studentTz, student?.country || "Local");
  const studentFirstName = student?.name ? student.name.split(" ")[0] : "Student";

  return (
    <div className="flex items-center justify-between gap-2.5 w-full">
      {/* Instructor Side */}
      <div className="flex flex-col items-center text-center w-[40%]">
        <div
          className="text-[11.5px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "var(--dawn)" }}
        >
          Instructor · IST
        </div>
        <AnalogClock tz="Asia/Kolkata" currentTime={currentTime} />
        <div className="mono font-semibold text-base" style={{ color: "var(--ink)" }}>
          {digital12(istWall.h, istWall.m)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
          {istDateStr}
        </div>
      </div>

      {/* Center Connector */}
      <div className="flex flex-col items-center justify-center gap-1.5 w-[20%]" style={{ color: "var(--ink-faint)" }}>
        <div className="w-[22px] h-[22px]">
          <ArrowRightIcon className="w-full h-full" />
        </div>
        <div
          className="text-[11.5px] font-semibold text-center leading-snug px-1"
          style={{ color: "var(--ink-soft)" }}
        >
          {offset}
        </div>
      </div>

      {/* Student Side */}
      <div className="flex flex-col items-center text-center w-[40%]">
        <div
          className="text-[11.5px] font-bold uppercase tracking-wider mb-2 truncate max-w-full"
          style={{ color: "var(--dusk)" }}
        >
          {studentFirstName} · {student?.country}
        </div>
        <AnalogClock tz={studentTz} currentTime={currentTime} />
        <div className="mono font-semibold text-base" style={{ color: "var(--ink)" }}>
          {digital12(studentWall.h, studentWall.m)}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
          {studentDateStr}
        </div>
      </div>
    </div>
  );
}
