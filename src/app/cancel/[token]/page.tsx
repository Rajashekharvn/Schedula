import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { XCircle, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cancel Booking" };

interface Props { params: Promise<{ token: string }> }

export default async function CancelPage({ params }: Props) {
  const { token } = await params;

  const booking = await prisma.booking.findFirst({
    where: { cancelToken: token },
    include: { eventType: { include: { user: true } } },
  });

  if (!booking) return notFound();

  const alreadyCancelled = booking.status === "CANCELLED";

  if (!alreadyCancelled) {
    // Cancel the booking server-side on page load
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    // Delete from Google Calendar if synced
    if (booking.googleEventId) {
      try {
        const { deleteGoogleCalendarEvent } = await import("@/lib/google-calendar");
        await deleteGoogleCalendarEvent(booking.hostId, booking.googleEventId);
      } catch { /* non-blocking */ }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-red-600/10 rounded-full blur-[120px]" />
      </div>
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
          {alreadyCancelled
            ? <CheckCircle className="w-10 h-10 text-slate-400" />
            : <XCircle className="w-10 h-10 text-red-400" />}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {alreadyCancelled ? "Already Cancelled" : "Booking Cancelled"}
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          {alreadyCancelled
            ? "This booking was already cancelled."
            : `Your booking for "${booking.eventType.title}" with ${booking.eventType.user.name} has been cancelled.`}
        </p>

        <div className="glass rounded-2xl border border-white/8 p-5 text-left mb-6">
          <p className="text-sm text-slate-500 mb-2">Cancelled booking</p>
          <p className="font-semibold">{booking.eventType.title}</p>
          <p className="text-sm text-slate-400 mt-1">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit",
              timeZone: booking.guestTimezone,
            }).format(booking.startTime)}
          </p>
        </div>

        <Link
          href={`/${booking.eventType.user.username}`}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          Book a new time
        </Link>
        <p className="mt-8 text-xs text-slate-700">Powered by <Link href="/" className="text-indigo-600 hover:text-indigo-500">Schedula</Link></p>
      </div>
    </div>
  );
}
