"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, User, LogOut } from "lucide-react"
import LogoutButton from "./LogoutButton"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Courses", href: "/my-courses", icon: BookOpen },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <Link href="/" className="ms-2 flex md:me-24">
              <span className="self-center whitespace-nowrap text-xl font-bold sm:text-2xl dark:text-white">
                Learnova
              </span>
            </Link>
            <div className="hidden space-x-8 sm:ms-10 sm:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                      isActive
                        ? "border-primary text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <LogoutButton variant="ghost" size="sm" />
          </div>
        </div>
      </div>
    </nav>
  )
}
