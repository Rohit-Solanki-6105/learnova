"use client";

import React, { use } from "react";
import Link from "next/link";
import {
    Menu,
    ArrowLeft,
    CheckCircle2,
    PlayCircle,
    Lock,
    Circle,
    MessageSquare,
    Download,
    ArrowRight,
    SquareDashed,
    LayoutTemplate,
    FileText,
    Link as LinkIcon,
    MessageCircle
} from "lucide-react";
import { BlocksViewer } from "@/components/Editor";
import { LessonVideoPlayer } from "@/components/LessonVideoPlayer";

const MOCK_LESSON_CONTENT = {
    time: 1711100000000,
    blocks: [
        {
            id: "desc-1",
            type: "header",
            data: { text: "About this lesson", level: 2 }
        },
        {
            id: "desc-2",
            type: "paragraph",
            data: { text: "In this module, we explore how to break the traditional grid while maintaining structural integrity. We’ll dive deep into the principles of <strong>Curated Chaos</strong> and how leading design boutiques use intentional misalignment to create rhythm and brand authority in editorial interfaces." }
        },
        {
            id: "desc-3",
            type: "list",
            data: {
                style: "unordered",
                items: [
                    "Understanding mathematical perfection in asymmetrical layouts.",
                    "Using negative space as a primary design element to guide user focus.",
                    "Balancing heavy typography with minimalist structural boundaries."
                ]
            }
        },
        {
            id: "desc-4",
            type: "warning",
            data: { title: "Important Assignment", message: "Make sure to download the Grid Guidelines PDF before jumping into the Figma template." }
        }
    ],
    version: "2.30.0"
};

export default function LessonPlayerPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
    const resolvedParams = use(params);

    return (
        <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen antialiased flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Top Navigation Anchor */}
            <header className="fixed top-0 z-50 w-full bg-[#f9f9f9] flex justify-between items-center px-6 md:px-8 py-4 border-b border-[#e8e8e8]">
                <div className="flex items-center gap-4">
                    <Menu className="text-[#f3184c] cursor-pointer md:hidden" size={24} />
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        Learnova
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex gap-8 text-[#5d5f5e] text-xs font-bold tracking-widest uppercase">
                        <Link href="/courses" className="hover:text-[#1a1c1c] transition-colors duration-300">Curriculum</Link>
                        <Link href="/my-courses" className="text-[#f3184c]">Progress</Link>
                        <Link href="#" className="hover:text-[#1a1c1c] transition-colors duration-300">Community</Link>
                    </nav>
                    <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        <img
                            alt="User profile"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJedneL-U80t6gSgDSjqjy6kH4CBx3u2n64Ih7mIMyRMhZT_15EqC2NOcP3H-7kRxPnntFPPUfcmbyht9y5dV2HWKE7xrC89Sq1EKaOHfIxoyWwVJt2fVGvYVjh__7V4DaeIOs5PP0NKhbdcFzJfJCvnydKiObLsD2dLX2BAqMb5Gxnc3hN4NKicHyxp0LJpi_dPHYPpHYYRQsk6IXF7flT78Iu25C8geMfa9iUsOP9jdGExLiS-_oYb21znptHXtLsxqj2PxL885V"
                        />
                    </div>
                </div>
            </header>

            {/* Main Layout Container */}
            <div className="flex flex-col md:flex-row pt-[72px] flex-1">

                {/* Sidebar Drawer */}
                <aside className="fixed left-0 top-[72px] bottom-0 z-40 hidden md:flex flex-col w-[320px] bg-[#f3f3f3] overflow-y-auto border-r border-[#e8e8e8]">
                    <div className="p-8">
                        <Link href={`/courses/${resolvedParams.courseId}`} className="flex items-center gap-2 text-[#f3184c] font-bold text-xs uppercase tracking-wider mb-8 hover:-translate-x-1 transition-transform w-fit">
                            <ArrowLeft size={14} />
                            Back to Course
                        </Link>

                        <h2 className="text-xl font-extrabold text-[#1a1c1c] mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            Modern UI Architecture
                        </h2>

                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">Overall Progress</span>
                                <span className="text-xs font-bold text-[#f3184c]">65%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#e2e2e2] rounded-full overflow-hidden">
                                <div className="h-full bg-[#f3184c] rounded-full" style={{ width: "65%" }}></div>
                            </div>
                        </div>

                        {/* Curriculum Modules */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-[0.2em] mb-4">MODULE 01: FUNDAMENTALS</h3>
                                <div className="space-y-1">

                                    {/* Completed Lesson */}
                                    <Link href="#" className="flex items-center gap-4 text-[#5d5f5e] py-4 px-4 hover:translate-x-1 transition-transform duration-200 rounded-xl hover:bg-white/50">
                                        <CheckCircle2 className="text-[#f3184c] shrink-0" size={18} fill="currentColor" stroke="white" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">The Design Philosophy</p>
                                            <p className="text-[10px] font-mono mt-0.5">08:45</p>
                                        </div>
                                    </Link>

                                    {/* Active Lesson */}
                                    <div className="flex items-center gap-4 bg-white text-[#f3184c] rounded-2xl py-4 px-4 shadow-sm border border-white">
                                        <PlayCircle className="shrink-0" size={18} fill="currentColor" stroke="white" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">Grid Systems &amp; Asymmetry</p>
                                            <p className="text-[10px] font-mono mt-0.5">12:30 • In Progress</p>
                                        </div>
                                    </div>

                                    {/* Locked Lesson */}
                                    <div className="flex items-center gap-4 text-[#5d5f5e] opacity-60 py-4 px-4 cursor-not-allowed">
                                        <Lock className="shrink-0" size={16} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Visual Hierarchy Rules</p>
                                            <p className="text-[10px] font-mono mt-0.5">15:10</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-[0.2em] mb-4">MODULE 02: ADVANCED PATTERNS</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-4 text-[#5d5f5e] py-4 px-4 hover:translate-x-1 transition-transform duration-200">
                                        <Circle className="shrink-0" size={16} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Glassmorphism Techniques</p>
                                            <p className="text-[10px] font-mono mt-0.5">10:20</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="mt-auto p-8 pt-0 sticky bottom-0 bg-gradient-to-t from-[#f3f3f3] to-transparent">
                        <button className="w-full flex items-center justify-center gap-3 bg-[#1a1c1c] hover:bg-black text-white py-4 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-xl">
                            <MessageSquare size={16} />
                            Community Discussion
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-[320px] p-6 md:p-12 pb-32">

                    {/* Lesson Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="max-w-2xl">
                            <span className="text-[10px] font-bold text-[#f3184c] uppercase tracking-[0.3em] mb-3 block">LESSON 04</span>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                Grid Systems &amp; Asymmetry
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="flex items-center gap-2 text-[#5d5f5e] hover:bg-[#e8e8e8] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:text-[#f3184c] transition-colors whitespace-nowrap">
                                <Download size={16} />
                                Resources
                            </a>
                            <button className="bg-[#f3184c] hover:bg-[#e01445] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-transform active:scale-95 whitespace-nowrap shrink-0">
                                Next Lesson
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </header>

                    {/* Video Player with Video.js (fullscreen supported) */}
                    <section className="mb-12">
                        <LessonVideoPlayer
                            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                            poster="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2000&auto=format&fit=crop"
                        />
                    </section>

                    {/* Lesson Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Left Content: Description & Editor.js JSON */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Magic! Render Editor.js JSON naturally within the page */}
                            <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#e8e8e8]">
                                <BlocksViewer data={MOCK_LESSON_CONTENT} />
                            </section>

                            {/* Extra Feature Cards generated by Stitch */}
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-white border border-[#e8e8e8] rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.03)] hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                                        <SquareDashed className="text-[#f3184c]" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Golden Ratios</h3>
                                    <p className="text-[#5d5f5e] text-sm leading-relaxed">Applying mathematical perfection to asymmetrical layouts for visual balance.</p>
                                </div>
                                <div className="p-8 bg-white border border-[#e8e8e8] rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.03)] hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-[#f3f3f3] flex items-center justify-center mb-6">
                                        <LayoutTemplate className="text-[#1a1c1c]" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Negative Space</h3>
                                    <p className="text-[#5d5f5e] text-sm leading-relaxed">Using &quot;empty&quot; areas as a primary design element to guide user focus.</p>
                                </div>
                            </section>
                        </div>

                        {/* Right Content: Sidebar Resources */}
                        <div className="space-y-6">

                            <div className="p-8 bg-white border border-[#e8e8e8] rounded-[2rem] shadow-sm">
                                <h3 className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-[0.2em] mb-6">LESSON RESOURCES</h3>
                                <div className="space-y-3">
                                    <a href="#" className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all border border-transparent hover:border-[#f3f3f3]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <FileText className="text-[#f3184c]" size={18} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold block text-[#1a1c1c]">Grid_Guidelines.pdf</span>
                                                <span className="text-[10px] text-[#5d5f5e] uppercase tracking-widest block mt-1">1.2 MB</span>
                                            </div>
                                        </div>
                                    </a>

                                    <a href="#" className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all border border-transparent hover:border-[#f3f3f3]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <LinkIcon className="text-[#1a1c1c]" size={18} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold block text-[#1a1c1c]">Figma Template</span>
                                                <span className="text-[10px] text-[#5d5f5e] uppercase tracking-widest block mt-1">External Link</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div className="p-8 bg-[#111212] text-white rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#f3184c]/20 rounded-full blur-[40px] group-hover:bg-[#f3184c]/30 transition-colors"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-extrabold mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Need help with this module?</h3>
                                    <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">Our mentors are available 24/7 for design critiques and technical advice.</p>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-[#f3184c] flex items-center gap-2 group-hover:text-white transition-colors bg-white/5 py-3 px-5 rounded-full backdrop-blur-sm border border-white/10">
                                        Message Mentor
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-[#e8e8e8] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Link href={`/courses/${resolvedParams.courseId}`} className="flex flex-col items-center justify-center text-[#5d5f5e]">
                    <ArrowLeft size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Go Back</span>
                </Link>
                <div className="flex flex-col items-center justify-center text-[#5d5f5e] relative -top-3">
                    <div className="w-14 h-14 bg-white border border-[#e8e8e8] shadow-lg rounded-full flex items-center justify-center hover:text-[#f3184c] transition-colors">
                        <MessageCircle size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Discuss</span>
                </div>
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#f3184c] text-white rounded-full shadow-lg shadow-rose-500/30 active:scale-95 transition-transform">
                    <ArrowRight size={20} />
                </div>
            </nav>

        </div>
    );
}
