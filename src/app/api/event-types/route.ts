import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/event-types — get all event types for logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(eventTypes);
}

// POST /api/event-types — create new event type
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, description, duration, color, location, bufferTime } = body;

  if (!title || !slug || !duration) {
    return NextResponse.json({ error: "title, slug, and duration are required" }, { status: 400 });
  }

  // Check uniqueness
  const existing = await prisma.eventType.findUnique({
    where: { userId_slug: { userId: session.user.id, slug } },
  });
  if (existing) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const eventType = await prisma.eventType.create({
    data: {
      userId: session.user.id,
      title,
      slug,
      description,
      duration: Number(duration),
      color: color || "#6366f1",
      location,
      bufferTime: Number(bufferTime ?? 0),
    },
  });

  return NextResponse.json(eventType, { status: 201 });
}
