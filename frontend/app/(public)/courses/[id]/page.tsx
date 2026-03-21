"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
    Search,
    Bell,
    ChevronRight,
    Clock,
    BarChart,
    ChevronDown,
    CheckCircle2,
    PlayCircle,
    Circle,
    CircleDot,
    Play,
    Eye,
    BookOpen,
    FolderOpen,
    Award,
    InfinityIcon,
    Star,
    Lock,
    Unlock
} from "lucide-react";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const courseId = resolvedParams.id;

    // Toggle for demonstrating both states (Guest/Invited vs Enrolled)
    const [isEnrolled, setIsEnrolled] = useState(false);

    return (
        <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Dev Toggle (To rapidly test state transitions) */}
            <div className="fixed bottom-6 left-6 z-50 bg-[#1a1c1c] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/20">
                <span className="text-xs font-mono uppercase tracking-widest text-[#a0a0a0]">Dev State:</span>
                <button
                    onClick={() => setIsEnrolled(!isEnrolled)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${isEnrolled ? 'bg-[#f3184c] text-white' : 'bg-white/10 text-[#a0a0a0] hover:text-white'}`}
                >
                    {isEnrolled ? "Enrolled View" : "Guest View"}
                </button>
            </div>

            {/* Top Navigation Bar */}
            <nav className="bg-[#f9f9f9] top-0 sticky z-50 transition-all">
                <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            Learnova
                        </Link>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            <Link href="/courses" className="text-[#f3184c] border-b-2 border-[#f3184c] pb-1 font-bold">Courses</Link>
                            <Link href="/my-courses" className="text-[#5f5e5e] hover:text-[#1a1c1c] transition-colors">My Learning</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-[#e8e8e8] rounded-full px-4 py-2 w-64">
                            <Search className="text-[#5f5e5e] text-sm mr-2" size={18} />
                            <input
                                className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder:text-[#5f5e5e] outline-none"
                                placeholder="Search courses..."
                                type="text"
                            />
                        </div>
                        {isEnrolled ? (
                            <>
                                <button className="relative hover:opacity-80 transition-opacity duration-200">
                                    <Bell className="text-[#1a1c1c]" size={20} />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f3184c] rounded-full ring-2 ring-[#f9f9f9]"></span>
                                </button>
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                                    <img
                                        alt="User Avatar"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1AxIHL6ga2_TIIz71kw1EuDdtvVaFCZWsl08eIaWwZLeF8IgxSZr0aXzywVe9-7pszBDTrWqsh3j7pmgEw9ACvWuD9ByxxKFLM3-lcsvGrZqC_Ehe9z40MxoA8EiEGH-PwbUjSlKRuM7U8OSbxJpYmP56gvcZVX3zExmeZuHWZD7aTAMTW1I2le8GT_vLJU3y4Ft6dh45aynGhHPtxu3L8DIxZkUSKA5NHtDDIKvH5QoTmdmTN26m5gqlL641OegAW4j7SDPklaD0"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-bold text-[#1a1c1c] hover:text-[#f3184c] transition-colors">Log In</Link>
                                <Link href="/register" className="px-5 py-2 bg-[#f3184c] text-white rounded-full text-sm font-bold hover:bg-[#e01445] transition-colors">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-[#e8e8e8] h-[1px] w-full"></div>
            </nav>

            <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 flex flex-col lg:flex-row gap-12">
                {/* Left Column (70%) */}
                <div className="w-full lg:w-[70%]">

                    {/* Breadcrumbs */}
                    <nav className="flex text-xs font-bold tracking-widest uppercase text-[#5f5e5e] mb-6 gap-2 items-center flex-wrap">
                        <Link href="/courses" className="hover:text-[#1a1c1c] transition-colors">Courses</Link>
                        <ChevronRight size={12} />
                        <span className="hover:text-[#1a1c1c] transition-colors cursor-pointer">Design</span>
                        <ChevronRight size={12} />
                        <span className="text-[#1a1c1c]">UI/UX Professional</span>
                    </nav>

                    {/* Hero Section */}
                    <header className="mb-12">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-8" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            Mastering Advanced <br />
                            <span className="text-[#f3184c]">Interface Systems</span>
                        </h1>

                        <p className="text-lg text-[#5f5e5e] max-w-2xl mb-8 leading-relaxed">
                            Elevate your design career by learning how to build scalable, production-ready design systems that bridge the gap between creative vision and engineering reality.
                        </p>

                        <div className="flex flex-wrap items-center gap-8 text-sm">
                            <div className="flex items-center gap-3">
                                <img
                                    alt="Instructor"
                                    className="w-10 h-10 rounded-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKOzyfXsqq4df9zMI47z2qbYNo2SBG9Szov_vqvZoisTPmzg9M87FqOWI1ZvTA4yx-x-0mwOixzRUcAK7OqAyboe74WaL0Z7-xxUL0c4daOEbUYEAaMtwabD6ymaXsOed96F-h8laSB_rrH_7G24vrxes5wBZYpBvoWi-fG-YkB8N135QA2R46UaWhHrKOOR5Vy3QWlz0Zc8uRLdbUHGcg-BHdKtz02nuJdd7sWKwwB0UIVqZdfiWobnNZv64seIMdOiM6iWtbWeA"
                                />
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">Instructor</p>
                                    <p className="font-semibold text-[#1a1c1c]">Julian Sterling</p>
                                </div>
                            </div>

                            <div className="h-8 w-[1px] bg-[#e8e8e8] hidden sm:block"></div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                    <Clock className="text-[#f3184c]" size={16} />
                                </div>
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">Duration</p>
                                    <p className="font-semibold text-[#1a1c1c]">12h 45m</p>
                                </div>
                            </div>

                            <div className="h-8 w-[1px] bg-[#e8e8e8] hidden sm:block"></div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                    <BarChart className="text-[#f3184c]" size={16} />
                                </div>
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">Level</p>
                                    <p className="font-semibold text-[#1a1c1c]">Advanced</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dynamic Progress / Insight Card */}
                    <section className="bg-white rounded-[2rem] py-6 px-6 sm:px-10 shadow-[0_10px_30px_rgba(30,30,30,0.04)] mb-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/50 relative overflow-hidden transition-all duration-300">
                        {isEnrolled ? (
                            <>
                                <div className="flex-1 w-full relative z-10 animate-in fade-in zoom-in duration-300">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-[#f3184c]">Current Journey</span>
                                        <span className="font-bold text-xl sm:text-2xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                            Overall Progress 65%
                                        </span>
                                    </div>
                                    <div className="h-4 w-full bg-[#e8e8e8] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#f3184c] rounded-full w-[65%] shadow-[0_0_15px_rgba(243,24,76,0.3)]"></div>
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap hidden md:block border-l border-[#e8e8e8] pl-8 relative z-10 animate-in fade-in duration-500 delay-100">
                                    <p className="text-[#5f5e5e] text-sm mb-1">Total Lessons: <span className="font-bold text-[#1a1c1c]">48</span></p>
                                    <p className="text-[#5f5e5e] text-sm">Completed: <span className="font-bold text-[#1a1c1c]">31</span></p>
                                    <p className="text-[10px] font-bold mt-2 text-[#f3184c] uppercase tracking-wider">17 Incomplete</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 w-full relative z-10 animate-in fade-in zoom-in duration-300">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-[#f3184c]">Course Insight</span>
                                        <span className="font-bold text-xl sm:text-2xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                            Ready to master design systems?
                                        </span>
                                    </div>
                                    <p className="text-[#5f5e5e] text-sm leading-relaxed max-w-lg mb-2">
                                        Join over 2,400+ students taking this curriculum. Understand everything from the anatomy of design tokens to scalable enterprise handover workflows.
                                    </p>
                                </div>
                                <div className="text-right whitespace-nowrap hidden md:block border-l border-[#e8e8e8] pl-8 relative z-10 animate-in fade-in duration-500 delay-100">
                                    <p className="text-[#5f5e5e] text-sm mb-1">Total Lessons: <span className="font-bold text-[#1a1c1c]">48</span></p>
                                    <p className="text-[#5f5e5e] text-sm">Downloadables: <span className="font-bold text-[#1a1c1c]">12</span></p>
                                    <p className="text-[10px] font-bold mt-2 text-[#f3184c] uppercase tracking-wider">No Prerequisites</p>
                                </div>
                            </>
                        )}
                    </section>

                    {/* Content Tabs */}
                    <div className="flex gap-8 sm:gap-10 border-b border-[#e8e8e8] mb-10 overflow-x-auto no-scrollbar">
                        <button className="pb-4 text-sm font-bold border-b-2 border-[#f3184c] text-[#1a1c1c] whitespace-nowrap">Overview</button>
                        <button className="pb-4 text-sm font-semibold text-[#5f5e5e] hover:text-[#1a1c1c] whitespace-nowrap transition-colors">Ratings &amp; Reviews</button>
                        <button className="pb-4 text-sm font-semibold text-[#5f5e5e] hover:text-[#1a1c1c] whitespace-nowrap transition-colors">Resources</button>
                    </div>

                    {/* Course Content */}
                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>Course Content</h2>
                                <span className="bg-[#e2e2e2] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight text-[#1a1c1c]">48 lessons total</span>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]" size={18} />
                                <input
                                    className="w-full bg-[#f3f3f3] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#f3184c]/20 outline-none transition-all"
                                    placeholder="Search lesson by name..."
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Module Accordion */}
                        <div className="space-y-4">

                            {/* Module 1 */}
                            <div className="bg-[#f3f3f3] md:bg-white md:border md:border-[#f3f3f3] rounded-[1.5rem] overflow-hidden">
                                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#f3f3f3] transition-colors">
                                    <div className="flex items-center gap-5">
                                        <span className="w-10 h-10 flex items-center justify-center bg-[#f3184c] text-white rounded-xl text-sm font-bold shadow-md shadow-rose-200">01</span>
                                        <h3 className="font-bold text-lg text-[#1a1c1c]">Foundations of Systematic Design</h3>
                                    </div>
                                    <ChevronDown className="text-[#1a1c1c]" size={20} />
                                </div>

                                <div className="px-6 pb-6 pt-2 space-y-2">
                                    {/* Lesson 1 */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 hover:bg-white rounded-2xl transition-all group border border-transparent hover:border-[#e8e8e8] shadow-sm cursor-pointer">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                                {isEnrolled ? (
                                                    <CheckCircle2 className="text-[#f3184c]" size={18} />
                                                ) : (
                                                    <Unlock className="text-[#f3184c]" size={16} />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-[#1a1c1c]">The Anatomy of a Design Token</span>
                                            {!isEnrolled && (
                                                <span className="text-[10px] font-black uppercase text-white bg-[#5f5e5e] px-2 py-0.5 rounded shadow-sm opacity-60">Preview</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 ml-12 sm:ml-0">
                                            <span className="text-xs text-[#5f5e5e] font-mono tracking-tighter bg-[#f9f9f9] px-2 py-1 rounded-md border border-[#e8e8e8]">12:45</span>
                                            {isEnrolled || true ? ( // Free preview, so play icon works for guests
                                                <PlayCircle className="text-[#f3184c] opacity-80 group-hover:opacity-100 transition-opacity" size={20} />
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Lesson 2 */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 hover:bg-white rounded-2xl transition-all group border border-transparent hover:border-[#e8e8e8] cursor-pointer">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="w-8 h-8 rounded-full bg-[#e8e8e8] flex items-center justify-center shrink-0">
                                                {isEnrolled ? (
                                                    <Circle className="text-[#5f5e5e]" size={16} />
                                                ) : (
                                                    <Lock className="text-[#a0a0a0]" size={16} />
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${isEnrolled ? 'text-[#1a1c1c]' : 'text-[#a0a0a0]'}`}>Atomic Methodology in Practice</span>
                                        </div>
                                        <div className="flex items-center gap-4 ml-12 sm:ml-0">
                                            <span className="text-xs text-[#5f5e5e] font-mono tracking-tighter bg-[#f9f9f9] px-2 py-1 rounded-md border border-[#e8e8e8]">18:20</span>
                                            {isEnrolled && (
                                                <PlayCircle className="text-[#5f5e5e] group-hover:text-[#1a1c1c] transition-colors" size={20} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Lesson 3 */}
                                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 ${isEnrolled ? 'bg-rose-50/50 hover:bg-rose-100/50 border border-rose-100' : 'hover:bg-white hover:border-[#e8e8e8] border border-transparent'} rounded-2xl transition-all group cursor-pointer`}>
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className={`w-8 h-8 rounded-full ${isEnrolled ? 'bg-white border border-[#f3184c] shadow-sm' : 'bg-[#e8e8e8]'} flex items-center justify-center shrink-0`}>
                                                {isEnrolled ? (
                                                    <CircleDot className="text-[#f3184c]" size={14} />
                                                ) : (
                                                    <Lock className="text-[#a0a0a0]" size={16} />
                                                )}
                                            </div>
                                            <span className={`text-sm ${isEnrolled ? 'font-bold text-[#f3184c]' : 'font-medium text-[#a0a0a0]'}`}>Naming Conventions and Semantics</span>
                                        </div>
                                        <div className="flex items-center gap-4 ml-12 sm:ml-0">
                                            {isEnrolled && (
                                                <span className="text-[10px] font-black uppercase text-[#f3184c] tracking-widest bg-white px-2 py-1 rounded-md shadow-sm">In Progress</span>
                                            )}
                                            <span className="text-xs text-[#5f5e5e] font-mono tracking-tighter bg-[#f9f9f9] px-2 py-1 rounded-md border border-[#e8e8e8]">24:10</span>
                                            {isEnrolled && (
                                                <PlayCircle className="text-[#f3184c]" size={20} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Module 2 */}
                            <div className="bg-white border border-[#f3f3f3] rounded-[1.5rem] overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
                                <div className="flex items-center justify-between p-6 cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <span className="w-10 h-10 flex items-center justify-center bg-[#f3f3f3] text-[#1a1c1c] rounded-xl text-sm font-bold">02</span>
                                        <h3 className="font-bold text-lg text-[#1a1c1c]">Scalable Typography Systems</h3>
                                    </div>
                                    <ChevronDown className="text-[#1a1c1c] -rotate-90" size={20} />
                                </div>
                            </div>

                        </div>
                    </section>
                </div>

                {/* Right Column (30%) - Sticky Sidebar */}
                <aside className="w-full lg:w-[30%]">
                    <div className="sticky top-24 space-y-8">

                        {/* Video Preview Card */}
                        <div className="relative group rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-[#e0eae3]">
                            <img
                                alt="Video Preview"
                                className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-all duration-700 hover:scale-105"
                                src="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2000&auto=format&fit=crop"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <button className="w-16 h-16 bg-[#f3184c] text-white rounded-full flex items-center justify-center shadow-2xl scale-100 hover:scale-110 transition-transform">
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm">
                                <Eye className="text-[#f3184c]" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1c1c]">Preview this course</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button className="w-full bg-[#f3184c] text-white py-5 rounded-full font-bold text-lg shadow-[0_15px_35px_rgba(243,24,76,0.25)] hover:shadow-[0_20px_45px_rgba(243,24,76,0.35)] hover:bg-[#e01445] transition-all active:scale-95" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {isEnrolled ? "Continue Learning" : "Enroll Now - $49"}
                        </button>

                        {!isEnrolled && (
                            <p className="text-center text-[11px] font-medium text-[#5f5e5e] uppercase tracking-widest mt-[-1rem]">
                                30-Day Money-Back Guarantee
                            </p>
                        )}

                        {/* Feature List */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.03)] space-y-6">
                            <h4 className="text-xs uppercase font-black tracking-[0.2em] text-[#5f5e5e]">Course Features</h4>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <BookOpen className="text-[#f3184c]" size={16} />
                                    </div>
                                    48 Lessons
                                </li>
                                <li className="flex items-center gap-4 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <FolderOpen className="text-[#f3184c]" size={16} />
                                    </div>
                                    12 Downloadable Resources
                                </li>
                                <li className="flex items-center gap-4 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <Award className="text-[#f3184c]" size={16} />
                                    </div>
                                    Professional Certificate
                                </li>
                                <li className="flex items-center gap-4 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <InfinityIcon className="text-[#f3184c]" size={16} />
                                    </div>
                                    Lifetime Access
                                </li>
                            </ul>
                        </div>

                        {/* Feedback Card */}
                        <div className="bg-[#111212] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f3184c]/20 blur-[50px] rounded-full pointer-events-none"></div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a0a0a0] mb-2">Student Feedback</p>
                                    <h4 className="text-6xl font-black text-[#f3184c]" style={{ fontFamily: "'Manrope', sans-serif" }}>4.9</h4>
                                </div>
                                <div className="flex flex-col items-end gap-1 mt-2">
                                    <div className="flex gap-1 text-[#f3184c]">
                                        <Star size={14} fill="currentColor" />
                                        <Star size={14} fill="currentColor" />
                                        <Star size={14} fill="currentColor" />
                                        <Star size={14} fill="currentColor" />
                                        <Star size={14} fill="currentColor" />
                                    </div>
                                    <span className="text-xs text-[#a0a0a0]">Based on 1.2k reviews</span>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-[#a0a0a0] w-12 tracking-widest uppercase">5 Stars</span>
                                    <div className="flex-1 h-1.5 bg-[#ffffff]/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#f3184c] w-[92%] shadow-[0_0_10px_rgba(243,24,76,0.5)]"></div>
                                    </div>
                                    <span className="text-xs font-mono text-white">92%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-[#a0a0a0] w-12 tracking-widest uppercase">4 Stars</span>
                                    <div className="flex-1 h-1.5 bg-[#ffffff]/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#f3184c]/60 w-[6%]"></div>
                                    </div>
                                    <span className="text-xs font-mono text-white">6%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-[#a0a0a0] w-12 tracking-widest uppercase">3 Stars</span>
                                    <div className="flex-1 h-1.5 bg-[#ffffff]/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#f3184c]/40 w-[2%]"></div>
                                    </div>
                                    <span className="text-xs font-mono text-white">2%</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.03)]">
                            <h4 className="text-xs uppercase font-black tracking-[0.2em] text-[#5f5e5e] mb-6">Recent Reviews</h4>

                            <div className="space-y-6 mb-8">
                                <div className="space-y-3 pb-6 border-b border-[#f3f3f3]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                alt="Marcus Aris"
                                                className="w-8 h-8 rounded-full border border-[#e8e8e8]"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiIG8m6mT3yzl7tAgcMQBeRihx91eRP0RcFkl8v-hAlJlJY8JB7RKybI0NAxs6VxdgoxoTYT984T4lRWosIOZylm0orHEi8Og6GjOb9PiO68Hx9qWeIUeUds52HTXkK-mZbGeIUwpdb-IThEy1fxIZglSXP_nBsN5tgJFAZGLvQY6FEhxPaqULgSWAKY087qkp3d4Ov0U6dISqHhqjAYE7NQwMy2J4KhP2VrZCOdQnTvY2tl9hoW9gOmn3IPmwdLPov_QUKT_wJFWz"
                                            />
                                            <span className="text-sm font-bold text-[#1a1c1c]">Marcus Aris</span>
                                        </div>
                                        <div className="flex text-[#f3184c]">
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#5f5e5e] leading-relaxed">The modular approach to design systems here is absolute genius. Highly recommended for senior designers looking to level up.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                alt="Elena Voss"
                                                className="w-8 h-8 rounded-full border border-[#e8e8e8]"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqLGf2aCZj0MyyNLPDWaSFwX_m7vxR2MlrHf3EUbmEkZP6KX0DFy4RksQy0TD4U1CUVtDh_EVq482wdTVZEt9A4cSh-_smx07D-WSv8GgDXI9ivtDVT5BRt7w1AX-o7lRUpesHDf5SPHSz07W4GAZz4m7Ox_ghwscoq5olpzQvnKjcCgNuR0f7xyp9DyxdAei4xDZ5xGwVcuglqA8Lmfk4HVwHEGNOl3J_LVpKO_9CvpFq33FUq9BMJTow4IP59MQBT5Y5cR0R6xSd"
                                            />
                                            <span className="text-sm font-bold text-[#1a1c1c]">Elena Voss</span>
                                        </div>
                                        <div className="flex text-[#f3184c]">
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#5f5e5e] leading-relaxed">Finally a course that goes beyond Figma basics and into real architectural systems. Brilliant structure.</p>
                                </div>
                            </div>

                            <button className="w-full border-2 border-[#f3184c] text-[#f3184c] py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#f3184c] hover:text-white transition-colors">
                                Add Review
                            </button>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-[#e8e8e8] py-12 bg-white">
                <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <Link href="/" className="text-xl font-black tracking-tighter text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        Learnova
                    </Link>
                    <p className="text-sm text-[#5f5e5e] font-medium">© 2024 Academic Atelier. All rights reserved.</p>
                    <div className="flex gap-8 text-sm font-bold text-[#5f5e5e]">
                        <Link href="#" className="hover:text-[#f3184c] transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-[#f3184c] transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-[#f3184c] transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
