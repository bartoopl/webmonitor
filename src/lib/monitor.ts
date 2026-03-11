import { prisma } from "@/lib/prisma";
import { sendAlert } from "@/lib/alerts";

interface CheckResult {
  status: "up" | "down";
  responseTime: number | null;
  statusCode: number | null;
  error: string | null;
}

async function checkUrl(url: string): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "WebMonitor/1.0",
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const statusCode = response.status;
    const isUp = statusCode >= 200 && statusCode < 400;

    return {
      status: isUp ? "up" : "down",
      responseTime,
      statusCode,
      error: isUp ? null : `HTTP ${statusCode}`,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Request timeout (10s)";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      status: "down",
      responseTime: responseTime < 10000 ? responseTime : null,
      statusCode: null,
      error: errorMessage,
    };
  }
}

export async function checkMonitor(monitorId: string): Promise<void> {
  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    include: {
      user: {
        include: {
          alertChannels: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!monitor || !monitor.isActive) return;

  const result = await checkUrl(monitor.url);
  const previousStatus = monitor.status;
  const newStatus = result.status;

  // Save check result
  await prisma.monitorCheck.create({
    data: {
      monitorId: monitor.id,
      status: newStatus,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      error: result.error,
    },
  });

  // Update monitor status
  await prisma.monitor.update({
    where: { id: monitor.id },
    data: {
      status: newStatus,
      lastCheckedAt: new Date(),
    },
  });

  // Handle status changes
  if (previousStatus !== "unknown") {
    if (previousStatus === "up" && newStatus === "down") {
      // Monitor went down - create incident
      await prisma.incident.create({
        data: {
          monitorId: monitor.id,
        },
      });

      // Send alerts
      for (const channel of monitor.user.alertChannels) {
        if (channel.type === "email") {
          await sendAlert({
            to: channel.value,
            monitorName: monitor.name,
            monitorUrl: monitor.url,
            status: "down",
            statusCode: result.statusCode,
            error: result.error,
          });
        }
      }
    } else if (previousStatus === "down" && newStatus === "up") {
      // Monitor recovered - resolve open incident
      const openIncident = await prisma.incident.findFirst({
        where: {
          monitorId: monitor.id,
          resolvedAt: null,
        },
        orderBy: { startedAt: "desc" },
      });

      if (openIncident) {
        await prisma.incident.update({
          where: { id: openIncident.id },
          data: { resolvedAt: new Date() },
        });
      }

      // Send recovery alerts
      for (const channel of monitor.user.alertChannels) {
        if (channel.type === "email") {
          await sendAlert({
            to: channel.value,
            monitorName: monitor.name,
            monitorUrl: monitor.url,
            status: "up",
            responseTime: result.responseTime,
          });
        }
      }
    }
  }

  console.log(
    `[Monitor] Checked ${monitor.name} (${monitor.url}): ${newStatus} ${result.responseTime ? `in ${result.responseTime}ms` : ""}`
  );
}

export async function checkAllMonitors(): Promise<void> {
  const monitors = await prisma.monitor.findMany({
    where: { isActive: true },
  });

  console.log(`[Monitor] Checking ${monitors.length} active monitors...`);

  await Promise.allSettled(monitors.map((monitor) => checkMonitor(monitor.id)));
}
