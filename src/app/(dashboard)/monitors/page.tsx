import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Globe, Search } from "lucide-react";
import MonitorCard from "@/components/MonitorCard";
import { subDays } from "date-fns";

export default async function MonitorsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const monitors = await prisma.monitor.findMany({
    where: { userId },
    include: {
      _count: { select: { checks: true } },
      checks: {
        where: { checkedAt: { gte: subDays(new Date(), 7) } },
        select: { status: true, responseTime: true, checkedAt: true },
        orderBy: { checkedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const monitorsWithStats = monitors.map((monitor) => {
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

    return {
      id: monitor.id,
      name: monitor.name,
      url: monitor.url,
      status: monitor.status,
      isActive: monitor.isActive,
      interval: monitor.interval,
      lastCheckedAt: monitor.lastCheckedAt?.toISOString() ?? null,
      _count: monitor._count,
      uptimePercent,
      avgResponseTime,
    };
  });

  const upCount = monitors.filter((m) => m.status === "up").length;
  const downCount = monitors.filter((m) => m.status === "down").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitory</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {monitors.length} monitorów ·{" "}
            <span className="text-emerald-400">{upCount} dostępnych</span>
            {downCount > 0 && (
              <>
                {" · "}
                <span className="text-red-400">{downCount} niedostępnych</span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/monitors/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Nowy monitor
        </Link>
      </div>

      {/* Empty state */}
      {monitors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-5">
            <Globe className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Brak monitorów</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Dodaj swój pierwszy monitor, aby zacząć śledzić dostępność stron internetowych.
          </p>
          <Link
            href="/monitors/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Dodaj pierwszy monitor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {monitorsWithStats.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}
    </div>
  );
}
