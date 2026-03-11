import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  const { id } = await params;

  const channel = await prisma.alertChannel.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!channel) {
    return NextResponse.json({ error: "Kanał nie znaleziony" }, { status: 404 });
  }

  await prisma.alertChannel.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  const { id } = await params;

  const channel = await prisma.alertChannel.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!channel) {
    return NextResponse.json({ error: "Kanał nie znaleziony" }, { status: 404 });
  }

  const body = await request.json();
  const updated = await prisma.alertChannel.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  return NextResponse.json(updated);
}
