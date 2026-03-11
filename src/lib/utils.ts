import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatResponseTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(start: Date | string, end?: Date | string | null): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}g ${minutes % 60}m`;
  if (hours > 0) return `${hours}g ${minutes % 60}m`;
  return `${minutes}m`;
}

export function calculateUptime(checks: { status: string }[]): number {
  if (checks.length === 0) return 100;
  const upChecks = checks.filter((c) => c.status === "up").length;
  return Math.round((upChecks / checks.length) * 10000) / 100;
}
