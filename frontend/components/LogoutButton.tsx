"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
}

export default function LogoutButton({ variant = "default", size = "md", className }: LogoutButtonProps) {
  const { logout, user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const variants = {
    default: "text-red-600 bg-red-50 hover:bg-red-100 shadow-sm",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    outline: "border border-gray-200 text-gray-600 hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50",
        variants[variant],
        sizes[size],
        className
      )}
      title="Logout from Learnova"
    >
      <LogOut className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      {size !== "icon" && <span>Logout</span>}
    </button>
  );
}
