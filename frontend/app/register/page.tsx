"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="flex min-h-[85vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/50 backdrop-blur-xl p-10 shadow-2xl border border-gray-100 dark:bg-slate-900/50 dark:border-slate-800 transition-all">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="text-red-600 text-sm bg-red-50/80 p-3 rounded-lg border border-red-100 text-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Full Name</label>
              <input
                type="text"
                required
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Email address</label>
              <input
                type="email"
                required
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
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
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Register as</label>
              <select
                value={role}
                onChange={(e) => setRole(Number(e.target.value))}
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
              >
                <option value={3}>Learner</option>
                <option value={2}>Instructor</option>
                <option value={1}>Admin</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 absolute" /> : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
