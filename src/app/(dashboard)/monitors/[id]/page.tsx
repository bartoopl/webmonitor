import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import UptimeChart from "@/components/UptimeChart";
import UptimeBar from "@/components/UptimeBar";
import { formatDate, formatDuration, calculateUptime } from "@/lib/utils";
import { subDays } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MonitorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id as string;

  const monitor = await prisma.monitor.findFirst({
    where: { id, userId },
    include: {
      checks: {
        where: { checkedAt: { gte: subDays(new Date(), 7) } },
        orderBy: { checkedAt: "desc" },
        take: 500,
      },
      incidents: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!monitor) notFound();

  const checks30d = await prisma.monitorCheck.findMany({
    where: {
      monitorId: monitor.id,
      checkedAt: { gte: subDays(new Date(), 30) },
    },
    orderBy: { checkedAt: "desc" },
    select: { status: true, checkedAt: true, responseTime: true },
  });

  const uptime7d = calculateUptime(monitor.checks);
  const uptime30d = calculateUptime(checks30d);

  const responseTimes = monitor.checks
    .filter((c) => c.responseTime !== null)
    .map((c) => c.responseTime!);

  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : null;

  const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : null;
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : null;

  const totalChecks = await prisma.monitorCheck.count({
    where: { monitorId: monitor.id },
  });

  const checksForChart = monitor.checks.map((c) => ({
    checkedAt: c.checkedAt.toISOString(),
    status: c.status,
    responseTime: c.responseTime,
  }));

  const checksForBar = checks30d.map((c) => ({
    checkedAt: c.checkedAt.toISOString(),
    status: c.status,
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <Link
          href="/monitors"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do monitorów
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-xl flex-shrink-0">
              <Globe className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{monitor.name}</h1>
                <StatusBadge status={monitor.status} size="lg" />
              </div>
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-1"
              >
                {monitor.url}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {monitor.lastCheckedAt
                ? `Ostatnie sprawdzenie: ${formatDate(monitor.lastCheckedAt)}`
                : "Nie sprawdzono jeszcze"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Uptime (7 dni)</p>
          <p
            className={`text-2xl font-bold ${
              uptime7d >= 99 ? "text-emerald-400" : uptime7d >= 95 ? "text-amber-400" : "text-red-400"
            }`}
          >
            {uptime7d}%
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Uptime (30 dni)</p>
          <p
            className={`text-2xl font-bold ${
              uptime30d >= 99 ? "text-emerald-400" : uptime30d >= 95 ? "text-amber-400" : "text-red-400"
            }`}
          >
            {uptime30d}%
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Śr. czas odpowiedzi</p>
          <p className="text-2xl font-bold text-white">
            {avgResponseTime ? `${avgResponseTime} ms` : "—"}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Wszystkie sprawdzenia</p>
          <p className="text-2xl font-bold text-white">{totalChecks.toLocaleString("pl-PL")}</p>
        </div>
      </div>

      {/* Response time details */}
      {responseTimes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Min. czas odp.</p>
            <p className="text-lg font-bold text-emerald-400">{minResponseTime} ms</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Śr. czas odp.</p>
            <p className="text-lg font-bold text-blue-400">{avgResponseTime} ms</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Max. czas odp.</p>
            <p className="text-lg font-bold text-amber-400">{maxResponseTime} ms</p>
          </div>
        </div>
      )}

      {/* Uptime bar (30 days) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white">Dostępność - ostatnie 30 dni</h2>
        </div>
        <UptimeBar checks={checksForBar} days={30} />
      </div>

      {/* Response time chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white">Czas odpowiedzi - ostatnie 7 dni</h2>
        </div>
        <UptimeChart checks={checksForChart} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Incidents */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Historia incydentów</h2>
          </div>

          {monitor.incidents.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-full mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white text-sm font-medium">Brak incydentów</p>
              <p className="text-slate-500 text-xs mt-1">Witryna działa bez przerw</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monitor.incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg"
                >
                  {incident.resolvedAt ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          incident.resolvedAt ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {incident.resolvedAt ? "Rozwiązany" : "W toku"}
                      </span>
                      {incident.resolvedAt && (
                        <span className="text-xs text-slate-500">
                          Trwał: {formatDuration(incident.startedAt, incident.resolvedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rozpoczął się: {formatDate(incident.startedAt)}
                    </p>
                    {incident.resolvedAt && (
                      <p className="text-xs text-slate-600">
                        Rozwiązany: {formatDate(incident.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent checks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-white">Ostatnie sprawdzenia</h2>
          </div>

          {monitor.checks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">Brak sprawdzeń</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {monitor.checks.slice(0, 20).map((check) => (
                <div
                  key={check.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {check.status === "up" ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-slate-400">{formatDate(check.checkedAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {check.statusCode && (
                      <span className="text-xs text-slate-500">HTTP {check.statusCode}</span>
                    )}
                    {check.responseTime && (
                      <span className="text-xs text-blue-400 font-medium">{check.responseTime} ms</span>
                    )}
                    {check.error && (
                      <span className="text-xs text-red-400 truncate max-w-[120px]" title={check.error}>
                        {check.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monitor details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Ustawienia monitora</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">Interwał sprawdzania</p>
            <p className="text-white font-medium">Co {monitor.interval} {monitor.interval === 1 ? "minutę" : "minut"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Status</p>
            <p className={`font-medium ${monitor.isActive ? "text-emerald-400" : "text-slate-400"}`}>
              {monitor.isActive ? "Aktywny" : "Wstrzymany"}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Dodany</p>
            <p className="text-white font-medium">{formatDate(monitor.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">ID monitora</p>
            <p className="text-slate-400 font-mono text-xs truncate">{monitor.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
