"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, BookOpen, Mail, Lock, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 1 || user.role === 2) {
        router.push("/admin/courses");
      } else {
        router.push("/courses");
      }
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        // Fetch real user details
        const meRes = await fetch("http://localhost:8000/api/users/me/", {
          headers: {
            "Authorization": `Bearer ${data.access}`
          }
        });
        const userData = await meRes.json();

        login(data.access, data.refresh, userData);
        if (userData.role === 1 || userData.role === 2) {
          router.push("/admin/courses");
        } else {
          router.push("/courses");
        }
      } else {
        const errData = await res.json();
        setError(errData.detail || "Invalid credentials provided");
      }
    } catch {
      setError("Failed to connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-[#f9f9f9] text-[#1a1c1c] antialiased overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Side: Visual Canvas */}
      <section className="hidden lg:block lg:w-7/12 relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            alt="Abstract minimalist library architecture with golden lighting"
            className="w-full h-full object-cover opacity-70"
            src="/auth-bg-1.jpg"
          />
        </div>

        {/* Branding Overlay */}
        <div className="absolute top-12 left-12 z-20">
          <span className="font-black text-2xl tracking-tighter text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>LEARNOVA</span>
        </div>

        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(26, 28, 28, 0.8) 0%, rgba(26, 28, 28, 0) 60%)' }}></div>

        <div className="absolute bottom-20 left-12 right-20 z-20">
          <div className="w-24 h-1 bg-[#ba0035] mb-8"></div>
          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            The future of <br />
            <span className="italic font-normal">excellence</span> <br />
            begins here.
          </h1>
          <p className="mt-8 text-zinc-300 text-lg max-w-md font-light leading-relaxed">
            Access our curated editorial curriculum designed for the modern scholar. A prestige learning experience redefined.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-5/12 h-screen overflow-y-auto bg-[#ffffff]">
        <div className="flex flex-col min-h-full items-center justify-center px-8 sm:px-16 lg:px-24 py-12">
          <div className="w-full max-w-md space-y-12">
            {/* Header */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, rgba(186, 0, 53, 0.9) 0%, rgba(231, 5, 69, 0.7) 100%)' }}>
                  <BookOpen size={20} />
                </div>
                <span className="font-extrabold text-xl tracking-tighter text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>LEARNOVA</span>
              </div>
              <h2 className="text-4xl font-bold text-[#1a1c1c] tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Welcome Back</h2>
              <p className="text-[#5d5f5e] font-medium">Please enter your credentials to access the library.</p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-[#ba0035] ml-1 font-bold" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 px-6 bg-[#f3f3f3] rounded-lg border-none focus:ring-2 focus:ring-[#ba0035]/20 focus:bg-[#ffffff] transition-all duration-300 outline-none placeholder:text-zinc-400"
                      placeholder="scholar@learnova.edu"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#ba0035] transition-colors pointer-events-none">
                      <Mail size={20} />
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs uppercase tracking-[0.15em] text-[#ba0035] font-bold" htmlFor="password">Password</label>
                    <Link href="#" className="text-xs font-medium text-[#5d5f5e] hover:text-[#ba0035] transition-colors">Forgot Password?</Link>
                  </div>
                  <div className="relative group">
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 px-6 bg-[#f3f3f3] rounded-lg border-none focus:ring-2 focus:ring-[#ba0035]/20 focus:bg-[#ffffff] transition-all duration-300 outline-none placeholder:text-zinc-400"
                      placeholder="••••••••••••"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#ba0035] transition-colors pointer-events-none">
                      <Lock size={20} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 py-2">
                <input id="remember" type="checkbox" className="w-5 h-5 rounded border-none bg-[#f3f3f3] text-[#ba0035] focus:ring-[#ba0035]/20 focus:ring-offset-0 transition-all cursor-pointer" />
                <label htmlFor="remember" className="text-sm font-medium text-[#5d5f5e] select-none cursor-pointer">Maintain my session for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-white font-bold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, rgba(186, 0, 53, 0.9) 0%, rgba(231, 5, 69, 0.7) 100%)',
                  boxShadow: '0 20px 50px -12px rgba(26, 28, 28, 0.08)',
                  fontFamily: "'Manrope', sans-serif"
                }}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    Sign In
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-8 border-t border-transparent text-center">
              <p className="text-[#5d5f5e] text-sm">
                Don&apos;t have an account?
                <Link href="/register" className="font-bold text-[#1a1c1c] hover:text-[#ba0035] transition-colors ml-1">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Subtle Tonal Branding */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="flex items-center gap-2 opacity-30">
                <ShieldCheck size={16} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Secure Access</span>
              </div>
              <div className="flex items-center gap-2 opacity-30">
                <Globe size={16} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Global Network</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
