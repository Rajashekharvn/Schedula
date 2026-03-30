"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Clock, Link2, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { formatDuration, slugify, EVENT_COLORS } from "@/lib/utils";

interface EventType {
  id: string; title: string; slug: string; description: string | null;
  duration: number; color: string; isActive: boolean; location: string | null; bufferTime: number;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", duration: 30, color: "#6366f1", location: "", bufferTime: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchEventTypes = useCallback(async () => {
    const res = await fetch("/api/event-types");
    const data = await res.json();
    setEventTypes(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEventTypes(); }, [fetchEventTypes]);

  function openCreate() {
    setEditId(null);
    setForm({ title: "", description: "", duration: 30, color: "#6366f1", location: "", bufferTime: 0 });
    setError("");
    setShowForm(true);
  }

  function openEdit(et: EventType) {
    setEditId(et.id);
    setForm({ title: et.title, description: et.description || "", duration: et.duration, color: et.color, location: et.location || "", bufferTime: et.bufferTime });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      if (editId) {
        const res = await fetch(`/api/event-types/${editId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      } else {
        const res = await fetch("/api/event-types", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug: slugify(form.title) }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      }
      await fetchEventTypes();
      setShowForm(false);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event type?")) return;
    await fetch(`/api/event-types/${id}`, { method: "DELETE" });
    await fetchEventTypes();
  }

  async function handleToggle(et: EventType) {
    await fetch(`/api/event-types/${et.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !et.isActive }),
    });
    await fetchEventTypes();
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Event Types</h1>
          <p className="text-slate-400 text-sm">Create meeting types for people to book with you</p>
        </div>
        <button id="create-event-type-btn" onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> New event type
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/8">
          <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No event types yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first event type to start accepting bookings</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all">
            <Plus className="w-4 h-4" /> Create event type
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <div key={et.id} className={`glass rounded-2xl p-5 border transition-all ${et.isActive ? "border-white/8 hover:border-white/15" : "border-white/5 opacity-60"}`}>
              <div className="flex items-start gap-4">
                <div className="w-1 h-16 rounded-full shrink-0 mt-1" style={{ backgroundColor: et.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{et.title}</h3>
                    {!et.isActive && <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(et.duration)}</span>
                    {et.location && <span>{et.location}</span>}
                    {et.bufferTime > 0 && <span>+{et.bufferTime}m buffer</span>}
                  </div>
                  {et.description && <p className="text-xs text-slate-600 mt-1 truncate">{et.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Link2 className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-600 font-mono">/{et.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggle(et)} className="p-2 rounded-lg hover:bg-white/5 transition-all text-slate-500 hover:text-white">
                    {et.isActive ? <ToggleRight className="w-5 h-5 text-indigo-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(et)} className="p-2 rounded-lg hover:bg-white/5 transition-all text-slate-500 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(et.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-all text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold mb-5">{editId ? "Edit event type" : "New event type"}</h2>
            <div className="space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                <input id="et-title-input" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  placeholder="e.g. Coffee Chat"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Briefly describe what this meeting is about"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration</label>
                  <select value={form.duration} onChange={e => setForm(f => ({...f, duration: Number(e.target.value)}))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                    {DURATIONS.map(d => <option key={d} value={d}>{formatDuration(d)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Buffer time</label>
                  <select value={form.bufferTime} onChange={e => setForm(f => ({...f, bufferTime: Number(e.target.value)}))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                    {[0,5,10,15,30].map(d => <option key={d} value={d}>{d === 0 ? "None" : `${d} min`}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Location / Meeting link</label>
                <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                  placeholder="Google Meet, Zoom link, or address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_COLORS.map(c => (
                    <button key={c.value} onClick={() => setForm(f => ({...f, color: c.value}))}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                Cancel
              </button>
              <button id="save-event-type-btn" onClick={handleSave} disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
