"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { logout, user } = useAuth();
  const router = useRouter();

  // Optionally hide if the user is not logged in
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:bg-red-100 transition-colors shadow-sm"
      title="Logout from Learnova"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
}
