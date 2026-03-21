import Link from "next/link";
'use client'
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  const { login, user, loading } = useAuth();
  // useEffect(() => {
  //   console.log(user)
  // }, [user])
  if (loading) return "loading";
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Welcome to Learnova</h1>
        <p className="text-lg text-gray-600">Please select which module you'd like to access:</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/admin/courses" className="px-8 py-4 bg-[#f43f5e] hover:bg-rose-600 text-white font-semibold rounded-2xl shadow-sm transition-all hover:scale-105">
            Admin Dashboard
          </Link>
          <Link href="/courses" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl shadow-sm transition-all border border-gray-200 hover:scale-105">
            Learner Website
          </Link>
        </div>
      </div>
    </div>
  );
}
