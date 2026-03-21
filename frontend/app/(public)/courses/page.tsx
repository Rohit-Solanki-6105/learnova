"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ListFilter, Star, PlayCircle, Clock } from "lucide-react";

const CATEGORIES = ["All Courses", "Design", "Development", "Business", "Marketing"];

const COURSES = [
    {
        id: "1",
        title: "Advanced Design Systems for Modern SaaS",
        description: "Master the architecture of scalable component libraries and token management for enterprise-level platforms.",
        tags: ["Design", "Popular"],
        bgClass: "bg-[#65A391]", // Teal
        meta: { rating: "4.9", lessons: "22 Lessons", time: "12h" },
        price: "$49.00"
    },
    {
        id: "2",
        title: "Full-Stack Development with Modern Architectures",
        description: "From database design to frontend deployment. Learn the full lifecycle of a digital product.",
        tags: ["Development", "Beginner"],
        bgClass: "bg-[#D9A34A]", // Gold
        meta: { rating: "4.8", lessons: "45 Lessons", time: "32h" },
        price: "$89.00"
    },
    {
        id: "3",
        title: "Creative Leadership & Product Management",
        description: "Bridge the gap between design and business. Learn how to lead creative teams effectively.",
        tags: ["Business", "New"],
        bgClass: "bg-[#A7BC93]", // Moss green
        meta: { rating: "5.0", lessons: "18 Lessons", time: "8h" },
        price: "$59.00"
    },
    {
        id: "4",
        title: "Mastering Next.js 14 and React Server Components",
        description: "Build incredibly fast, SEO-friendly applications with the latest React framework features.",
        tags: ["Development", "Advanced"],
        bgClass: "bg-[#7180B9]", // Soft Blue
        meta: { rating: "4.9", lessons: "30 Lessons", time: "18h" },
        price: "$79.00"
    },
    {
        id: "5",
        title: "Digital Marketing Strategy Formulation",
        description: "Learn how to build comprehensive marketing funnels that convert visitors into loyal customers.",
        tags: ["Marketing"],
        bgClass: "bg-[#D68C8C]", // Soft Coral
        meta: { rating: "4.7", lessons: "15 Lessons", time: "10h" },
        price: "Free"
    },
    {
        id: "6",
        title: "Data Visualization with D3.js",
        description: "Bring your data to life with interactive, dynamic web-based charts and graphs.",
        tags: ["Development"],
        bgClass: "bg-[#6CABDD]", // Bright Light Blue
        meta: { rating: "4.8", lessons: "28 Lessons", time: "16h" },
        price: "$55.00"
    }
];

export default function PublicCoursesPage() {
    const [activeCategory, setActiveCategory] = useState("All Courses");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = COURSES.filter(course => {
        const matchesCategory = activeCategory === "All Courses" || course.tags.includes(activeCategory);
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
            {/* Header Navigation */}
            <nav className="bg-white px-6 md:px-10 py-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-10">
                    <span className="text-2xl font-black text-gray-900 tracking-tight">Learnova</span>
                    <div className="hidden md:flex gap-8 text-sm font-semibold">
                        <Link href="/courses" className="text-[#F43F5E] border-b-2 border-[#F43F5E] pb-1">Browse Courses</Link>
                        <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
                        <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Enterprise</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors">Log In</Link>
                    <Link href="/register" className="px-5 py-2.5 bg-[#F43F5E] hover:bg-rose-600 shadow-sm shadow-rose-200 text-white rounded-full text-sm font-bold transition-all active:scale-95">Sign Up</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight mb-6">
                        Unlock Your Potential with Expert-Led Courses
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mb-10 max-w-2xl mx-auto">
                        Join thousands of learners mastering new skills every day. From strict technical deep-dives to creative masterclasses, find the perfect course for your career path.
                    </p>

                    <div className="relative max-w-2xl mx-auto flex items-center shadow-lg shadow-gray-100/50 rounded-full group">
                        <Search className="absolute left-6 text-gray-400 group-focus-within:text-[#F43F5E] transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-32 py-5 text-lg bg-white border-2 border-transparent focus:border-[#F43F5E] rounded-full outline-none transition-all"
                        />
                        <button className="absolute right-3 px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-full transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-10 text-center">
                {/* Filter & Category Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 no-scrollbar scroll-smooth">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${activeCategory === category
                                    ? 'bg-[#F43F5E] text-white shadow-md shadow-rose-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <ListFilter size={18} /> Filters
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            Sort By <ChevronDown size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCourses.map(course => (
                        <div key={course.id} className="group flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer text-left">

                            {/* Cover Art Block */}
                            <div className={`h-[240px] ${course.bgClass} relative p-6 flex flex-col justify-between overflow-hidden`}>
                                <div className="flex gap-2 relative z-10">
                                    {course.tags.map((tag, i) => (
                                        <span key={i} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm transition-colors ${tag === 'Popular' ? 'bg-[#E11D48] text-white' :
                                            tag === 'New' ? 'bg-white text-[#F43F5E]' :
                                                'bg-black/40 text-white backdrop-blur-md'
                                            }`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none">
                                    <div className="text-center transform rotate-[-5deg] scale-110 group-hover:scale-125 transition-transform duration-700">
                                        <div className="text-[64px] font-black text-white leading-[0.8] tracking-tighter mix-blend-overlay">COURSE</div>
                                        <div className="text-[64px] font-black text-white leading-[0.8] tracking-tighter mix-blend-overlay">COVER</div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-[22px] leading-snug font-extrabold text-gray-900 mb-3 group-hover:text-[#F43F5E] transition-colors">
                                    {course.title}
                                </h3>

                                <p className="text-sm leading-relaxed text-gray-500 mb-6 flex-1 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="flex items-center gap-4 text-[13px] font-bold text-gray-700 mb-8 border-t border-gray-100 pt-6">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={16} className="text-[#F43F5E]" fill="currentColor" /> {course.meta.rating}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <PlayCircle size={16} className="text-gray-400" /> {course.meta.lessons}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-gray-400" /> {course.meta.time}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-2xl font-black text-gray-900">{course.price}</span>
                                    <Link href={`/courses/${course.id}`} className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-sm transition-colors">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="py-32 text-center">
                        <Search size={48} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-500">We couldn't find anything matching your search query.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setActiveCategory("All Courses"); }}
                            className="mt-6 px-6 py-3 bg-[#F43F5E] text-white font-bold rounded-full"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Simple Footer */}
            <footer className="bg-gray-900 text-white mt-20 py-16">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-2">
                        <span className="text-2xl font-black tracking-tight mb-4 block">Learnova</span>
                        <p className="text-gray-400 text-sm max-w-sm">Empowering learners worldwide to achieve their goals through accessible, premium education.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Platform</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-white transition-colors">Browse Courses</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">For Enterprise</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
