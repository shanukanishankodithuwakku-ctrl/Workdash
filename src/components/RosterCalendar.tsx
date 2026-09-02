import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Shift, JobConfig } from "../types";

interface CalendarProps {
  currentCalendarDate: Date;
  calendarDays: Array<{ dateString: string; dayNumber: number; isCurrentMonth: boolean }>;
  shiftsByDate: Record<string, Shift[]>;
  getJobColor: (jobName: string) => string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onReset: () => void;
  onCellClick: (dateString: string) => void;
  onBadgeClick: (shift: Shift) => void;
}

export const RosterCalendar: React.FC<CalendarProps> = ({
  currentCalendarDate,
  calendarDays,
  shiftsByDate,
  getJobColor,
  onPrevMonth,
  onNextMonth,
  onReset,
  onCellClick,
  onBadgeClick,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
      
      {/* Calendar Header */}
      <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-400" />
          <h4 className="font-bold text-sm text-slate-100 font-sans uppercase tracking-tight">
            {currentCalendarDate.toLocaleString("default", { month: "long" })} {currentCalendarDate.getFullYear()}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-300 transition uppercase font-mono"
          >
            Reset (June '26)
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday titles */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-[10px] font-bold uppercase text-slate-500 font-mono py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const dayShifts = shiftsByDate[day.dateString] || [];
          return (
            <div
              key={idx}
              onClick={() => onCellClick(day.dateString)}
              className={`min-h-[110px] p-2 rounded-xl flex flex-col justify-between transition border cursor-pointer relative ${
                day.isCurrentMonth
                  ? "bg-slate-950/40 hover:bg-slate-950/80 border-slate-800/80"
                  : "bg-slate-950/10 border-slate-900 opacity-40 text-slate-600"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  {day.dayNumber}
                </span>
                {dayShifts.length > 0 && day.isCurrentMonth && (
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    ${dayShifts.reduce((acc, s) => acc + (s.earnings || 0), 0).toFixed(0)}
                  </span>
                )}
              </div>

              {/* Shifts list inside cell */}
              <div className="space-y-1.5 mt-2 flex-grow overflow-y-auto max-h-[70px]">
                {dayShifts.map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBadgeClick(s);
                    }}
                    className="text-[10px] p-1.5 rounded-lg border text-left flex flex-col justify-between hover:scale-[1.03] transition pointer-events-auto"
                    style={{
                      backgroundColor: `${getJobColor(s.job)}10`,
                      borderColor: `${getJobColor(s.job)}35`,
                    }}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span style={{ color: getJobColor(s.job) }}>{s.job}</span>
                      <span className="text-slate-300 font-mono text-[9px]">{s.hours}h</span>
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono truncate">{s.start} - {s.end}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500 italic text-center font-mono">
        💡 Click on any empty space inside a day cell to instantly schedule a shift on that date. Click on any shift badge to edit/delete it.
      </p>
    </div>
  );
};
