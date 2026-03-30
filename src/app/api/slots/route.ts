import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/scheduling";

// GET /api/slots?username=john&slug=coffee-chat&date=2024-12-01&timezone=Asia/Kolkata
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const slug = searchParams.get("slug");
  const dateStr = searchParams.get("date");
  const timezone = searchParams.get("timezone") || "UTC";

  if (!username || !slug || !dateStr) {
    return NextResponse.json({ error: "username, slug, and date are required" }, { status: 400 });
  }

  // Find host
  const host = await prisma.user.findUnique({ where: { username } });
  if (!host) return NextResponse.json({ error: "Host not found" }, { status: 404 });

  // Find event type
  const eventType = await prisma.eventType.findUnique({
    where: { userId_slug: { userId: host.id, slug } },
  });
  if (!eventType || !eventType.isActive) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  const date = new Date(dateStr + "T00:00:00Z");
  const slots = await getAvailableSlots(host.id, eventType.id, date, timezone);

  return NextResponse.json({ slots });
}
