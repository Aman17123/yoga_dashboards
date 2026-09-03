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
      <div className="flex flex-col items-center text-center w-[40%]">
        <div className="text-[11.5px] font-bold uppercase tracking-wider text-[#F2994A] mb-2">
          Instructor · IST
        </div>
        <AnalogClock tz="Asia/Kolkata" currentTime={currentTime} />
        <div className="font-mono font-semibold text-base text-[#171A32]">
          {digital12(istWall.h, istWall.m)}
        </div>
        <div className="text-xs text-[#6B7089] mt-0.5">
          {istDateStr}
        </div>
      </div>

      {/* Middle Connector */}
      <div className="flex flex-col items-center justify-center gap-1.5 w-[20%] text-[#A3A8C3]">
        <div className="w-5 h-5 sm:w-6 sm:h-6 text-[#A3A8C3]">
          <ArrowRightIcon className="w-full h-full" />
        </div>
        <div className="text-[11.5px] text-[#6B7089] text-center font-semibold leading-tight">
          {offset}
        </div>
      </div>

      {/* Student Side */}
      <div className="flex flex-col items-center text-center w-[40%]">
        <div className="text-[11.5px] font-bold uppercase tracking-wider text-[#4C5FD5] mb-2">
          {studentFirstName} · {student.country}
        </div>
        <AnalogClock tz={student.timezone || "Asia/Kolkata"} currentTime={currentTime} />
        <div className="font-mono font-semibold text-base text-[#171A32]">
          {digital12(studentWall.h, studentWall.m)}
        </div>
        <div className="text-xs text-[#6B7089] mt-0.5">
          {studentDateStr}
        </div>
      </div>
    </div>
  );
}
