import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/scheduling";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { sendBookingConfirmationEmail } from "@/lib/email";

// POST /api/bookings — create a new booking (public endpoint)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventTypeId, guestName, guestEmail, guestTimezone, startTime, endTime, notes } = body;

  if (!eventTypeId || !guestName || !guestEmail || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Get event type + host
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: true },
  });
  if (!eventType || !eventType.isActive) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  // Race condition guard
  const available = await isSlotAvailable(eventType.userId, start, end);
  if (!available) {
    return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      eventTypeId,
      hostId: eventType.userId,
      guestName,
      guestEmail,
      guestTimezone: guestTimezone || "UTC",
      startTime: start,
      endTime: end,
      notes,
      status: "CONFIRMED",
    },
  });

  // Sync to Google Calendar (non-blocking)
  createGoogleCalendarEvent(eventType.userId, {
    title: `${eventType.title} with ${guestName}`,
    description: notes,
    startTime: start,
    endTime: end,
    guestEmail,
    guestName,
    location: eventType.location ?? undefined,
  }).then(async (googleEventId) => {
    if (googleEventId) {
      await prisma.booking.update({ where: { id: booking.id }, data: { googleEventId } });
    }
  });

  // Send confirmation email (non-blocking)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  sendBookingConfirmationEmail({
    guestName,
    guestEmail,
    hostName: eventType.user.name || "Your host",
    eventTitle: eventType.title,
    startTime: start,
    timezone: guestTimezone || "UTC",
    cancelLink: `${appUrl}/booking/cancel/${booking.cancelToken}`,
    rescheduleLink: `${appUrl}/booking/reschedule/${booking.rescheduleToken}`,
  });

  return NextResponse.json({
    id: booking.id,
    cancelToken: booking.cancelToken,
    rescheduleToken: booking.rescheduleToken,
  }, { status: 201 });
}

// GET /api/bookings — dashboard bookings for logged-in user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "upcoming"; // upcoming | past

  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      hostId: session.user.id,
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: filter === "upcoming" ? { gte: now } : { lt: now },
    },
    include: { eventType: true },
    orderBy: { startTime: filter === "upcoming" ? "asc" : "desc" },
    take: 50,
  });

  return NextResponse.json(bookings);
}
