import React from "react";
import AnalogClock from "./AnalogClock";
import { ArrowRightIcon } from "./Icons";
import { getWallTime, digital12, offsetSentence } from "../utils/dateUtils";

export default function TimeBridge({ student, currentTime }) {
  const istWall = getWallTime("Asia/Kolkata", currentTime);
  const studentWall = getWallTime(student.timezone || "Asia/Kolkata", currentTime);

  const istDateStr = currentTime.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const studentDateStr = currentTime.toLocaleDateString("en-US", {
    timeZone: student.timezone || "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const offset = offsetSentence("Asia/Kolkata", student.timezone || "Asia/Kolkata", student.country || "Local");
  const studentFirstName = student.name ? student.name.split(" ")[0] : "Student";

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
      {/* Instructor Side */}
      <div className="flex flex-col items-center text-center w-[40%] bg-[#F8F7F4] border border-[#E4E1DB] rounded-[6px] p-3 sm:p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B706E] mb-2">
          Studio Reference · IST
        </div>
        <AnalogClock tz="Asia/Kolkata" currentTime={currentTime} />
        <div className="font-mono font-semibold text-base text-[#161918]">
          {digital12(istWall.h, istWall.m)}
        </div>
        <div className="font-mono text-[11px] text-[#6B706E] mt-0.5">
          {istDateStr}
        </div>
      </div>

      {/* Middle Connector */}
      <div className="flex flex-col items-center justify-center gap-1.5 w-[20%] text-[#8E8A82]">
        <div className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E8A82]">
          <ArrowRightIcon className="w-full h-full" />
        </div>
        <div className="font-mono text-[10.5px] text-[#6B706E] text-center font-medium leading-tight px-1">
          {offset}
        </div>
      </div>

      {/* Student Side */}
      <div className="flex flex-col items-center text-center w-[40%] bg-[#F8F7F4] border border-[#E4E1DB] rounded-[6px] p-3 sm:p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#161918] mb-2">
          {studentFirstName} · {student.country}
        </div>
        <AnalogClock tz={student.timezone || "Asia/Kolkata"} currentTime={currentTime} />
        <div className="font-mono font-semibold text-base text-[#161918]">
          {digital12(studentWall.h, studentWall.m)}
        </div>
        <div className="font-mono text-[11px] text-[#6B706E] mt-0.5">
          {studentDateStr}
        </div>
      </div>
    </div>
  );
}
