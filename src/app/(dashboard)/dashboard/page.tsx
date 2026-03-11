import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe, AlertTriangle, TrendingUp, Activity, Plus, ArrowRight, Clock } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import { subDays } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const monitors = await prisma.monitor.findMany({
    where: { userId },
    include: {
      checks: {
        where: { checkedAt: { gte: subDays(new Date(), 7) } },
        orderBy: { checkedAt: "desc" },
      },
      incidents: {
        where: { resolvedAt: null },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentIncidents = await prisma.incident.findMany({
    where: { monitor: { userId } },
    include: { monitor: true },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  const totalMonitors = monitors.length;
  const upMonitors = monitors.filter((m) => m.status === "up").length;
  const downMonitors = monitors.filter((m) => m.status === "down").length;
  const activeIncidents = monitors.reduce((acc, m) => acc + m.incidents.length, 0);

  const allChecks = monitors.flatMap((m) => m.checks);
  const overallUptime =
    allChecks.length > 0
      ? Math.round(
          (allChecks.filter((c) => c.status === "up").length / allChecks.length) * 10000
        ) / 100
      : 100;

  const monitorsWithStats = monitors.slice(0, 5).map((monitor) => {
    const upCount = monitor.checks.filter((c) => c.status === "up").length;
    const uptimePercent =
      monitor.checks.length > 0
        ? Math.round((upCount / monitor.checks.length) * 10000) / 100
        : 100;

    const responseTimes = monitor.checks
      .filter((c) => c.responseTime !== null)
      .map((c) => c.responseTime!);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null;

    return { ...monitor, uptimePercent, avgResponseTime };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pulpit</h1>
          <p className="text-slate-400 text-sm mt-0.5">Przegląd monitorowania Twoich stron</p>
        </div>
        <Link
          href="/monitors/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Nowy monitor
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Wszystkie monitory"
          value={totalMonitors}
          subtitle={`${upMonitors} aktywnych`}
          icon={Globe}
          accent="blue"
        />
        <StatsCard
          title="Średni uptime (7 dni)"
          value={`${overallUptime}%`}
          subtitle="Ostatnie 7 dni"
          icon={TrendingUp}
          accent={overallUptime >= 99 ? "green" : overallUptime >= 95 ? "yellow" : "red"}
        />
        <StatsCard
          title="Niedostępne"
          value={downMonitors}
          subtitle={downMonitors > 0 ? "Wymagają uwagi" : "Wszystko OK"}
          icon={AlertTriangle}
          accent={downMonitors > 0 ? "red" : "green"}
        />
        <StatsCard
          title="Aktywne incydenty"
          value={activeIncidents}
          subtitle={activeIncidents > 0 ? "W toku" : "Brak incydentów"}
          icon={Activity}
          accent={activeIncidents > 0 ? "yellow" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monitors list */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Monitory</h2>
            <Link
              href="/monitors"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Wszystkie
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {monitors.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 rounded-full mb-4">
                <Globe className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-white font-medium mb-2">Brak monitorów</h3>
              <p className="text-slate-500 text-sm mb-4">
                Dodaj pierwszy monitor, aby zacząć monitorować swoje strony.
              </p>
              <Link
                href="/monitors/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Dodaj monitor
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Witryna
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Uptime 7d
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Czas odp.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {monitorsWithStats.map((monitor) => (
                    <tr key={monitor.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/monitors/${monitor.id}`} className="group">
                          <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                            {monitor.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {monitor.url}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <StatusBadge status={monitor.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={`text-sm font-semibold ${
                            monitor.uptimePercent >= 99
                              ? "text-emerald-400"
                              : monitor.uptimePercent >= 95
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {monitor.uptimePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-300">
                          {monitor.avgResponseTime ? `${monitor.avgResponseTime} ms` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {monitors.length > 5 && (
                <div className="px-4 py-3 border-t border-slate-800 text-center">
                  <Link
                    href="/monitors"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Zobacz wszystkie {monitors.length} monitory →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent incidents */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Ostatnie incydenty</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {recentIncidents.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-full mb-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-white font-medium text-sm">Brak incydentów</p>
                <p className="text-slate-500 text-xs mt-1">Wszystkie strony działają prawidłowo</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/monitors/${incident.monitorId}`}
                          className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate block"
                        >
                          {incident.monitor.name}
                        </Link>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">
                            {formatDate(incident.startedAt)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                          incident.resolvedAt
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {incident.resolvedAt ? "Rozwiązany" : "W toku"}
                      </span>
                    </div>
                    {incident.resolvedAt && (
                      <p className="text-xs text-slate-600 mt-1.5">
                        Trwał: {formatDuration(incident.startedAt, incident.resolvedAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
