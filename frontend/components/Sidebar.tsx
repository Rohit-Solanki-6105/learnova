"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface SidebarItem {
  name: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  items: SidebarItem[]
  title?: string
  logo?: {
    text: string
    highlight: string
    href: string
  }
  activeColor?: string
  activeBg?: string
  footerLink?: {
    name: string
    href: string
    icon: LucideIcon
  }
}

export function Sidebar({ 
  items, 
  title, 
  logo, 
  activeColor = "text-rose-600", 
  activeBg = "bg-rose-50",
  footerLink 
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white transition-transform sm:translate-x-0 dark:border-gray-700 dark:bg-gray-800" aria-label="Sidebar">
      <div className="flex h-full flex-col overflow-y-auto pb-4">
        {logo && (
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <Link href={logo.href} className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {logo.text}<span className={activeColor.replace("text-", "text-[#f43f5e]")}>{logo.highlight}</span>
              {/* Note: I'll use a specific color for the highlight to match the user's style */}
            </Link>
          </div>
        )}
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {title && (
            <h2 className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {title}
            </h2>
          )}
          <ul className="space-y-2 font-medium">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 group transition-colors",
                      isActive && cn(activeBg, activeColor, "dark:bg-gray-700 dark:text-white")
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
                      isActive && cn(activeColor, "dark:text-white")
                    )} />
                    <span className="ms-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {footerLink && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={footerLink.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <footerLink.icon size={18} className="text-gray-400" />
              {footerLink.name}
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
