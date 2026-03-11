"use client";

import { eachDayOfInterval, subDays, format, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";

interface CheckData {
  checkedAt: string | Date;
  status: string;
}

interface UptimeBarProps {
  checks: CheckData[];
  days?: number;
}

export default function UptimeBar({ checks, days = 30 }: UptimeBarProps) {
  const today = new Date();
  const startDate = subDays(today, days - 1);

  const daysArray = eachDayOfInterval({ start: startDate, end: today });

  const dayStats = daysArray.map((day) => {
    const dayChecks = checks.filter((c) => isSameDay(new Date(c.checkedAt), day));

    if (dayChecks.length === 0) {
      return { day, status: "unknown" as const, uptime: null };
    }

    const upCount = dayChecks.filter((c) => c.status === "up").length;
    const uptime = (upCount / dayChecks.length) * 100;

    let status: "up" | "down" | "partial" | "unknown";
    if (uptime === 100) status = "up";
    else if (uptime === 0) status = "down";
    else status = "partial";

    return { day, status, uptime };
  });

  const overallUptime =
    checks.length > 0
      ? Math.round((checks.filter((c) => c.status === "up").length / checks.length) * 10000) / 100
      : 100;

  const statusColors = {
    up: "bg-emerald-500",
    down: "bg-red-500",
    partial: "bg-amber-500",
    unknown: "bg-slate-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">
          {format(startDate, "d MMM", { locale: pl })}
        </span>
        <span className="text-xs font-semibold text-emerald-400">{overallUptime}% uptime</span>
        <span className="text-xs text-slate-500">
          {format(today, "d MMM", { locale: pl })}
        </span>
      </div>

      <div className="flex gap-0.5 items-end h-8">
        {dayStats.map(({ day, status, uptime }) => (
          <div
            key={day.toISOString()}
            className="relative group flex-1"
            title={`${format(day, "dd.MM.yyyy", { locale: pl })}: ${
              uptime !== null ? `${uptime.toFixed(1)}%` : "Brak danych"
            }`}
          >
            <div
              className={`w-full h-8 rounded-sm ${statusColors[status]} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
              <p className="font-medium">{format(day, "dd MMM yyyy", { locale: pl })}</p>
              <p className={status === "up" ? "text-emerald-400" : status === "down" ? "text-red-400" : "text-amber-400"}>
                {uptime !== null ? `${uptime.toFixed(1)}% uptime` : "Brak danych"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-xs text-slate-500">Dostępna</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-xs text-slate-500">Częściowa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span className="text-xs text-slate-500">Niedostępna</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
          <span className="text-xs text-slate-500">Brak danych</span>
        </div>
      </div>
    </div>
  );
}
