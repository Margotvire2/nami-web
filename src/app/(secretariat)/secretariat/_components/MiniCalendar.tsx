"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  date: Date;
  onChange: (date: Date) => void;
}

// French weekday initials, Monday first
const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function MiniCalendar({ date, onChange }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(date));

  const cells = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const result: Date[] = [];
    let cur = gridStart;
    while (cur <= monthEnd || result.length % 7 !== 0) {
      result.push(cur);
      cur = addDays(cur, 1);
    }
    return result;
  }, [viewMonth]);

  function selectDay(day: Date) {
    onChange(day);
    if (!isSameMonth(day, viewMonth)) setViewMonth(startOfMonth(day));
  }

  return (
    <div className="px-3 pt-3 pb-2 select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="p-1 rounded-md hover:bg-[#F5F3EF] text-[#6B7280] transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={12} />
        </button>
        <p className="text-[11px] font-semibold text-[#1A1A2E] capitalize">
          {format(viewMonth, "MMMM yyyy", { locale: fr })}
        </p>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1 rounded-md hover:bg-[#F5F3EF] text-[#6B7280] transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d, i) => (
          <div key={i} className="flex items-center justify-center h-5">
            <span className="text-[9px] font-semibold text-[#9CA3AF] uppercase">{d}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const isSelected = isSameDay(day, date);
          const todayDay = isToday(day);
          const inMonth = isSameMonth(day, viewMonth);
          return (
            <button
              key={i}
              onClick={() => selectDay(day)}
              className={cn(
                "flex items-center justify-center w-7 h-7 mx-auto rounded-full text-[10px] font-medium transition-colors",
                isSelected
                  ? "bg-[#5B4EC4] text-white"
                  : todayDay
                  ? "text-[#5B4EC4] ring-1 ring-[#5B4EC4]/60"
                  : inMonth
                  ? "text-[#374151] hover:bg-[#F5F3EF]"
                  : "text-[#D1D5DB] hover:bg-[#F5F3EF]",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
