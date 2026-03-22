"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Circle,
    Loader2,
    PlayCircle,
} from "lucide-react";

import LearnovaQuiz, { type QuizData, type QuizQuestion } from "@/components/Quiz";
import { fetchWithAuth } from "@/lib/auth";
import {
    buildLearningItems,
    calculateCourseProgress,
    type LearningCourse,
    type LearningItem,
    type UserProgressEntry,
    type UserQuizAttemptEntry,
} from "@/lib/learning";

interface Enrollment {
    id: number;
    course: number;
    user: number;
    status: number;
}

interface QuizAttemptResponse {
    id: number;
    quiz: number;
}

function getLearningItemHref(courseId: number, item: LearningItem): string {
    if (item.kind === "quiz") {
        return `/learn/${courseId}/quizzes/${item.id}`;
    }
    return `/learn/${courseId}/${item.id}`;
}

function normalizeQuestion(raw: unknown): QuizQuestion | null {
    if (!raw || typeof raw !== "object") return null;

    const questionObj = raw as Record<string, unknown>;
    const answers = Array.isArray(questionObj.answers)
        ? questionObj.answers.map((a) => String(a))
        : [];

    if (!questionObj.question || answers.length === 0) {
        return null;
    }

    return {
        question: String(questionObj.question),
        questionType:
            questionObj.questionType === "photo" ? "photo" : "text",
        answerSelectionType:
            questionObj.answerSelectionType === "multiple" ? "multiple" : "single",
        answers,
        correctAnswer: (questionObj.correctAnswer as string | string[]) ?? "1",
        messageForCorrectAnswer:
            String(questionObj.messageForCorrectAnswer ?? "Correct!"),
        messageForIncorrectAnswer:
            String(questionObj.messageForIncorrectAnswer ?? "Incorrect."),
        explanation: String(questionObj.explanation ?? ""),
        points: Number(questionObj.points ?? 1),
        questionPic:
            typeof questionObj.questionPic === "string"
                ? questionObj.questionPic
                : undefined,
    };
}

function normalizeQuizData(
    raw: unknown,
    title: string,
    description: string
): QuizData {
    if (raw && typeof raw === "object") {
        const quizObj = raw as Record<string, unknown>;
        const normalizedQuestions = Array.isArray(quizObj.questions)
            ? quizObj.questions
                  .map((q) => normalizeQuestion(q))
                  .filter((q): q is QuizQuestion => q !== null)
            : [];

        if (normalizedQuestions.length > 0) {
            return {
                quizTitle: String(quizObj.quizTitle ?? title),
                quizSynopsis: String(quizObj.quizSynopsis ?? description ?? ""),
                questions: normalizedQuestions,
            };
        }
    }

    return {
        quizTitle: title,
        quizSynopsis: description ?? "",
        questions: [],
    };
}

export default function QuizPlayerPage({
    params,
}: {
    params: Promise<{ courseId: string; quizId: string }>;
}) {
    const resolvedParams = use(params);
    const courseId = resolvedParams.courseId;
    const quizId = resolvedParams.quizId;

    const router = useRouter();

    const [course, setCourse] = useState<LearningCourse | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [progressEntries, setProgressEntries] = useState<UserProgressEntry[]>([]);
    const [quizAttempts, setQuizAttempts] = useState<UserQuizAttemptEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdvancing, setIsAdvancing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const meRes = await fetchWithAuth("/users/me/");
                if (!meRes.ok) {
                    router.replace(
                        `/login?next=${encodeURIComponent(`/learn/${courseId}/quizzes/${quizId}`)}`
                    );
                    return;
                }

                const me = (await meRes.json()) as { id: number; role: number };
                if (me.role !== 3) {
                    router.replace("/admin/courses");
                    return;
                }

                const [courseRes, enrollRes, progressRes, attemptsRes] = await Promise.all([
                    fetchWithAuth(`/courses/${courseId}/`),
                    fetchWithAuth(`/enrollments/?course=${courseId}&user=${me.id}`),
                    fetchWithAuth(`/user-progress/?course=${courseId}&user=${me.id}`),
                    fetchWithAuth(`/quiz-attempts/?course=${courseId}&user=${me.id}`),
                ]);

                if (!courseRes.ok) {
                    throw new Error(`Failed to load course (${courseRes.status})`);
                }
                if (!enrollRes.ok) {
                    throw new Error(`Failed to validate enrollment (${enrollRes.status})`);
                }

                const enrollments = (await enrollRes.json()) as Enrollment[];
                if (!Array.isArray(enrollments) || enrollments.length === 0) {
                    router.replace(`/courses/${courseId}`);
                    return;
                }

                const courseData = (await courseRes.json()) as LearningCourse;
                const progressData = progressRes.ok
                    ? ((await progressRes.json()) as UserProgressEntry[])
                    : [];
                const attemptsData = attemptsRes.ok
                    ? ((await attemptsRes.json()) as UserQuizAttemptEntry[])
                    : [];

                if (!isMounted) return;

                setUserId(me.id);
                setCourse(courseData);
                setProgressEntries(Array.isArray(progressData) ? progressData : []);
                setQuizAttempts(Array.isArray(attemptsData) ? attemptsData : []);
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load quiz data."
                );
                setCourse(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [courseId, quizId, router]);

    const learningItems = useMemo(() => {
        if (!course) return [];
        return buildLearningItems(course);
    }, [course]);

    const currentQuiz = useMemo(() => {
        if (!course?.quizzes) return null;
        return (
            course.quizzes.find((quiz) => String(quiz.id) === String(quizId)) ?? null
        );
    }, [course, quizId]);

    useEffect(() => {
        if (!course || learningItems.length === 0) return;
        if (currentQuiz) return;

        router.replace(getLearningItemHref(course.id, learningItems[0]));
    }, [course, currentQuiz, learningItems, router]);

    const progressSummary = useMemo(() => {
        if (!course) {
            return {
                percent: 0,
                completedItems: 0,
                totalItems: 0,
                completedLessonIds: new Set<number>(),
                attemptedQuizIds: new Set<number>(),
            };
        }
        return calculateCourseProgress(course, progressEntries, quizAttempts);
    }, [course, progressEntries, quizAttempts]);

    const currentItemIndex = useMemo(() => {
        if (!currentQuiz) return -1;
        return learningItems.findIndex(
            (item) => item.kind === "quiz" && item.id === currentQuiz.id
        );
    }, [learningItems, currentQuiz]);

    const nextItem =
        currentItemIndex >= 0 && currentItemIndex < learningItems.length - 1
            ? learningItems[currentItemIndex + 1]
            : null;

    const upsertQuizAttemptEntry = (entry: UserQuizAttemptEntry) => {
        setQuizAttempts((prev) => {
            const idx = prev.findIndex((item) => Number(item.quiz) === Number(entry.quiz));
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = entry;
                return updated;
            }
            return [...prev, entry];
        });
    };

    const persistQuizAttempt = async (result?: {
        correctPoints: number;
        totalPoints: number;
    }) => {
        if (!currentQuiz) return null;

        const res = await fetchWithAuth("/quiz-attempts/mark-attempted/", {
            method: "POST",
            body: JSON.stringify({
                quiz: currentQuiz.id,
                submitted_ans_data: result
                    ? {
                          correctPoints: result.correctPoints,
                          totalPoints: result.totalPoints,
                      }
                    : undefined,
            }),
        });

        if (!res.ok) return null;

        const saved = (await res.json()) as QuizAttemptResponse;
        const normalized: UserQuizAttemptEntry = {
            id: Number(saved.id),
            quiz: Number(saved.quiz),
        };
        upsertQuizAttemptEntry(normalized);
        return normalized;
    };

    const quizData = useMemo(() => {
        if (!currentQuiz) return null;
        return normalizeQuizData(
            currentQuiz.data,
            currentQuiz.title,
            currentQuiz.description
        );
    }, [currentQuiz]);

    const handleQuizComplete = async (result: {
        correctPoints: number;
        totalPoints: number;
    }) => {
        if (!currentQuiz || !userId) return;

        try {
            await persistQuizAttempt(result);
        } catch {
            // Keep UI usable even if attempt sync fails.
        }
    };

    const handleGoToNextItem = async () => {
        if (!nextItem || !currentQuiz || !course || isAdvancing) return;
        setIsAdvancing(true);

        try {
            const alreadyAttempted = quizAttempts.some(
                (entry) => Number(entry.quiz) === Number(currentQuiz.id)
            );
            if (!alreadyAttempted) {
                await persistQuizAttempt();
            }
        } catch {
            // Do not block navigation if progress sync fails.
        }

        router.push(getLearningItemHref(course.id, nextItem));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#5d5f5e]">
                    <Loader2 className="animate-spin" size={22} />
                    <span className="font-medium">Loading quiz...</span>
                </div>
            </div>
        );
    }

    if (error || !course || !currentQuiz || !quizData) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] px-6 py-16 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white border border-[#e8e8e8] rounded-3xl p-8 text-center">
                    <AlertCircle className="mx-auto text-[#f3184c] mb-4" size={34} />
                    <h1 className="text-2xl font-bold text-[#1a1c1c] mb-2">Quiz unavailable</h1>
                    <p className="text-[#5d5f5e] mb-6">{error ?? "We couldn't load this quiz."}</p>
                    <Link
                        href={`/courses/${courseId}`}
                        className="inline-flex items-center px-5 py-3 rounded-full bg-[#1a1c1c] text-white font-semibold hover:bg-black transition-colors"
                    >
                        Back to Course
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen antialiased flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <header className="fixed top-0 z-50 w-full bg-[#f9f9f9] border-b border-[#e8e8e8] px-6 md:px-8 py-4">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${course.id}`} className="text-[#f3184c] hover:text-[#e01445] transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <Link href="/courses" className="text-2xl font-bold tracking-tighter text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            Learnova
                        </Link>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">Current Course</p>
                        <p className="text-sm font-semibold text-[#1a1c1c] max-w-[380px] truncate">{course.title}</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col md:flex-row pt-[78px] flex-1">
                <aside className="fixed left-0 top-[78px] bottom-0 z-40 hidden md:flex flex-col w-[340px] bg-[#f3f3f3] overflow-y-auto border-r border-[#e8e8e8]">
                    <div className="p-8">
                        <Link href={`/courses/${course.id}`} className="flex items-center gap-2 text-[#f3184c] font-bold text-xs uppercase tracking-wider mb-8 hover:-translate-x-1 transition-transform w-fit">
                            <ArrowLeft size={14} />
                            Back to Course
                        </Link>

                        <h2 className="text-xl font-extrabold text-[#1a1c1c] mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {course.title}
                        </h2>

                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">Overall Progress</span>
                                <span className="text-xs font-bold text-[#f3184c]">{progressSummary.percent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#e2e2e2] rounded-full overflow-hidden">
                                <div className="h-full bg-[#f3184c] rounded-full" style={{ width: `${progressSummary.percent}%` }}></div>
                            </div>
                            <p className="mt-2 text-[11px] text-[#5d5f5e]">
                                {progressSummary.completedItems}/{progressSummary.totalItems} learning steps completed
                            </p>
                        </div>

                        <div className="space-y-2">
                            {learningItems.map((item) => {
                                const isCurrent = item.kind === "quiz" && item.id === currentQuiz.id;
                                const isCompleted =
                                    item.kind === "lesson"
                                        ? progressSummary.completedLessonIds.has(item.id)
                                        : progressSummary.attemptedQuizIds.has(item.id);

                                return (
                                    <Link
                                        key={`${item.kind}-${item.id}`}
                                        href={getLearningItemHref(course.id, item)}
                                        className={`flex items-center gap-4 py-4 px-4 rounded-2xl transition-all ${
                                            isCurrent
                                                ? "bg-white text-[#f3184c] shadow-sm border border-white"
                                                : "text-[#5d5f5e] hover:bg-white/70"
                                        }`}
                                    >
                                        <div className="shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2 className="text-[#f3184c]" size={18} fill="currentColor" stroke="white" />
                                            ) : isCurrent ? (
                                                <PlayCircle className="text-[#f3184c]" size={18} fill="currentColor" stroke="white" />
                                            ) : (
                                                <Circle className="text-[#9aa0a6]" size={16} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${isCurrent ? "font-bold" : "font-semibold"} truncate`}>
                                                {item.kind === "quiz" ? `Quiz: ${item.title}` : item.title}
                                            </p>
                                            <p className="text-[10px] font-mono mt-0.5">
                                                {item.kind === "quiz" ? "Assessment" : `${item.duration}m`}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 md:ml-[340px] p-6 md:p-12 pb-24">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="max-w-3xl">
                            <span className="text-[10px] font-bold text-[#f3184c] uppercase tracking-[0.3em] mb-3 block">
                                QUIZ
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                {quizData.quizTitle}
                            </h1>
                            {quizData.quizSynopsis && (
                                <p className="text-[#5d5f5e] mt-3 max-w-2xl">{quizData.quizSynopsis}</p>
                            )}
                        </div>

                        {nextItem && (
                            <button
                                type="button"
                                onClick={handleGoToNextItem}
                                disabled={isAdvancing}
                                className="bg-[#f3184c] hover:bg-[#e01445] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-transform active:scale-95 whitespace-nowrap"
                            >
                                {nextItem.kind === "quiz" ? "Next Quiz" : "Next Lesson"}
                                {isAdvancing ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <ArrowRight size={16} />
                                )}
                            </button>
                        )}
                    </header>

                    <section className="min-h-[420px]">
                        <LearnovaQuiz
                            key={currentQuiz.id}
                            status="attempting"
                            data={quizData}
                            onComplete={handleQuizComplete}
                            duration={currentQuiz.duration ?? 0}
                        />
                    </section>
                </main>
            </div>
        </div>
    );
}
