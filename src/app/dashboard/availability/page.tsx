"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const label = new Date(2000,0,1,h,Number(m)).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
  return { value: `${String(h).padStart(2,"0")}:${m}`, label };
});

interface Schedule { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean; }

const DEFAULT_SCHEDULE: Schedule[] = DAYS.map((_, i) => ({
  dayOfWeek: i, startTime: "09:00", endTime: "17:00", isActive: i >= 1 && i <= 5,
}));

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<Schedule[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchAvailability = useCallback(async () => {
    const res = await fetch("/api/availability");
    const data: Schedule[] = await res.json();
    if (data.length > 0) {
      // Merge with defaults to ensure all days present
      const merged = DEFAULT_SCHEDULE.map(def => {
        const found = data.find(d => d.dayOfWeek === def.dayOfWeek);
        return found || def;
      });
      setSchedule(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  function toggleDay(i: number) {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, isActive: !d.isActive } : d));
  }
  function updateTime(i: number, field: "startTime" | "endTime", val: string) {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/availability", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schedule }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Availability</h1>
          <p className="text-slate-400 text-sm">Set when you&apos;re available for meetings</p>
        </div>
        <button id="save-availability-btn" onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        {schedule.map((day, i) => (
          <div key={day.dayOfWeek} className={`flex items-center gap-4 px-5 py-4 transition-all ${i < 6 ? "border-b border-white/5" : ""} ${day.isActive ? "" : "opacity-50"}`}>
            {/* Toggle */}
            <button id={`toggle-day-${i}`} onClick={() => toggleDay(i)}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${day.isActive ? "bg-indigo-600" : "bg-slate-700"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.isActive ? "left-5" : "left-1"}`} />
            </button>

            {/* Day name */}
            <span className="w-24 text-sm font-medium shrink-0">{DAYS[day.dayOfWeek]}</span>

            {/* Time range */}
            {day.isActive ? (
              <div className="flex items-center gap-2 flex-1">
                <select value={day.startTime} onChange={e => updateTime(i, "startTime", e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span className="text-slate-600 text-sm">–</span>
                <select value={day.endTime} onChange={e => updateTime(i, "endTime", e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                  {TIME_OPTIONS.filter(t => t.value > day.startTime).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-slate-600">Unavailable</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
