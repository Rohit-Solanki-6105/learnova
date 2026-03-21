"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
    Menu,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    PlayCircle,
    Lock,
    Circle,
    MessageSquare,
    MessageCircle,
} from "lucide-react";
import { LearnerQuizPlayer } from "@/components/LearnerQuizPlayer";
import type { QuizData } from "@/components/Quiz";

// Mock quiz data for demo (matches QuizData interface)
const MOCK_QUIZ: QuizData = {
    quizTitle: "Module 1 Assessment: Design Systems Foundation",
    quizSynopsis: "Test your knowledge on design tokens, component architecture, and documentation standards.",
    questions: [
        {
            question: "Which Gestalt principle describes the tendency to perceive objects that are close to each other as a single group?",
            answers: ["Similarity", "Proximity", "Continuity", "Closure"],
            correctAnswer: "2",
            messageForCorrectAnswer: "Correct!",
            messageForIncorrectAnswer: "Incorrect.",
            explanation: "Proximity groups elements that are near each other.",
        },
        {
            question: "What is a design token in the context of design systems?",
            answers: [
                "A visual asset like an icon",
                "A named variable storing a design decision (color, spacing, etc.)",
                "A CSS class name",
                "A component library",
            ],
            correctAnswer: "2",
            messageForCorrectAnswer: "Correct!",
            messageForIncorrectAnswer: "Incorrect.",
            explanation: "Design tokens are named entities that store design decisions.",
        },
        {
            question: "Which file format is commonly used for design token distribution?",
            answers: ["JPEG", "JSON", "MP4", "SVG"],
            correctAnswer: "2",
            messageForCorrectAnswer: "Correct!",
            messageForIncorrectAnswer: "Incorrect.",
            explanation: "JSON is the standard format for design token exchange.",
        },
    ],
};

export default function QuizPlayerPage({
    params,
}: {
    params: Promise<{ courseId: string; quizId: string }>;
}) {
    const resolvedParams = use(params);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [pointsEarned, setPointsEarned] = useState<number | null>(null);
    const [showPointsPopup, setShowPointsPopup] = useState(false);

    const handleQuizComplete = (result: {
        correctPoints: number;
        totalPoints: number;
    }) => {
        setQuizCompleted(true);
        // Points earned based on attempt (simplified: correct answers = points)
        setPointsEarned(result.correctPoints);
        setShowPointsPopup(true);
    };

    return (
        <div
            className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen antialiased flex flex-col"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Top Navigation */}
            <header className="fixed top-0 z-50 w-full bg-[#f9f9f9] flex justify-between items-center px-6 md:px-8 py-4 border-b border-[#e8e8e8]">
                <div className="flex items-center gap-4">
                    <Menu className="text-[#f3184c] cursor-pointer md:hidden" size={24} />
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tighter text-[#1a1c1c]"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Learnova
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex gap-8 text-[#5d5f5e] text-xs font-bold tracking-widest uppercase">
                        <Link href="/courses" className="hover:text-[#1a1c1c] transition-colors duration-300">
                            Curriculum
                        </Link>
                        <Link href="/my-courses" className="text-[#f3184c]">
                            Progress
                        </Link>
                        <Link href="#" className="hover:text-[#1a1c1c] transition-colors duration-300">
                            Community
                        </Link>
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

            {/* Main Layout */}
            <div className="flex flex-col md:flex-row pt-[72px] flex-1">
                {/* Sidebar */}
                <aside className="fixed left-0 top-[72px] bottom-0 z-40 hidden md:flex flex-col w-[320px] bg-[#f3f3f3] overflow-y-auto border-r border-[#e8e8e8]">
                    <div className="p-8">
                        <Link
                            href={`/courses/${resolvedParams.courseId}`}
                            className="flex items-center gap-2 text-[#f3184c] font-bold text-xs uppercase tracking-wider mb-8 hover:-translate-x-1 transition-transform w-fit"
                        >
                            <ArrowLeft size={14} />
                            Back to Course
                        </Link>

                        <h2
                            className="text-xl font-extrabold text-[#1a1c1c] mb-6"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Modern UI Architecture
                        </h2>

                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">
                                    Overall Progress
                                </span>
                                <span className="text-xs font-bold text-[#f3184c]">65%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#e2e2e2] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#f3184c] rounded-full"
                                    style={{ width: "65%" }}
                                />
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-[0.2em] mb-4">
                                    MODULE 01: FUNDAMENTALS
                                </h3>
                                <div className="space-y-1">
                                    <Link
                                        href="#"
                                        className="flex items-center gap-4 text-[#5d5f5e] py-4 px-4 hover:translate-x-1 transition-transform duration-200 rounded-xl hover:bg-white/50"
                                    >
                                        <CheckCircle2
                                            className="text-[#f3184c] shrink-0"
                                            size={18}
                                            fill="currentColor"
                                            stroke="white"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">The Design Philosophy</p>
                                            <p className="text-[10px] font-mono mt-0.5">08:45</p>
                                        </div>
                                    </Link>

                                    {/* Quiz item - tick when completed */}
                                    <div className="flex items-center gap-4 bg-white text-[#f3184c] rounded-2xl py-4 px-4 shadow-sm border border-white">
                                        {quizCompleted ? (
                                            <CheckCircle2
                                                className="text-[#f3184c] shrink-0"
                                                size={18}
                                                fill="currentColor"
                                                stroke="white"
                                            />
                                        ) : (
                                            <PlayCircle className="shrink-0" size={18} fill="currentColor" stroke="white" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">Module 1 Quiz</p>
                                            <p className="text-[10px] font-mono mt-0.5">
                                                {quizCompleted ? "Completed" : "In Progress"}
                                            </p>
                                        </div>
                                    </div>

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
                                <h3 className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-[0.2em] mb-4">
                                    MODULE 02: ADVANCED PATTERNS
                                </h3>
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

                    <div className="mt-auto p-8 pt-0 sticky bottom-0 bg-gradient-to-t from-[#f3f3f3] to-transparent">
                        <button className="w-full flex items-center justify-center gap-3 bg-[#1a1c1c] hover:bg-black text-white py-4 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-xl">
                            <MessageSquare size={16} />
                            Community Discussion
                        </button>
                    </div>
                </aside>

                {/* Main Content - Quiz in full-screen player */}
                <main className="flex-1 md:ml-[320px] p-6 md:p-12 pb-32">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="max-w-2xl">
                            <span className="text-[10px] font-bold text-[#f3184c] uppercase tracking-[0.3em] mb-3 block">
                                QUIZ
                            </span>
                            <h1
                                className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1c]"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                {MOCK_QUIZ.quizTitle}
                            </h1>
                        </div>
                    </header>

                    <section className="min-h-[400px]">
                        <LearnerQuizPlayer quiz={MOCK_QUIZ} onComplete={handleQuizComplete} />
                    </section>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-[#e8e8e8] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Link
                    href={`/courses/${resolvedParams.courseId}`}
                    className="flex flex-col items-center justify-center text-[#5d5f5e]"
                >
                    <ArrowLeft size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">Go Back</span>
                </Link>
                <div className="flex flex-col items-center justify-center text-[#5d5f5e] relative -top-3">
                    <div className="w-14 h-14 bg-white border border-[#e8e8e8] shadow-lg rounded-full flex items-center justify-center hover:text-[#f3184c] transition-colors">
                        <MessageCircle size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Discuss</span>
                </div>
            </nav>

            {/* Points Earned Popup (B7) */}
            {showPointsPopup && pointsEarned !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full bg-[#f3184c]/10 flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl font-black text-[#f3184c]">{pointsEarned}</span>
                        </div>
                        <h2
                            className="text-2xl font-extrabold text-[#1a1c1c] mb-2"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            You have earned {pointsEarned} points!
                        </h2>
                        <p className="text-[#5d5f5e] text-sm mb-6">
                            Progress to next rank will be shown here.
                        </p>
                        <button
                            onClick={() => setShowPointsPopup(false)}
                            className="w-full bg-[#f3184c] hover:bg-[#e01445] text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            Continue
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
