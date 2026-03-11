import { NextRequest, NextResponse } from "next/server";
import { checkAllMonitors, checkMonitor } from "@/lib/monitor";

// This endpoint can be called by cron or externally
export async function POST(request: NextRequest) {
  // Optional secret for external cron services
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const monitorId = body?.monitorId;

    if (monitorId) {
      await checkMonitor(monitorId);
      return NextResponse.json({ success: true, checked: 1 });
    }

    await checkAllMonitors();
    return NextResponse.json({ success: true, message: "All monitors checked" });
  } catch (error) {
    console.error("[Check API] Error:", error);
    return NextResponse.json({ error: "Błąd sprawdzania monitorów" }, { status: 500 });
  }
}
