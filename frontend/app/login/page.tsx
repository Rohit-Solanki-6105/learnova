"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
        // Mock user details since token parsing isn't fully set up on client right now
        login(data.access, data.refresh, { id: -1, email, name: email.split("@")[0], role: 3 });
        router.push("/");
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
    <div className="flex min-h-[85vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/50 backdrop-blur-xl p-10 shadow-2xl border border-gray-100 dark:bg-slate-900/50 dark:border-slate-800 transition-all">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Or{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-600 text-sm bg-red-50/80 p-3 rounded-lg border border-red-100 text-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Email address</label>
              <input
                type="email"
                required
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 absolute" /> : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
