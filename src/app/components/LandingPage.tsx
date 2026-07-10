import React, { useState, useEffect } from "react";
import { TrendingUp, Menu, X, Zap, ChevronRight, Star, Check } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { cn, fmt } from "./shared/utils";
import { Btn } from "./shared/Btn";
import { Card } from "./shared/Card";
import { Badge } from "./shared/Badge";
import { MONTHLY, FEATURES, TESTIMONIALS, PRICING } from "./shared/constants";


export default function LandingPage({ onGetStarted, onLogin, onSelectPlan }: { onGetStarted: () => void; onLogin: () => void; onSelectPlan?: (plan: "Pro" | "Family") => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-card/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>FinTrack</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Analytics", "Pricing", "Testimonials"].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">{item}</a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Btn variant="ghost" size="sm" onClick={onLogin}>Sign In</Btn>
              <Btn size="sm" onClick={onGetStarted}>Get Started Free</Btn>
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-b border-border px-4 pb-4">
            {["Features", "Analytics", "Pricing", "Testimonials"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-muted-foreground hover:text-foreground">{item}</a>
            ))}
            <div className="flex gap-2 pt-3">
              <Btn variant="outline" size="sm" className="flex-1 justify-center" onClick={onLogin}>Sign In</Btn>
              <Btn size="sm" className="flex-1 justify-center" onClick={onGetStarted}>Get Started</Btn>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <Zap size={12} className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Trusted by 50,000+ users across India</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Your complete{" "}
              <span className="text-emerald-500">financial command</span>{" "}
              center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Track expenses, grow investments, hit savings goals — all in one beautifully designed workspace. Built for Indians who take their finances seriously.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Btn size="lg" onClick={onGetStarted} className="w-full sm:w-auto justify-center">
                <Zap size={16} />
                Start Free — No Card Required
              </Btn>
              <Btn variant="outline" size="lg" onClick={onLogin} className="w-full sm:w-auto justify-center">
                View Live Demo
                <ChevronRight size={16} />
              </Btn>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Free forever plan available · 14-day Pro trial · Cancel anytime</p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none z-10 rounded-3xl" />
            <Card className="p-4 shadow-2xl border-2 border-border/50" glassmorphism>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Net Worth", value: "₹18.4L", color: "#10b981", up: true },
                  { label: "Monthly Income", value: "₹1,00,000", color: "#3b82f6", up: true },
                  { label: "Monthly Expenses", value: "₹61,000", color: "#f59e0b", up: false },
                  { label: "Investments", value: "₹10.08L", color: "#8b5cf6", up: true },
                ].map(s => (
                  <div key={s.label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-sm sm:text-base font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace", color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-40 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY.slice(-6)} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gi)" strokeWidth={2} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#3b82f6" fill="url(#ge)" strokeWidth={2} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-14 px-4 border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50K+", label: "Active Users" },
            { value: "₹240Cr+", label: "Tracked Monthly" },
            { value: "4.9★", label: "App Rating" },
            { value: "99.9%", label: "Uptime SLA" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-emerald-500 mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-500 font-semibold text-sm mb-2">POWERFUL FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Everything you need to master money</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete toolkit for tracking, analyzing, and growing your personal wealth.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <Card key={f.title} className="p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-default group">
                <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: f.color + "18" }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-500 font-semibold text-sm mb-2">TESTIMONIALS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Loved by 50,000+ users</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={13} fill="#f59e0b" className="text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: t.color }}>{t.av}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-500 font-semibold text-sm mb-2">PRICING</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Simple, transparent pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PRICING.map(p => (
              <Card key={p.name} className={cn("p-6", p.hot && "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10")}>
                {p.hot && (
                  <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">Most Popular</div>
                )}
                <h3 className="text-lg font-bold text-foreground mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  {p.price === 0 ? (
                    <span className="text-3xl font-extrabold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>₹{p.price}</span>
                      <span className="text-sm text-muted-foreground">{p.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Btn
                  variant={p.hot ? "primary" : "outline"}
                  className="w-full justify-center"
                  onClick={() => {
                    if (p.name === "Pro" || p.name === "Family") {
                      onSelectPlan?.(p.name as "Pro" | "Family");
                    } else {
                      onGetStarted();
                    }
                  }}
                >
                  {p.cta}
                </Btn>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-blue-500/10 rounded-3xl p-12 border border-emerald-500/20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Ready to take control of your finances?
            </h2>
            <p className="text-muted-foreground mb-8">Join 50,000+ Indians building wealth smarter. Free forever plan, no credit card needed.</p>
            <Btn size="lg" onClick={onGetStarted} className="shadow-xl shadow-emerald-500/20">
              <Zap size={18} />
              Get Started for Free Today
            </Btn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold text-foreground">FinTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 FinTrack. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
