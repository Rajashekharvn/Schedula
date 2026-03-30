import Link from "next/link";
import { Calendar, Clock, Globe, Zap, Shield, Sparkles, ArrowRight, Check } from "lucide-react";

const features = [
  { icon: Calendar, title: "Effortless Scheduling", desc: "Share your booking link and let others pick a time that works for everyone — no back-and-forth needed." },
  { icon: Globe, title: "Time Zone Smart", desc: "Automatically detects your guest's timezone and shows slots in their local time." },
  { icon: Zap, title: "Google Calendar Sync", desc: "All bookings instantly appear on your Google Calendar. Your availability stays accurate — always." },
  { icon: Shield, title: "Secure & Private", desc: "OAuth2 authentication, encrypted tokens, and secure session management built in." },
  { icon: Clock, title: "Custom Availability", desc: "Set your working hours, block off dates, and add buffer time between meetings." },
  { icon: Sparkles, title: "AI Assistant", desc: 'Let guests type "next Tuesday afternoon" and our AI finds the right slot instantly.' },
];

const steps = [
  { step: "01", title: "Create your account", desc: "Sign up in seconds with Google or email." },
  { step: "02", title: "Set your availability", desc: "Define your working hours and event types." },
  { step: "03", title: "Share your link", desc: "Send your personal booking URL to anyone." },
  { step: "04", title: "Get booked", desc: "Meetings land on your calendar automatically." },
];

const plans = [
  { name: "Free", price: "$0", features: ["3 event types", "Unlimited bookings", "Google Calendar sync", "Time zone support"], cta: "Get started free", highlight: false },
  { name: "Pro", price: "$12", features: ["Unlimited event types", "AI scheduling assistant", "Email notifications", "Custom branding", "Priority support"], cta: "Start free trial", highlight: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Schedula</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-300 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Now with AI-powered scheduling
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Schedule meetings{" "}
            <span className="gradient-text">without the chaos</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Share your booking link. Let others pick a time. Get notified. It&apos;s that simple — no emails, no spreadsheets, no friction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              id="hero-cta-btn"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 glow"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">No credit card required · Free forever plan available</p>
        </div>

        {/* Mock UI preview */}
        <div className="max-w-3xl mx-auto mt-20 relative">
          <div className="glass rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <div className="ml-4 flex-1 h-6 bg-white/5 rounded-md flex items-center px-3">
                <span className="text-xs text-slate-500">schedula.app/johndoe/coffee-chat</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">J</div>
                <h3 className="font-semibold text-lg">John Doe</h3>
                <div className="glass rounded-xl p-3 space-y-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Coffee Chat</p>
                  <div className="flex items-center gap-2 text-sm text-slate-300"><Clock className="w-4 h-4 text-indigo-400" />30 min</div>
                  <div className="flex items-center gap-2 text-sm text-slate-300"><Globe className="w-4 h-4 text-indigo-400" />Google Meet</div>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                    <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
                  ))}
                  {Array.from({length:31},(_,i)=>i+1).map(d => (
                    <div key={d} className={`text-center text-xs py-2 rounded-lg cursor-pointer transition-colors ${d===15?"bg-indigo-600 text-white":d>5&&d<28&&d!==11&&d!==17?"hover:bg-white/10 text-slate-300":"text-slate-600 cursor-not-allowed"}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","2:00 PM"].map(t=>(
                    <div key={t} className={`text-center text-xs py-2 px-3 rounded-lg border transition-all cursor-pointer ${t==="10:00 AM"?"bg-indigo-600 border-indigo-500 text-white":"border-white/10 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10"}`}>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute -inset-4 bg-indigo-600/10 blur-2xl -z-10 rounded-3xl" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to get booked</h2>
            <p className="text-slate-400 text-lg">Powerful features that make scheduling feel effortless</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:bg-white/[0.06] group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-slate-400 text-lg">Four simple steps to start getting booked</p>
          </div>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.step} className="flex gap-6 items-start glass rounded-2xl p-6">
                <div className="text-4xl font-black text-indigo-500/30 min-w-[60px]">{step.step}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 relative ${plan.highlight ? "bg-gradient-to-b from-indigo-600/30 to-purple-600/20 border border-indigo-500/40" : "glass"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to simplify your schedule?</h2>
          <p className="text-slate-400 text-lg mb-8">Join thousands of professionals who use Schedula to streamline their booking process.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105">
            Get started for free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-400">Schedula</span>
          </div>
          <p>© {new Date().getFullYear()} Schedula. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
