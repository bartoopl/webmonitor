import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { checkMonitor } from "@/lib/monitor";

let isRunning = false;

export function startCronJobs(): void {
  if (isRunning) {
    console.log("[Cron] Jobs already running");
    return;
  }

  isRunning = true;
  console.log("[Cron] Starting monitoring cron jobs...");

  // Run every minute and check monitors based on their interval
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const monitors = await prisma.monitor.findMany({
        where: { isActive: true },
      });

      for (const monitor of monitors) {
        const shouldCheck =
          !monitor.lastCheckedAt ||
          now.getTime() - monitor.lastCheckedAt.getTime() >= monitor.interval * 60 * 1000;

        if (shouldCheck) {
          checkMonitor(monitor.id).catch((err) =>
            console.error(`[Cron] Error checking monitor ${monitor.id}:`, err)
          );
        }
      }
    } catch (error) {
      console.error("[Cron] Error in scheduled job:", error);
    }
  });

  console.log("[Cron] Monitoring jobs scheduled successfully");
}
