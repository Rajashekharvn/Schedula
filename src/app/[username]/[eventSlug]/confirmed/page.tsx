import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, Mail, MapPin } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Confirmed!" };

interface Props { params: Promise<{ username: string; eventSlug: string }>; searchParams: Promise<{ bookingId?: string }> }

export default async function ConfirmedPage({ params, searchParams }: Props) {
  const { username } = await params;
  const { bookingId } = await searchParams;

  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { eventType: { include: { user: true } } },
      })
    : null;

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-slate-400 text-sm">Check your email for details.</p>
          <Link href={`/${username}`} className="inline-block mt-6 text-indigo-400 hover:text-indigo-300 text-sm">← Book another meeting</Link>
        </div>
      </div>
    );
  }

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
    timeZone: booking.guestTimezone,
  }).format(booking.startTime);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">You&apos;re booked!</h1>
        <p className="text-slate-400 text-sm mb-8">A confirmation has been sent to your email.</p>

        <div className="glass rounded-2xl border border-white/8 p-6 text-left space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {booking.eventType.user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Organizer</p>
              <p className="font-medium">{booking.eventType.user.name}</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Event</p>
                <p className="text-white">{booking.eventType.title}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs mb-0.5">When</p>
                <p className="text-white">{formattedTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Duration</p>
                <p className="text-white">{formatDuration(booking.eventType.duration)}</p>
              </div>
            </div>
            {booking.eventType.location && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Location</p>
                  <p className="text-white break-all">{booking.eventType.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Confirmation sent to</p>
                <p className="text-white">{booking.guestEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/${username}`}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-medium transition-all text-center">
            Book another
          </Link>
          <Link href={`/cancel/${booking.cancelToken}`}
            className="flex-1 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium transition-all text-center">
            Cancel booking
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-700">Powered by <Link href="/" className="text-indigo-600 hover:text-indigo-500">Schedula</Link></p>
      </div>
    </div>
  );
}
