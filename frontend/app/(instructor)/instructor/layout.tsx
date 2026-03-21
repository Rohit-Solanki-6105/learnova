"use client";

import { Sidebar } from "@/components/Sidebar";
import { BookOpen, PieChart, Users, LogOut, Layout } from "lucide-react";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
    const navigation = [
        { name: "Dashboard", href: "/instructor/dashboard", icon: Layout },
        { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
        { name: "Attendees", href: "/instructor/attendees", icon: Users },
        { name: "Reporting", href: "/instructor/reporting", icon: PieChart },
    ];

    return (
        <div className="flex h-screen bg-[#f3f4f6] dark:bg-gray-900">
            <Sidebar 
                items={navigation} 
                activeColor="text-indigo-600"
                activeBg="bg-indigo-50"
                logo={{
                    text: "Learnova",
                    highlight: "Instructor",
                    href: "/instructor/dashboard"
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
