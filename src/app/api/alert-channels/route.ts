import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createChannelSchema = z.object({
  type: z.enum(["email", "sms"]),
  value: z.string().min(1, "Wartość jest wymagana"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  const channels = await prisma.alertChannel.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(channels);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createChannelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type, value } = parsed.data;

    // Check for duplicate
    const existing = await prisma.alertChannel.findFirst({
      where: { userId: session.user.id, type, value },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ten kanał alertów już istnieje." },
        { status: 409 }
      );
    }

    const channel = await prisma.alertChannel.create({
      data: {
        userId: session.user.id,
        type,
        value,
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("[AlertChannels POST] Error:", error);
    return NextResponse.json({ error: "Wewnętrzny błąd serwera." }, { status: 500 });
  }
}
