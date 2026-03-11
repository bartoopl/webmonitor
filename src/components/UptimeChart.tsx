"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface CheckData {
  checkedAt: string | Date;
  status: string;
  responseTime: number | null;
}

interface UptimeChartProps {
  checks: CheckData[];
  title?: string;
}

interface TooltipPayload {
  value: number;
  payload: {
    status: string;
    fullDate: string;
  };
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{data.payload.fullDate}</p>
        <p className="text-white font-medium">
          Czas odpowiedzi: <span className="text-blue-400">{data.value} ms</span>
        </p>
        <p className="text-white font-medium">
          Status:{" "}
          <span className={data.payload.status === "up" ? "text-emerald-400" : "text-red-400"}>
            {data.payload.status === "up" ? "Dostępna" : "Niedostępna"}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

export default function UptimeChart({ checks, title = "Czas odpowiedzi" }: UptimeChartProps) {
  const data = checks
    .slice()
    .reverse()
    .slice(-100)
    .map((check) => ({
      time: format(new Date(check.checkedAt), "HH:mm", { locale: pl }),
      fullDate: format(new Date(check.checkedAt), "dd MMM HH:mm", { locale: pl }),
      responseTime: check.responseTime || 0,
      status: check.status,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        Brak danych do wyświetlenia
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}ms`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="responseTime"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorResponse)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", stroke: "#1e293b", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
