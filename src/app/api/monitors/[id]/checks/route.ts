import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
  const days = parseInt(searchParams.get("days") || "7");

  const monitor = await prisma.monitor.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!monitor) {
    return NextResponse.json({ error: "Monitor nie znaleziony" }, { status: 404 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const checks = await prisma.monitorCheck.findMany({
    where: {
      monitorId: id,
      checkedAt: { gte: cutoff },
    },
    orderBy: { checkedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(checks);
}
