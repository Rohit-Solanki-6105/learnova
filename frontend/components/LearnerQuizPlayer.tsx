"use client";

import React, { useState } from "react";
import { PlayCircle, HelpCircle, ArrowRight } from "lucide-react";
import type { QuizData } from "./Quiz";

export interface LearnerQuizPlayerProps {
    quiz: QuizData;
    onComplete?: (result: { correctPoints: number; totalPoints: number }) => void;
}

/**
 * Quiz player for learners inside the full-screen player.
 * Matches Stitch/Learnova Academic Atelier design system.
 * Flow: Intro → Questions (one per page) → Complete
 */
export function LearnerQuizPlayer({ quiz, onComplete }: LearnerQuizPlayerProps) {
    const [phase, setPhase] = useState<"intro" | "questions" | "complete">("intro");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState<number | null>(null);

    const questions = quiz.questions ?? [];
    const totalQuestions = questions.length;
    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === totalQuestions - 1;

    if (totalQuestions === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#f9f9f9] rounded-[2rem] p-12">
                <HelpCircle className="text-[#5d5f5e] mb-4" size={48} />
                <p className="text-[#5d5f5e] text-center font-medium">
                    No questions available for this quiz yet.
                </p>
            </div>
        );
    }

    // —— Quiz Intro Screen (Stitch design) ——
    if (phase === "intro") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.06)] p-10 md:p-14 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#f3184c]/10 flex items-center justify-center mb-6">
                        <PlayCircle className="text-[#f3184c]" size={32} />
                    </div>
                    <span className="text-[10px] font-bold text-[#f3184c] uppercase tracking-[0.2em] mb-3">
                        Quiz
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f3184c]/10 text-[#f3184c] text-xs font-bold uppercase tracking-wider mb-6">
                        Multiple attempts
                    </span>
                    <h1
                        className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] mb-4"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        {quiz.quizTitle}
                    </h1>
                    {quiz.quizSynopsis && (
                        <p className="text-[#5d5f5e] text-sm leading-relaxed mb-8 max-w-md">
                            {quiz.quizSynopsis}
                        </p>
                    )}
                    <p className="text-[#5d5f5e] text-sm font-medium mb-8">
                        {totalQuestions} Question{totalQuestions !== 1 ? "s" : ""}
                    </p>
                    <button
                        onClick={() => setPhase("questions")}
                        className="bg-[#f3184c] hover:bg-[#e01445] text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-transform active:scale-95"
                    >
                        Start Quiz
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // —— Completion Screen ——
    if (phase === "complete") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.06)] p-10 md:p-14 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2
                        className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] mb-2"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Quiz Completed!
                    </h2>
                    <div className="text-5xl font-black text-[#f3184c] my-6">
                        {finalScore ?? score}{" "}
                        <span className="text-2xl text-[#5d5f5e] font-bold">
                            / {totalQuestions}
                        </span>
                    </div>
                    <p className="text-[#5d5f5e] font-medium">
                        You have completed the assessment for <b>{quiz.quizTitle}</b>.
                    </p>
                    {onComplete && (
                        <p className="text-[#5d5f5e] text-sm mt-4">
                            You will earn points based on your attempt.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // —— Question Page (Stitch design: one question per page) ——
    if (!question) return null;

    const handleProceed = () => {
        if (selectedAnswer === null) return;

        const isCorrect =
            String(selectedAnswer) === String(question.correctAnswer);
        const newScore = isCorrect ? score + 1 : score;
        if (isCorrect) setScore((s) => s + 1);

        if (isLastQuestion) {
            setFinalScore(newScore);
            setPhase("complete");
            onComplete?.({
                correctPoints: newScore,
                totalPoints: totalQuestions,
            });
        } else {
            setCurrentIndex((i) => i + 1);
            setSelectedAnswer(null);
        }
    };

    const labels = ["A", "B", "C", "D", "E", "F"];

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.06)] p-6 md:p-10">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-bold text-[#f3184c] uppercase tracking-widest">
                        Question {currentIndex + 1} of {totalQuestions}
                    </span>
                </div>

                <h3
                    className="text-xl md:text-2xl font-bold text-[#1a1c1c] mb-8 leading-relaxed"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                    {question.question}
                </h3>

                <div className="space-y-4 mb-10">
                    {(question.answers ?? []).map((ans: string, i: number) => {
                        const answerIndex = String(i + 1);
                        const isSelected = selectedAnswer === answerIndex;

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedAnswer(answerIndex)}
                                className={`w-full text-left p-5 rounded-2xl transition-all font-medium text-sm md:text-base flex items-center gap-4 ${
                                    isSelected
                                        ? "bg-[#f3184c] text-white shadow-lg shadow-rose-500/20"
                                        : "bg-[#f3f3f3] text-[#1a1c1c] hover:bg-[#e8e8e8]"
                                }`}
                            >
                                <span
                                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                        isSelected
                                            ? "bg-white/20 text-white"
                                            : "bg-white text-[#5d5f5e]"
                                    }`}
                                >
                                    {labels[i] ?? i + 1}
                                </span>
                                <span>{ans}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleProceed}
                        disabled={selectedAnswer === null}
                        className="bg-[#f3184c] hover:bg-[#e01445] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-transform active:scale-95 disabled:active:scale-100"
                    >
                        {isLastQuestion
                            ? "Proceed and Complete Quiz"
                            : "Proceed"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
