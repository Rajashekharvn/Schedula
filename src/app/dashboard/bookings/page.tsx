"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  guestTimezone: string;
  eventType: { title: string; color: string; duration: number };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bookings?filter=${filter}`)
      .then(r => r.json())
      .then(data => { setBookings(data); setLoading(false); });
  }, [filter]);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Bookings</h1>
          <p className="text-slate-400 text-sm">View and manage your scheduled meetings</p>
        </div>
        <div className="flex gap-2 bg-white/5 rounded-xl p-1">
          {(["upcoming", "past"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/8">
          <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No {filter} bookings</h3>
          <p className="text-slate-500 text-sm">
            {filter === "upcoming" ? "Your next meetings will appear here" : "Completed meetings will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="glass rounded-2xl p-5 border border-white/8 hover:border-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-14 rounded-full shrink-0 mt-1" style={{ backgroundColor: booking.eventType.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold">{booking.eventType.title}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">with {booking.guestName} · {booking.guestEmail}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
                      booking.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400" :
                      booking.status === "CANCELLED" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {booking.status === "CONFIRMED" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {booking.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(booking.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – {new Date(booking.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span>{booking.guestTimezone.replace(/_/g, " ")}</span>
                  </div>
                  {booking.notes && (
                    <p className="text-xs text-slate-600 mt-2 bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                      &ldquo;{booking.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
