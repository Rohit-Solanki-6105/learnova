"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Filter, Bell, HelpCircle, Zap, Calendar, MessageSquare, Clock, PlayCircle, Star, Users, Award } from "lucide-react";

// Mock Data
const PROFILE_DATA = {
    name: "Alex Rivera",
    levelName: "EXPLORER LEVEL",
    points: 2450,
    badges: 12,
    progress: 80, // percentage
};

type CourseState = "guest" | "enrolled" | "in_progress" | "paid";

interface Course {
    id: string;
    title: string;
    description: string;
    tags: string[];
    bgClass: string;
    state: CourseState;
    meta: {
        time?: string;
        lessons?: string;
        rating?: string;
        learners?: string;
        isPro?: boolean;
    };
    image?: string;
}

const COURSES: Course[] = [
    {
        id: "1",
        title: "Advanced Design Systems for Modern SaaS",
        description: "Master the architecture of scalable component libraries and token management for enterprise-level platforms.",
        tags: ["IN PROGRESS", "INTERMEDIATE"],
        bgClass: "bg-[#65A391]", // Teal matching reference
        state: "in_progress",
        meta: { time: "12h total", lessons: "14/22 lessons" }
    },
    {
        id: "2",
        title: "Full-Stack Development with Modern Architectures",
        description: "From database design to frontend deployment. Learn the full lifecycle of a digital product.",
        tags: ["ENROLLED", "BEGINNER"],
        bgClass: "bg-[#D9A34A]", // Gold course cover matching reference
        state: "enrolled",
        meta: { rating: "4.9 Rating", learners: "2.4k Learners" }
    },
    {
        id: "3",
        title: "Creative Leadership & Product Management",
        description: "Bridge the gap between design and business. Learn how to lead creative teams effectively.",
        tags: ["RECOMMENDED"],
        bgClass: "bg-[#A7BC93]", // Moss green matching reference
        state: "guest",
        meta: { isPro: true }
    },
    {
        id: "4",
        title: "Unlock 400+ Premium Masterclasses",
        description: "Elevate your skills with direct mentorship from industry giants.",
        tags: ["LEARNOVA PREMIUM"],
        bgClass: "bg-gradient-to-br from-[#E11D48] to-[#9F1239]", // Premium red
        state: "paid",
        meta: {}
    }
];

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = COURSES.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
            {/* Navbar matching reference */}
            <nav className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Learnova</span>
                    <div className="hidden md:flex gap-6 text-sm font-semibold">
                        <Link href="/courses" className="text-gray-500 hover:text-gray-900 transition-colors">Courses</Link>
                        <Link href="/my-courses" className="text-[#F43F5E] border-b-2 border-[#F43F5E] pb-1">My Learning</Link>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search your courses by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F43F5E] transition-all"
                    />
                </div>

                <div className="flex items-center gap-5 text-gray-400">
                    <button className="hover:text-gray-900 transition"><Bell size={20} /></button>
                    <button className="hover:text-gray-900 transition"><HelpCircle size={20} /></button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-800 to-blue-900 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                        <Users size={16} className="text-white opacity-50" />
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">

                {/* Left Sidebar - Profile Panel */}
                <div className="w-full lg:w-[320px] flex-shrink-0">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center sticky top-28">
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-white shadow-sm mx-auto overflow-hidden flex items-center justify-center">
                                {/* Placeholder Avatar */}
                                <Users size={40} className="text-slate-600" />
                            </div>
                            <div className="absolute -bottom-1 right-0 w-8 h-8 bg-[#F43F5E] rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-sm">
                                <Award size={14} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{PROFILE_DATA.name}</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1.5">{PROFILE_DATA.levelName}</p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-[#F9FAFB] rounded-2xl p-4">
                                <div className="text-2xl font-black text-[#F43F5E]">{PROFILE_DATA.points.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">POINTS</div>
                            </div>
                            <div className="bg-[#F9FAFB] rounded-2xl p-4">
                                <div className="text-2xl font-black text-[#F43F5E]">{PROFILE_DATA.badges}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">BADGES</div>
                            </div>
                        </div>

                        <div className="mt-8 text-left px-1">
                            <div className="flex justify-between items-end mb-2.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LEVEL PROGRESS</span>
                                <span className="text-[11px] font-bold text-[#F43F5E]">Achiever soon</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#F43F5E] rounded-full" style={{ width: `${PROFILE_DATA.progress}%` }}></div>
                            </div>
                        </div>

                        <div className="mt-10 text-left px-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ACHIEVEMENTS</span>
                            <div className="flex gap-3 mt-3">
                                <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#F43F5E] transition-colors cursor-pointer">
                                    <Zap size={20} fill="currentColor" />
                                </div>
                                <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[#F43F5E] transition-colors cursor-pointer">
                                    <Calendar size={20} />
                                </div>
                                <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[#F43F5E] transition-colors cursor-pointer">
                                    <MessageSquare size={20} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Course Grid */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-[40px] leading-none font-extrabold text-gray-900 tracking-tight mb-2">My Courses</h1>
                            <p className="text-gray-500 font-medium pb-1">Keep moving forward. You have 3 active courses today.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-200/50 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-semibold transition-colors">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="px-5 py-2.5 bg-[#F43F5E] hover:bg-rose-600 text-white rounded-full text-sm font-semibold transition-colors shadow-sm shadow-rose-200">
                                Find New
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredCourses.map(course => (
                            <div key={course.id} className={`flex flex-col bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 ${course.state === 'paid' ? course.bgClass : ''}`}>

                                {/* Cover Image Area */}
                                {course.state !== 'paid' && (
                                    <div className={`h-[220px] ${course.bgClass} relative p-6 flex flex-col justify-between overflow-hidden`}>
                                        <div className="flex gap-2 relative z-10">
                                            {course.tags.map((tag, i) => (
                                                <span key={i} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${tag.includes("IN PROGRESS") ? 'bg-white text-[#F43F5E] shadow-sm' :
                                                        tag.includes("RECOMMENDED") ? 'bg-[#E11D48] text-white shadow-sm' :
                                                            tag.includes("NEW") ? 'bg-white text-[#F43F5E] shadow-sm' :
                                                                tag.includes("ENROLLED") ? 'bg-white text-gray-600 shadow-sm' :
                                                                    'bg-[#2A2A2A] text-white shadow-sm'
                                                    }`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        {/* Stylized Typography Graphic for Cover */}
                                        <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center opacity-25 pointer-events-none select-none">
                                            <div className="text-center transform -translate-y-2">
                                                <div className="text-[52px] font-black text-white leading-[0.85] tracking-tighter mix-blend-overlay">COURSE</div>
                                                <div className="text-[52px] font-black text-white leading-[0.85] tracking-tighter mix-blend-overlay">COVER</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content Area */}
                                <div className={`p-8 flex flex-col flex-1 ${course.state === 'paid' ? 'text-white relative z-10 justify-center min-h-[400px]' : ''}`}>
                                    {course.state === 'paid' && (
                                        <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-80">
                                            {course.tags[0]}
                                        </div>
                                    )}

                                    <h3 className={`text-[22px] leading-[1.3] font-extrabold mb-3 ${course.state === 'paid' ? 'text-white text-[32px] tracking-tight' : 'text-gray-900'}`}>
                                        {course.title}
                                    </h3>

                                    <p className={`text-sm leading-relaxed mb-6 flex-1 ${course.state === 'paid' ? 'text-white/90' : 'text-gray-500'}`}>
                                        {course.description}
                                    </p>

                                    {course.state !== 'paid' && (
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-gray-900 mb-8 border-t border-gray-100 pt-6">
                                            {course.meta.time && (
                                                <div className="flex items-center gap-1.5"><Clock size={14} className="text-[#F43F5E]" strokeWidth={3} /> {course.meta.time}</div>
                                            )}
                                            {course.meta.lessons && (
                                                <div className="flex items-center gap-1.5"><PlayCircle size={14} className="text-[#F43F5E]" strokeWidth={3} /> {course.meta.lessons}</div>
                                            )}
                                            {course.meta.rating && (
                                                <div className="flex items-center gap-1.5"><Star size={14} className="text-[#F43F5E]" fill="currentColor" /> {course.meta.rating}</div>
                                            )}
                                            {course.meta.learners && (
                                                <div className="flex items-center gap-1.5"><Users size={14} className="text-[#F43F5E]" strokeWidth={3} /> {course.meta.learners}</div>
                                            )}
                                            {course.meta.isPro && (
                                                <div className="flex items-center gap-1.5"><Award size={14} className="text-[#F43F5E]" strokeWidth={3} /> Pro Certificate</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons based on state */}
                                    <button className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98] ${course.state === 'in_progress' ? 'bg-[#F43F5E] hover:bg-rose-600 text-white shadow-lg shadow-rose-200' :
                                            course.state === 'enrolled' ? 'bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200' :
                                                course.state === 'guest' ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' :
                                                    course.state === 'paid' ? 'bg-white text-[#F43F5E] hover:bg-gray-50 shadow-lg' : ''
                                        }`}>
                                        {course.state === 'in_progress' ? 'Continue' :
                                            course.state === 'enrolled' ? 'Start' :
                                                course.state === 'guest' ? 'Join Course' :
                                                    course.state === 'paid' ? 'Buy course' : ''}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <Search size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No courses found</h3>
                            <p className="text-sm">Try adjusting your search criteria.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
