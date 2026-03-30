"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, MapPin, Globe, ChevronLeft, ChevronRight, Loader2, Sparkles, Calendar } from "lucide-react";
import { COMMON_TIMEZONES, formatDuration } from "@/lib/utils";

interface Slot { start: string; end: string; display: string; }
interface EventType { id: string; title: string; slug: string; duration: number; color: string; description: string | null; location: string | null; }
interface HostInfo { name: string; bio: string | null; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.eventSlug as string;

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [host, setHost] = useState<HostInfo | null>(null);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<"calendar" | "form">("calendar");
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // AI assistant
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    // Fetch event type info
    fetch(`/api/event-types/public?username=${username}&slug=${slug}`)
      .then(r => r.json())
      .then(d => { setEventType(d.eventType); setHost(d.host); });
  }, [username, slug]);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true); setSlots([]);
    const dateStr = date.toISOString().split("T")[0];
    const res = await fetch(`/api/slots?username=${username}&slug=${slug}&date=${dateStr}&timezone=${encodeURIComponent(timezone)}`);
    const data = await res.json();
    setSlots(data.slots || []);
    setLoadingSlots(false);
  }, [username, slug, timezone]);

  function selectDate(date: Date) {
    setSelectedDate(date); setSelectedSlot(null);
    fetchSlots(date);
  }

  async function handleAiSuggest() {
    if (!aiInput.trim()) return;
    setAiLoading(true); setAiMessage("");
    const res = await fetch("/api/ai/suggest", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: aiInput, timezone }),
    });
    const data = await res.json();
    if (data.date) {
      const d = new Date(data.date + "T00:00:00");
      setViewDate(d); selectDate(d);
      setAiMessage(data.explanation);
    } else {
      setAiMessage(data.explanation || "Could not understand that date.");
    }
    setAiLoading(false);
  }

  async function handleBook() {
    if (!selectedSlot || !eventType) return;
    setBooking(true); setError("");
    const res = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: eventType.id,
        guestName: form.name,
        guestEmail: form.email,
        guestTimezone: timezone,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        notes: form.notes,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Booking failed"); setBooking(false); return; }
    router.push(`/${username}/${slug}/confirmed?bookingId=${data.id}`);
  }

  // Calendar generation
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }

  if (!eventType || !host) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <Link href={`/${username}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="glass rounded-3xl border border-white/8 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left panel — event info */}
            <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-white/5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold mb-4">
                {host.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-sm text-slate-500 mb-1">{host.name}</p>
              <h1 className="text-xl font-bold mb-4" style={{ color: eventType.color }}>{eventType.title}</h1>

              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" />{formatDuration(eventType.duration)}</div>
                {eventType.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400" />{eventType.location}</div>}
                {eventType.description && <p className="text-slate-500 text-sm pt-2 border-t border-white/5">{eventType.description}</p>}
              </div>

              {/* Timezone */}
              <div className="mt-6">
                <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5"><Globe className="w-3.5 h-3.5" />Time zone</label>
                <select id="timezone-select" value={timezone} onChange={e => { setTimezone(e.target.value); if (selectedDate) fetchSlots(selectedDate); }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all">
                  {COMMON_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g," ")}</option>)}
                </select>
              </div>

              {/* AI Assistant */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium"><Sparkles className="w-3.5 h-3.5 text-indigo-400" />AI scheduling assistant</label>
                <div className="flex gap-2">
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAiSuggest()}
                    placeholder='Try "next Monday" or "this Friday"'
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
                  <button onClick={handleAiSuggest} disabled={aiLoading}
                    className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-xl text-xs transition-all disabled:opacity-50">
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
                  </button>
                </div>
                {aiMessage && <p className="text-xs text-slate-500 mt-2">{aiMessage}</p>}
              </div>
            </div>

            {/* Right panel — calendar + slots */}
            <div className="md:col-span-3 p-8">
              {step === "calendar" ? (
                <>
                  {/* Calendar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h2 className="font-semibold">{MONTHS[month]} {year}</h2>
                      <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {WEEKDAYS.map(d => <div key={d} className="text-center text-xs text-slate-600 py-1 font-medium">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({length: firstDay}).map((_, i) => <div key={`e${i}`} />)}
                      {Array.from({length: daysInMonth}, (_, i) => {
                        const d = new Date(year, month, i + 1);
                        const isPast = d < today;
                        const isSelected = selectedDate?.toDateString() === d.toDateString();
                        const isToday = d.toDateString() === today.toDateString();
                        return (
                          <button key={i} id={`cal-day-${i+1}`}
                            disabled={isPast}
                            onClick={() => selectDate(d)}
                            className={`aspect-square flex items-center justify-center text-sm rounded-xl transition-all font-medium
                              ${isSelected ? "bg-indigo-600 text-white" : isToday ? "border border-indigo-500 text-indigo-300 hover:bg-indigo-500/20" : isPast ? "text-slate-700 cursor-not-allowed" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}>
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  {selectedDate && (
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-3">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Loading slots...</div>
                      ) : slots.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">No available slots on this day</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                          {slots.map((slot, i) => (
                            <button key={i} id={`slot-${i}`}
                              onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                              className="py-2.5 px-3 rounded-xl border text-sm font-medium transition-all border-white/10 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white">
                              {slot.display}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Booking form */
                <div>
                  <button onClick={() => { setStep("calendar"); setError(""); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-4 h-4" /> Change time
                  </button>

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-indigo-300">{selectedSlot?.display}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {formatDuration(eventType.duration)} · {timezone.replace(/_/g," ")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Your name *</label>
                      <input id="guest-name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required
                        placeholder="Jane Smith"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address *</label>
                      <input id="guest-email" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required
                        placeholder="jane@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Additional notes <span className="text-slate-600 font-normal">(optional)</span></label>
                      <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={3}
                        placeholder="Anything the host should know..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none" />
                    </div>
                    <button id="confirm-booking-btn" onClick={handleBook} disabled={booking || !form.name || !form.email}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {booking && <Loader2 className="w-4 h-4 animate-spin" />}
                      {booking ? "Confirming..." : "Confirm booking"}
                    </button>
                    <p className="text-xs text-center text-slate-600">A confirmation will be sent to your email</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-700">Powered by <Link href="/" className="text-indigo-600 hover:text-indigo-500">Schedula</Link></p>
        </div>
      </div>
    </div>
  );
}
