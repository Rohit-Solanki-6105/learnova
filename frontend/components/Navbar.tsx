"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  ChevronDown,
  LogOut,
  Shield,
  Trophy,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { fetchUserTotalPoints, getBadgeForPoints } from "@/lib/gamification";

const ADMIN_ROLES = new Set([1, 2]);
const LEARNER_ROLE = 3;

const getRoleLabel = (role: number): string => {
  if (role === 1) return "Admin";
  if (role === 2) return "Instructor";
  return "Learner";
};

const getHomePathForRole = (role: number): string => {
  if (role === LEARNER_ROLE) return "/courses";
  return "/admin/courses";
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user && ADMIN_ROLES.has(user.role)) {
      router.replace("/admin/courses");
    }
  }, [loading, user, router]);

  useEffect(() => {
    let isMounted = true;

    const loadPoints = async () => {
      if (!user || user.role !== LEARNER_ROLE) {
        setTotalPoints(0);
        setPointsLoading(false);
        return;
      }

      setPointsLoading(true);

      try {
        const points = await fetchUserTotalPoints(user.id);
        if (isMounted) {
          setTotalPoints(points);
        }
      } catch {
        if (isMounted) {
          setTotalPoints(0);
        }
      } finally {
        if (isMounted) {
          setPointsLoading(false);
        }
      }
    };

    loadPoints();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentBadge = useMemo(() => getBadgeForPoints(totalPoints), [totalPoints]);

  const navItems = useMemo(() => {
    if (user && ADMIN_ROLES.has(user.role)) {
      return [{ name: "Admin Panel", href: "/admin/courses", icon: LayoutDashboard }];
    }

    return [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Courses", href: "/courses", icon: Compass },
      { name: "My Learning", href: "/my-courses", icon: BookOpen },
    ];
  }, [user]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push("/login");
  };

  const userDisplayName = user?.name?.trim() || user?.email?.split("@")[0] || "Learner";
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  const homePath = user ? getHomePathForRole(user.role) : "/";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#e8e8e8] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={homePath} className="flex-shrink-0">
            <span
              className="text-xl font-extrabold sm:text-2xl text-[#1a1c1c] tracking-tight"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Learnova
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors",
                    isActive
                      ? "bg-[#f3184c] text-white"
                      : "text-[#5d5f5e] hover:bg-[#f3f3f3] hover:text-[#1a1c1c]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <div className="h-9 w-24 rounded-full bg-[#f3f3f3] animate-pulse" />
            )}

            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-bold border border-[#e8e8e8] text-[#1a1c1c] hover:bg-[#f3f3f3] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full text-sm font-bold text-white bg-[#f3184c] hover:bg-[#e01445] transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}

            {!loading && user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[#e8e8e8] px-2.5 py-1.5 hover:bg-[#f9f9f9] transition-colors"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1a1c1c] text-white text-sm font-bold flex items-center justify-center">
                    {userInitial}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-[#1a1c1c] max-w-[120px] truncate">
                    {userDisplayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#5d5f5e]" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_12px_28px_rgba(30,30,30,0.12)] p-4">
                    <div className="pb-3 border-b border-[#f3f3f3]">
                      <p className="text-sm font-bold text-[#1a1c1c]">{userDisplayName}</p>
                      <p className="text-xs text-[#5d5f5e] mt-1">{user.email}</p>
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold mt-2 text-[#f3184c]">
                        <Shield className="w-3 h-3" />
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    {user.role === LEARNER_ROLE && (
                      <div className="py-3 border-b border-[#f3f3f3] space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#5d5f5e]">Total Points</span>
                          <span className="font-bold text-[#1a1c1c]">
                            {pointsLoading ? "..." : totalPoints.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#5d5f5e]">Badge</span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#f3184c]">
                            <Trophy className="w-3.5 h-3.5" />
                            {currentBadge?.name ?? "No badge yet"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 space-y-2">
                      <Link
                        href={getHomePathForRole(user.role)}
                        className="block w-full rounded-xl px-3 py-2 text-sm font-semibold text-[#1a1c1c] hover:bg-[#f3f3f3] transition-colors"
                      >
                        {user.role === LEARNER_ROLE ? "Go to Learning Dashboard" : "Go to Admin Panel"}
                      </Link>

                      {user.role === LEARNER_ROLE && (
                        <Link
                          href="/my-courses"
                          className="block w-full rounded-xl px-3 py-2 text-sm font-semibold text-[#1a1c1c] hover:bg-[#f3f3f3] transition-colors"
                        >
                          My Courses
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#f3184c] hover:bg-[#fff2f6] transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
