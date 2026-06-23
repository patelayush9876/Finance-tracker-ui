import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Shield, Zap, Award, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Btn } from "./shared/Btn";
import { Input } from "./shared/Input";

export default function AuthPage({ onBack, onAuth }: { onBack: () => void; onAuth: () => void }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, register } = useAuthStore();

  const handleLoginSubmit = async () => {
    setErrorMsg(null);
    try {
      await login({ email, password });
      onAuth();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
    }
  };

  const handleRegisterSubmit = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || " ";

    try {
      await register({ firstName, lastName, email, password });
      await login({ email, password });
      onAuth();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinTrack</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-snug" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Your money,<br />your future.
          </h2>
          <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
            Join 50,000+ users who've transformed their financial lives with FinTrack.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: Shield, text: "Bank-grade 256-bit encryption" },
            { icon: Zap, text: "Real-time sync with 50+ banks" },
            { icon: Award, text: "Rated #1 finance app in India" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                <item.icon size={15} className="text-white" />
              </div>
              <p className="text-sm text-emerald-50">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronRight size={14} className="rotate-180" />
          Back to home
        </button>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          {mode === "login" && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground mb-8">Sign in to your FinTrack account</p>
              <div className="space-y-4">
                <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <button onClick={() => setMode("forgot")} className="text-xs text-emerald-500 hover:text-emerald-400">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPwd ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all" />
                    <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <Btn className="w-full justify-center" size="lg" onClick={handleLoginSubmit}>Sign In</Btn>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-6">
                No account?{" "}
                <button onClick={() => setMode("register")} className="text-emerald-500 hover:text-emerald-400 font-medium">Create one free</button>
              </p>
            </>
          )}

          {mode === "register" && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Create account</h1>
              <p className="text-sm text-muted-foreground mb-8">Start your financial journey today</p>
              <div className="space-y-4">
                <Input label="Full name" icon={User} placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} />
                <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-9 text-muted-foreground" />
                  <Input label="Password" type={showPwd ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <Btn className="w-full justify-center" size="lg" onClick={handleRegisterSubmit}>Create Free Account</Btn>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">By signing up, you agree to our Terms & Privacy Policy</p>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-emerald-500 hover:text-emerald-400 font-medium">Sign in</button>
              </p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-5">
                <Mail size={20} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Reset password</h1>
              <p className="text-sm text-muted-foreground mb-8">We'll send a reset link to your email</p>
              <div className="space-y-4">
                <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                <Btn className="w-full justify-center" size="lg" onClick={() => setMode("login")}>Send Reset Link</Btn>
              </div>
              <button onClick={() => setMode("login")} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-6 mx-auto">
                <ChevronRight size={14} className="rotate-180" />
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
