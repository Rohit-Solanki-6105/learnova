"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ChevronDown, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (res.ok) {
        // Redirect to login
        router.push("/login?registered=true");
      } else {
        const errData = await res.json();
        const errorMessage = errData.email ? `Email: ${errData.email[0]}` : "Failed to create account. Please check details.";
        setError(errorMessage);
      }
    } catch {
      setError("Failed to connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#f9f9f9] text-[#1a1c1c] antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Side: Register Container */}
      <section className="w-full md:w-1/2 lg:w-[45%] h-screen overflow-y-auto bg-[#ffffff] relative z-10">
        <div className="flex flex-col min-h-full items-center justify-center px-8 md:px-12 lg:px-20 py-12">
          <div className="max-w-md w-full">
            {/* Brand Anchor */}
            <div className="mb-12">
              <span className="text-2xl font-bold tracking-tight text-neutral-900" style={{ fontFamily: "'Manrope', sans-serif" }}>LEARNOVA</span>
            </div>

            {/* Header Section */}
            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1c1c] tracking-tight mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Create your account
              </h1>
              <p className="text-[#5d5f5e] text-lg leading-relaxed">
                Join our elite academic community today
              </p>
            </header>

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleRegister}>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#ba0035] mb-2 ml-4">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alexandria Sterling"
                    className="w-full px-6 py-4 bg-[#f3f3f3] border-0 rounded-lg text-[#1a1c1c] placeholder:text-[#5d5f5e]/50 focus:ring-2 focus:ring-[#ba0035]/20 focus:bg-white transition-all duration-300 outline-none"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#ba0035] mb-2 ml-4">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sterling@learnova.edu"
                    className="w-full px-6 py-4 bg-[#f3f3f3] border-0 rounded-lg text-[#1a1c1c] placeholder:text-[#5d5f5e]/50 focus:ring-2 focus:ring-[#ba0035]/20 focus:bg-white transition-all duration-300 outline-none"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#ba0035] mb-2 ml-4">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-6 py-4 bg-[#f3f3f3] border-0 rounded-lg text-[#1a1c1c] placeholder:text-[#5d5f5e]/50 focus:ring-2 focus:ring-[#ba0035]/20 focus:bg-white transition-all duration-300 outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5d5f5e]/60 hover:text-[#1a1c1c] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="relative">
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#ba0035] mb-2 ml-4">Academic Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-[#f3f3f3] border-0 rounded-lg text-[#1a1c1c] focus:ring-2 focus:ring-[#ba0035]/20 focus:bg-white transition-all duration-300 appearance-none outline-none"
                  >
                    <option value={3}>Learner</option>
                    <option value={2}>Instructor</option>
                    <option value={1}>Admin</option>
                  </select>
                  <div className="absolute right-4 top-[70%] -translate-y-1/2 pointer-events-none text-[#5d5f5e]/60">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* Primary Action */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#ba0035] text-white font-bold rounded-full text-lg shadow-xl hover:bg-[#e70545] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
                </button>
              </div>
            </form>

            {/* Footer Text */}
            <footer className="mt-12 text-center">
              <p className="text-[#5d5f5e]">
                Already have an account?
                <Link href="/login" className="text-[#ba0035] font-semibold hover:underline decoration-[#ba0035]/30 underline-offset-4 ml-1 transition-all">
                  Log in
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </section>

      {/* Right Side: Visual Canvas */}
      <section className="hidden md:block md:w-1/2 lg:w-[55%] relative overflow-hidden bg-[#e8e8e8]">
        {/* Hero Image with subtle editorial overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] hover:scale-105"
          style={{ backgroundImage: "url('/auth-bg-2.jpg')" }}
        >
        </div>

        {/* Gradient Layer for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900/60 via-transparent to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 p-12 lg:p-20 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md p-1 w-20 mb-8 rounded-full"></div>
          <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
            The future of excellence begins here.
          </h2>
          <div className="flex items-center gap-4 text-white/80">
            <span className="h-[1px] w-12 bg-white/40"></span>
            <span className="uppercase tracking-[0.2em] text-xs font-bold">EST. MMXXIV</span>
          </div>
        </div>

        {/* Floating Badge for Premium Feel */}
        <div className="absolute top-12 right-12 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
          <CheckCircle className="text-white" size={20} />
          <span className="text-white text-sm font-medium tracking-wide">Accredited Institution</span>
        </div>
      </section>
    </main>
  );
}
