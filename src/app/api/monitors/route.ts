import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { subDays } from "date-fns";

const createMonitorSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(100),
  url: z.string().url("Nieprawidłowy adres URL"),
  interval: z.number().int().min(1).max(1440).optional().default(5),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  const monitors = await prisma.monitor.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { checks: true, incidents: true } },
      checks: {
        where: { checkedAt: { gte: subDays(new Date(), 7) } },
        select: { status: true, responseTime: true },
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

    const { checks, ...rest } = monitor;
    return { ...rest, uptimePercent, avgResponseTime };
  });

  return NextResponse.json(monitorsWithStats);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createMonitorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, url, interval } = parsed.data;

    const monitor = await prisma.monitor.create({
      data: {
        userId: session.user.id,
        name,
        url,
        interval,
      },
    });

    return NextResponse.json(monitor, { status: 201 });
  } catch (error) {
    console.error("[Monitors POST] Error:", error);
    return NextResponse.json({ error: "Wewnętrzny błąd serwera." }, { status: 500 });
  }
}
