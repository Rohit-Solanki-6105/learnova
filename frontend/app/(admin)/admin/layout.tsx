"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PieChart, Settings, LogOut, Layout } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: Layout },
        { name: "Courses", href: "/admin/courses", icon: BookOpen },
        { name: "Reports", href: "/admin/reports", icon: PieChart },
    ];

    return (
        <div className="flex h-screen bg-[#f9fafb]">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Link href="/admin/courses" className="text-xl font-bold tracking-tight text-gray-900">
                        Learnova<span className="text-rose-500">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-rose-50 text-rose-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon size={18} className={isActive ? "text-rose-500" : "text-gray-400"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <LogOut size={18} className="text-gray-400" />
                        Back to Site
                    </Link>
                </div>
            </div>

            {/* Main Container */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
