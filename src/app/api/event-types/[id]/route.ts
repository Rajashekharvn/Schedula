import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/event-types/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType || eventType.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.eventType.update({
    where: { id },
    data: {
      title: body.title ?? eventType.title,
      description: body.description ?? eventType.description,
      duration: body.duration ? Number(body.duration) : eventType.duration,
      color: body.color ?? eventType.color,
      location: body.location ?? eventType.location,
      bufferTime: body.bufferTime !== undefined ? Number(body.bufferTime) : eventType.bufferTime,
      isActive: body.isActive !== undefined ? body.isActive : eventType.isActive,
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/event-types/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType || eventType.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.eventType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
