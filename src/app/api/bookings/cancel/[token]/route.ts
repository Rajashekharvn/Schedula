import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar";
import { sendCancellationEmail } from "@/lib/email";

// POST /api/bookings/cancel/[token]
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: { eventType: true, host: true },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "Already cancelled" }, { status: 409 });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  // Delete from Google Calendar
  if (booking.googleEventId) {
    deleteGoogleCalendarEvent(booking.hostId, booking.googleEventId);
  }

  // Send cancellation email
  sendCancellationEmail({
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    hostName: booking.host.name || "Your host",
    eventTitle: booking.eventType.title,
    startTime: booking.startTime,
    timezone: booking.guestTimezone,
  });

  return NextResponse.json({ success: true });
}
