"use client";

import Link from "next/link";
import { Globe, Clock, Activity, Trash2, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatResponseTime, formatDate } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MonitorCardProps {
  monitor: {
    id: string;
    name: string;
    url: string;
    status: string;
    isActive: boolean;
    interval: number;
    lastCheckedAt: string | null;
    _count?: { checks: number };
    uptimePercent?: number;
    avgResponseTime?: number | null;
  };
}

export default function MonitorCard({ monitor }: MonitorCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  async function handleDelete() {
    if (!confirm(`Czy na pewno chcesz usunąć monitor "${monitor.name}"?`)) return;
    setIsDeleting(true);
    await fetch(`/api/monitors/${monitor.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleToggle() {
    setIsToggling(true);
    await fetch(`/api/monitors/${monitor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !monitor.isActive }),
    });
    router.refresh();
    setIsToggling(false);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 bg-slate-800 rounded-lg flex-shrink-0 mt-0.5">
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/monitors/${monitor.id}`}
              className="text-base font-semibold text-white hover:text-blue-400 transition-colors truncate block"
            >
              {monitor.name}
            </Link>
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors truncate mt-0.5"
            >
              <span className="truncate">{monitor.url}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>
        <StatusBadge status={monitor.status} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">Uptime</p>
          <p className="text-sm font-bold text-white">
            {monitor.uptimePercent !== undefined ? `${monitor.uptimePercent}%` : "—"}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">Czas odp.</p>
          <p className="text-sm font-bold text-white">
            {formatResponseTime(monitor.avgResponseTime)}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 mb-0.5">Interwał</p>
          <p className="text-sm font-bold text-white">{monitor.interval} min</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Clock className="w-3 h-3" />
          <span>
            {monitor.lastCheckedAt
              ? `Sprawdzono: ${formatDate(monitor.lastCheckedAt)}`
              : "Nie sprawdzono"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            title={monitor.isActive ? "Zatrzymaj monitor" : "Uruchom monitor"}
            className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800"
          >
            {monitor.isActive ? (
              <ToggleRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-500" />
            )}
          </button>
          <Link
            href={`/monitors/${monitor.id}`}
            className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800"
            title="Szczegóły"
          >
            <Activity className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Usuń monitor"
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
