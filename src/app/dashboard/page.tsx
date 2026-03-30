import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, ExternalLink, TrendingUp } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [eventTypes, upcomingBookings, allBookings, user] = await Promise.all([
    prisma.eventType.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 5 }),
    prisma.booking.findMany({
      where: { hostId: userId, status: "CONFIRMED", startTime: { gte: new Date() } },
      include: { eventType: true },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    prisma.booking.count({ where: { hostId: userId, status: "CONFIRMED" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } }),
  ]);

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${user?.username}`;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-slate-400 text-sm">Here&apos;s what&apos;s happening with your schedule.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: allBookings, icon: Calendar, color: "indigo" },
          { label: "Event Types", value: eventTypes.length, icon: Clock, color: "purple" },
          { label: "Upcoming", value: upcomingBookings.length, icon: TrendingUp, color: "emerald" },
          { label: "This Week", value: upcomingBookings.filter((b: { startTime: Date }) => {
            const d = new Date(b.startTime);
            const now = new Date();
            const end = new Date(now); end.setDate(now.getDate() + 7);
            return d >= now && d <= end;
          }).length, icon: Calendar, color: "sky" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 border border-white/8">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking link card */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-indigo-400" /> Your booking page
          </h2>
          {user?.username ? (
            <>
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 font-mono break-all mb-4">
                {profileUrl}
              </div>
              <CopyButton text={profileUrl} />
            </>
          ) : (
            <div className="text-sm text-slate-500">
              <Link href="/dashboard/settings" className="text-indigo-400">Set a username</Link> to get your booking link.
            </div>
          )}
        </div>

        {/* Upcoming bookings */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming bookings</h2>
            <Link href="/dashboard/bookings" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming bookings</p>
              <p className="text-slate-600 text-xs mt-1">Share your booking link to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-4 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {booking.guestName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{booking.guestName}</p>
                    <p className="text-xs text-slate-500">{booking.eventType.title}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-medium text-slate-300">
                      {new Date(booking.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p>{new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event types preview */}
      {eventTypes.length > 0 && (
        <div className="mt-6 glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Event types</h2>
            <Link href="/dashboard/event-types" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventTypes.map((et) => (
              <div key={et.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                <div className="w-3 h-8 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{et.title}</p>
                  <p className="text-xs text-slate-500">{formatDuration(et.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
