"use client";

import { Sidebar } from "@/components/Sidebar";
import { BookOpen, PieChart, Settings, LogOut, Layout } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigation = [
        { name: "Dashboard", href: "/admin", icon: Layout },
        { name: "Courses", href: "/admin/courses", icon: BookOpen },
        { name: "Reports", href: "/admin/reports", icon: PieChart },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#f9fafb] dark:bg-gray-900">
            <Sidebar 
                items={navigation} 
                logo={{
                    text: "Learnova",
                    highlight: "Admin",
                    href: "/admin"
                }}
                footerLink={{
                    name: "Back to Site",
                    href: "/",
                    icon: LogOut
                }}
            />

            {/* Main Container */}
            <div className="flex-1 overflow-auto sm:ml-64">
                {children}
            </div>
        </div>
    );
}
