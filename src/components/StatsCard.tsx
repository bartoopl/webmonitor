import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accent?: "blue" | "green" | "red" | "yellow" | "purple";
}

const accentConfig = {
  blue: {
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    border: "border-blue-500/20",
  },
  green: {
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  red: {
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    border: "border-red-500/20",
  },
  yellow: {
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    border: "border-amber-500/20",
  },
  purple: {
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    border: "border-violet-500/20",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "blue",
}: StatsCardProps) {
  const colors = accentConfig[accent];

  return (
    <div className={cn("bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-all")}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", colors.iconBg)}>
          <Icon className={cn("w-5 h-5", colors.iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.positive
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <p className="text-sm font-medium text-slate-400 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
