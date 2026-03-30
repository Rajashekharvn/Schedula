import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/event-types/public?username=john&slug=coffee-chat
// Public endpoint — no auth required — used by the booking page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const slug = searchParams.get("slug");

  if (!username || !slug) {
    return NextResponse.json({ error: "username and slug required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, bio: true, image: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const eventType = await prisma.eventType.findUnique({
    where: { userId_slug: { userId: user.id, slug } },
    select: { id: true, title: true, slug: true, description: true, duration: true, color: true, location: true, isActive: true },
  });
  if (!eventType || !eventType.isActive) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  return NextResponse.json({ eventType, host: { name: user.name, bio: user.bio } });
}
