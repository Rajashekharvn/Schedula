"use client";
import { useState, useEffect } from "react";
import { Save, Loader2, Copy, Check, Globe } from "lucide-react";
import { COMMON_TIMEZONES } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { update } = useSession();
  const [profile, setProfile] = useState({ name: "", username: "", bio: "", timezone: "UTC", googleConnected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      setProfile({ name: d.name || "", username: d.username || "", bio: d.bio || "", timezone: d.timezone || "UTC", googleConnected: d.googleConnected });
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, username: profile.username, bio: profile.bio, timezone: profile.timezone }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    await update();
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="p-8 flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="glass rounded-2xl border border-white/8 p-6">
          <h2 className="font-semibold mb-5">Profile</h2>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Display name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <div className="flex items-center gap-0">
                <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-xl py-2.5 px-3 text-sm text-slate-500">schedula.app/</span>
                <input id="settings-username" value={profile.username} onChange={e => setProfile(p => ({...p, username: e.target.value}))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-r-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} rows={3}
                placeholder="Tell people a bit about yourself"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone</label>
              <select value={profile.timezone} onChange={e => setProfile(p => ({...p, timezone: e.target.value}))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                {COMMON_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>
          <button id="save-settings-btn" onClick={handleSave} disabled={saving}
            className="mt-5 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save profile"}
          </button>
        </div>

        {/* Booking link */}
        {profile.username && (
          <div className="glass rounded-2xl border border-white/8 p-6">
            <h2 className="font-semibold mb-4">Your booking link</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-400 font-mono truncate">
                {typeof window !== "undefined" ? window.location.origin : ""}/{profile.username}
              </div>
              <button id="copy-booking-link-btn" onClick={copyLink}
                className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm px-4 py-2.5 rounded-xl transition-all shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Google Calendar */}
        <div className="glass rounded-2xl border border-white/8 p-6">
          <h2 className="font-semibold mb-2">Google Calendar</h2>
          <p className="text-slate-500 text-sm mb-4">Connect your calendar to automatically sync bookings and check availability.</p>
          {profile.googleConnected ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-sm text-emerald-400 font-medium">Connected</span>
            </div>
          ) : (
            <a href="/api/auth/signin/google"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl transition-all">
              <Globe className="w-4 h-4" /> Connect Google Calendar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
