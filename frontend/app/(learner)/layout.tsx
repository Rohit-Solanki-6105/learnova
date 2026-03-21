import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/", label: "Dashboard", icon: BookOpen },
    { href: "/courses", label: "Explore Courses", icon: Compass },
    { href: "/my-courses", label: "My Learning", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Learner Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-1 py-4 border-b-2 border-transparent hover:border-blue-500 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white whitespace-nowrap text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        {children}
      </main>
    </div>
  );
}
