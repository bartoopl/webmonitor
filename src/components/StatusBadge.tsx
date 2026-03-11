import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "up" | "down" | "unknown" | string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

const statusConfig = {
  up: {
    label: "Dostępna",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dotClasses: "bg-emerald-400",
    pulse: true,
  },
  down: {
    label: "Niedostępna",
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
    dotClasses: "bg-red-400",
    pulse: false,
  },
  unknown: {
    label: "Nieznany",
    classes: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    dotClasses: "bg-slate-400",
    pulse: false,
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export default function StatusBadge({ status, size = "md", showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.classes,
        sizeClasses[size]
      )}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          {config.pulse && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.dotClasses)} />
          )}
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", config.dotClasses)} />
        </span>
      )}
      {config.label}
    </span>
  );
}
