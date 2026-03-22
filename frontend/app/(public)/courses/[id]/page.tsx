"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    Award,
    BarChart,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    FolderOpen,
    InfinityIcon,
    Loader2,
    Lock,
    Play,
    PlayCircle,
    Search,
    Star,
    Unlock,
    User,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { fetchWithAuth } from "@/lib/auth";
import {
    buildLearningItems,
    calculateCourseProgress,
    type LearningCourse,
    type LearningItem,
    type UserProgressEntry,
    type UserQuizAttemptEntry,
} from "@/lib/learning";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Tag {
    id: number;
    name: string;
}

type UserRef =
    | number
    | {
          id?: number;
          username?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
      }
    | null;

interface CourseDetail {
    id: number;
    title: string;
    description: string;
    price: string | number | null;
    status: number;
    visibility: number;
    total_lesson: number;
    total_duration: number;
    tags: Tag[];
    lessons?: Array<{
        id: number;
        sequence?: number;
        title?: string;
        duration?: number;
        data?: unknown;
    }>;
    quizzes?: Array<{
        id: number;
        sequence?: number;
        title?: string;
        description?: string;
        duration?: number;
        data?: unknown;
    }>;
    created_by: UserRef;
    responsible: UserRef;
}

interface Enrollment {
    id: number;
    course: number;
    user: number;
    status: number;
}

interface UserResponse {
    id: number;
    name?: string;
    email?: string;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const USD_TO_INR_RATE = 83;

function parsePrice(price: string | number | null): number | null {
    if (price == null) return null;
    const n = parseFloat(String(price));
    if (Number.isNaN(n) || n === 0) return null;
    return n;
}

function formatPriceUsd(price: string | number | null): string {
    const parsed = parsePrice(price);
    if (parsed == null) return "Free";
    return `$${parsed.toFixed(2)}`;
}

function formatPriceInr(price: string | number | null): string {
    const parsed = parsePrice(price);
    if (parsed == null) return "₹0";
    return `₹${(parsed * USD_TO_INR_RATE).toFixed(2)}`;
}

function formatDuration(minutes: number): string {
    if (!minutes) return "0m";
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
}

function getNameFromUserRef(ref: UserRef): string | null {
    if (ref && typeof ref === "object") {
        const fullName = `${ref.first_name ?? ""} ${ref.last_name ?? ""}`.trim();
        if (fullName) return fullName;
        if (ref.username) return ref.username;
        if (ref.email) return ref.email.split("@")[0];
    }
    return null;
}

function getLearningItemHref(courseId: number, item: LearningItem): string {
    if (item.kind === "quiz") {
        return `/learn/${courseId}/quizzes/${item.id}`;
    }
    return `/learn/${courseId}/${item.id}`;
}

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function CourseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const courseId = resolvedParams.id;

    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id;
    const userRole = user?.role;

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [instructorName, setInstructorName] = useState("Instructor");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [progressEntries, setProgressEntries] = useState<UserProgressEntry[]>([]);
    const [quizAttempts, setQuizAttempts] = useState<UserQuizAttemptEntry[]>([]);

    const learningCourse = useMemo<LearningCourse | null>(() => {
        if (!course) return null;
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            lessons: (course.lessons ?? []).map((lesson) => ({
                id: lesson.id,
                title: lesson.title ?? `Lesson ${lesson.sequence ?? 0}`,
                sequence: lesson.sequence ?? 0,
                duration: lesson.duration ?? 0,
                data: lesson.data ?? null,
            })),
            quizzes: (course.quizzes ?? []).map((quiz) => ({
                id: quiz.id,
                title: quiz.title ?? `Quiz ${quiz.sequence ?? 0}`,
                description: quiz.description ?? "",
                sequence: quiz.sequence ?? 0,
                duration: quiz.duration ?? 0,
                data: quiz.data ?? null,
            })),
        };
    }, [course]);

    const learningItems = useMemo(() => {
        if (!learningCourse) return [];
        return buildLearningItems(learningCourse);
    }, [learningCourse]);

    const progressSummary = useMemo(() => {
        if (!learningCourse) {
            return {
                percent: 0,
                totalItems: 0,
                completedItems: 0,
                completedLessonIds: new Set<number>(),
                attemptedQuizIds: new Set<number>(),
            };
        }
        return calculateCourseProgress(learningCourse, progressEntries, quizAttempts);
    }, [learningCourse, progressEntries, quizAttempts]);

    const learnerContinuePath = useMemo(() => {
        if (!course || learningItems.length === 0) return "/my-courses";
        const nextUnfinished = learningItems.find((item) =>
            item.kind === "lesson"
                ? !progressSummary.completedLessonIds.has(item.id)
                : !progressSummary.attemptedQuizIds.has(item.id)
        );
        const targetItem = nextUnfinished ?? learningItems[0];
        return getLearningItemHref(course.id, targetItem);
    }, [course, learningItems, progressSummary]);

    /* ── Data Fetching ── */
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const courseRes = await fetchWithAuth(`/courses/${courseId}/`);
                if (!courseRes.ok) {
                    if (courseRes.status === 404)
                        throw new Error("Course not found or unavailable.");
                    throw new Error(`Failed to load course (${courseRes.status})`);
                }

                const rawCourseData = (await courseRes.json()) as CourseDetail;
                const courseData: CourseDetail = {
                    ...rawCourseData,
                    lessons: Array.isArray(rawCourseData.lessons)
                        ? rawCourseData.lessons
                        : [],
                    quizzes: Array.isArray(rawCourseData.quizzes)
                        ? rawCourseData.quizzes
                        : [],
                };
                if (!isMounted) return;
                setCourse(courseData);
                setProgressEntries([]);
                setQuizAttempts([]);

                // Resolve instructor name
                const resolvedName =
                    getNameFromUserRef(courseData.created_by) ??
                    getNameFromUserRef(courseData.responsible);
                if (resolvedName) {
                    setInstructorName(resolvedName);
                } else {
                    const possibleUserId =
                        typeof courseData.created_by === "number"
                            ? courseData.created_by
                            : typeof courseData.responsible === "number"
                            ? courseData.responsible
                            : null;

                    if (possibleUserId) {
                        const userRes = await fetchWithAuth(
                            `/users/${possibleUserId}/`
                        );
                        if (userRes.ok && isMounted) {
                            const userData =
                                (await userRes.json()) as UserResponse;
                            setInstructorName(
                                userData.name?.trim() ||
                                    userData.email?.split("@")[0] ||
                                    "Instructor"
                            );
                        }
                    }
                }

                // Check enrollment (students only)
                if (userId && userRole === 3) {
                    const enrollRes = await fetchWithAuth(
                        `/enrollments/?course=${courseId}&user=${userId}`
                    );
                    if (enrollRes.ok) {
                        const enrollments =
                            (await enrollRes.json()) as Enrollment[];
                        const enrolled =
                            Array.isArray(enrollments) &&
                            enrollments.some(
                                (e) => Number(e.course) === Number(courseId)
                            );
                        if (isMounted) {
                            setIsEnrolled(enrolled);
                        }

                        if (enrolled) {
                            const [progressRes, attemptsRes] = await Promise.all([
                                fetchWithAuth(
                                    `/user-progress/?course=${courseId}&user=${userId}`
                                ),
                                fetchWithAuth(
                                    `/quiz-attempts/?course=${courseId}&user=${userId}`
                                ),
                            ]);

                            if (!isMounted) return;
                            setProgressEntries(
                                progressRes.ok
                                    ? ((await progressRes.json()) as UserProgressEntry[])
                                    : []
                            );
                            setQuizAttempts(
                                attemptsRes.ok
                                    ? ((await attemptsRes.json()) as UserQuizAttemptEntry[])
                                    : []
                            );
                        }
                    } else if (isMounted) {
                        setIsEnrolled(false);
                        setProgressEntries([]);
                        setQuizAttempts([]);
                    }
                } else if (isMounted) {
                    setIsEnrolled(false);
                    setProgressEntries([]);
                    setQuizAttempts([]);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load course details."
                    );
                    setCourse(null);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, [courseId, userId, userRole]);

    /* ── Enroll Handler ── */
    const handleEnroll = async () => {
        const nextUrl = `/courses/${courseId}`;

        if (!user) {
            router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
            return;
        }
        if (user.role !== 3) {
            router.push("/admin/courses");
            return;
        }

        try {
            setEnrolling(true);
            setError(null);

            const res = await fetchWithAuth("/enrollments/", {
                method: "POST",
                body: JSON.stringify({ course: Number(courseId), status: 1 }),
            });

            if (res.status === 401) {
                router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    data.error ||
                        data.detail ||
                        data.message ||
                        "Failed to enroll in this course."
                );
            }

            setIsEnrolled(true);
            if (course?.id && learningItems.length > 0) {
                router.push(learnerContinuePath);
            } else {
                router.push("/my-courses");
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to enroll in this course."
            );
        } finally {
            setEnrolling(false);
        }
    };

    /* ── Loading State ── */
    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#5d5f5e]">
                    <Loader2 className="animate-spin" size={22} />
                    <span className="font-medium">Loading course details…</span>
                </div>
            </div>
        );
    }

    /* ── Error / Not-found State ── */
    if (!course) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] px-6 py-16">
                <div className="max-w-3xl mx-auto bg-white border border-[#e8e8e8] rounded-3xl p-8 text-center">
                    <AlertCircle
                        className="mx-auto text-[#f3184c] mb-4"
                        size={34}
                    />
                    <h1 className="text-2xl font-bold text-[#1a1c1c] mb-2">
                        Course unavailable
                    </h1>
                    <p className="text-[#5d5f5e] mb-6">
                        {error ?? "We couldn't load this course."}
                    </p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center px-5 py-3 rounded-full bg-[#1a1c1c] text-white font-semibold hover:bg-black transition-colors"
                    >
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────
       Main Render
    ───────────────────────────────────────── */
    return (
        <div
            className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen antialiased"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <Navbar />

            {/* ── Main Layout ── */}
            <main className="max-w-[1440px] mx-auto px-6 md:px-8 pt-24 pb-12 flex flex-col lg:flex-row gap-12">
                {/* ── Left Column (70%) ── */}
                <div className="w-full lg:w-[70%]">

                    {/* Breadcrumbs */}
                    <nav className="flex text-xs font-bold tracking-widest uppercase text-[#5f5e5e] mb-6 gap-2 items-center flex-wrap">
                        <Link
                            href="/courses"
                            className="hover:text-[#1a1c1c] transition-colors"
                        >
                            Courses
                        </Link>
                        <ChevronRight size={12} />
                        {course.tags.length > 0 && (
                            <>
                                <span className="hover:text-[#1a1c1c] transition-colors cursor-pointer">
                                    {course.tags[0].name}
                                </span>
                                <ChevronRight size={12} />
                            </>
                        )}
                        <span className="text-[#1a1c1c]">{course.title}</span>
                    </nav>

                    {/* Hero */}
                    <header className="mb-12">
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            {course.title}
                        </h1>

                        <p className="text-lg text-[#5f5e5e] max-w-2xl mb-8 leading-relaxed">
                            {course.description}
                        </p>

                        {/* Tags */}
                        {course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {course.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f3f3f3] text-[#1a1c1c]"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-8 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#e8e8e8] flex items-center justify-center shrink-0">
                                    <User className="text-[#5f5e5e]" size={18} />
                                </div>
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">
                                        Instructor
                                    </p>
                                    <p className="font-semibold text-[#1a1c1c]">
                                        {instructorName}
                                    </p>
                                </div>
                            </div>

                            <div className="h-8 w-[1px] bg-[#e8e8e8] hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                    <Clock
                                        className="text-[#f3184c]"
                                        size={16}
                                    />
                                </div>
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">
                                        Duration
                                    </p>
                                    <p className="font-semibold text-[#1a1c1c]">
                                        {formatDuration(course.total_duration)}
                                    </p>
                                </div>
                            </div>

                            <div className="h-8 w-[1px] bg-[#e8e8e8] hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                    <BarChart
                                        className="text-[#f3184c]"
                                        size={16}
                                    />
                                </div>
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">
                                        Lessons
                                    </p>
                                    <p className="font-semibold text-[#1a1c1c]">
                                        {course.total_lesson}
                                    </p>
                                </div>
                            </div>

                            <div className="h-8 w-[1px] bg-[#e8e8e8] hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                    <Star
                                        className="text-[#f3184c]"
                                        size={16}
                                        fill="currentColor"
                                    />
                                </div>
                                <div>
                                    <p className="text-[#5f5e5e] text-[10px] uppercase font-bold tracking-widest">
                                        Rating
                                    </p>
                                    <p className="font-semibold text-[#1a1c1c]">
                                        4.9
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dynamic Progress / Insight Card */}
                    <section className="bg-white rounded-[2rem] py-6 px-6 sm:px-10 shadow-[0_10px_30px_rgba(30,30,30,0.04)] mb-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/50 relative overflow-hidden transition-all duration-300">
                        {isEnrolled ? (
                            <>
                                <div className="flex-1 w-full relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-[#f3184c]">
                                            Current Journey
                                        </span>
                                        <span
                                            className="font-bold text-xl sm:text-2xl"
                                            style={{
                                                fontFamily:
                                                    "'Manrope', sans-serif",
                                            }}
                                        >
                                            Overall Progress
                                        </span>
                                    </div>
                                    <div className="h-4 w-full bg-[#e8e8e8] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#f3184c] rounded-full shadow-[0_0_15px_rgba(243,24,76,0.3)] transition-all"
                                            style={{ width: `${progressSummary.percent}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap hidden md:block border-l border-[#e8e8e8] pl-8 relative z-10">
                                    <p className="text-[#5f5e5e] text-sm mb-1">
                                        Completed:{" "}
                                        <span className="font-bold text-[#1a1c1c]">
                                            {progressSummary.completedItems}/{progressSummary.totalItems}
                                        </span>
                                    </p>
                                    <p className="text-[#5f5e5e] text-sm">
                                        Progress:{" "}
                                        <span className="font-bold text-[#1a1c1c]">
                                            {progressSummary.percent}%
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-bold mt-2 text-[#f3184c] uppercase tracking-wider">
                                        Keep going!
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 w-full relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-[#f3184c]">
                                            Course Insight
                                        </span>
                                        <span
                                            className="font-bold text-xl sm:text-2xl"
                                            style={{
                                                fontFamily:
                                                    "'Manrope', sans-serif",
                                            }}
                                        >
                                            Ready to get started?
                                        </span>
                                    </div>
                                    <p className="text-[#5f5e5e] text-sm leading-relaxed max-w-lg mb-2">
                                        Enroll today and unlock all{" "}
                                        {course.total_lesson} lessons, quizzes,
                                        and downloadable resources.
                                    </p>
                                </div>
                                <div className="text-right whitespace-nowrap hidden md:block border-l border-[#e8e8e8] pl-8 relative z-10">
                                    <p className="text-[#5f5e5e] text-sm mb-1">
                                        Total Lessons:{" "}
                                        <span className="font-bold text-[#1a1c1c]">
                                            {course.total_lesson}
                                        </span>
                                    </p>
                                    <p className="text-[#5f5e5e] text-sm">
                                        Duration:{" "}
                                        <span className="font-bold text-[#1a1c1c]">
                                            {formatDuration(
                                                course.total_duration
                                            )}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-bold mt-2 text-[#f3184c] uppercase tracking-wider">
                                        Enroll to Unlock
                                    </p>
                                </div>
                            </>
                        )}
                    </section>

                    {/* Tabs */}
                    <div className="flex gap-8 sm:gap-10 border-b border-[#e8e8e8] mb-10 overflow-x-auto">
                        <button className="pb-4 text-sm font-bold border-b-2 border-[#f3184c] text-[#1a1c1c] whitespace-nowrap">
                            Overview
                        </button>
                        <button className="pb-4 text-sm font-semibold text-[#5f5e5e] hover:text-[#1a1c1c] whitespace-nowrap transition-colors">
                            Ratings &amp; Reviews
                        </button>
                        <button className="pb-4 text-sm font-semibold text-[#5f5e5e] hover:text-[#1a1c1c] whitespace-nowrap transition-colors">
                            Resources
                        </button>
                    </div>

                    {/* Course Content */}
                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <h2
                                    className="text-2xl font-bold text-[#1a1c1c]"
                                    style={{
                                        fontFamily: "'Manrope', sans-serif",
                                    }}
                                >
                                    Course Content
                                </h2>
                                <span className="bg-[#e2e2e2] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight text-[#1a1c1c]">
                                    {learningItems.length} learning steps
                                </span>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]"
                                    size={18}
                                />
                                <input
                                    className="w-full bg-[#f3f3f3] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#f3184c]/20 outline-none transition-all"
                                    placeholder="Search lesson by name..."
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Learning Path */}
                        <div className="space-y-4">
                            <div className="bg-[#f3f3f3] md:bg-white md:border md:border-[#f3f3f3] rounded-[1.5rem] overflow-hidden">
                                <div className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-5">
                                        <span className="w-10 h-10 flex items-center justify-center bg-[#f3184c] text-white rounded-xl text-sm font-bold shadow-md shadow-rose-200">
                                            LP
                                        </span>
                                        <h3 className="font-bold text-lg text-[#1a1c1c]">
                                            Learning Path
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#5f5e5e]">
                                        Lessons + Quizzes
                                    </span>
                                </div>

                                <div className="px-6 pb-6 pt-2 space-y-2">
                                    {learningItems.length === 0 ? (
                                        <p className="text-sm text-[#5f5e5e] px-5 py-3">
                                            No lessons or quizzes are available for this course yet.
                                        </p>
                                    ) : (
                                        learningItems.map((item) => {
                                            const isCompleted =
                                                item.kind === "lesson"
                                                    ? progressSummary.completedLessonIds.has(item.id)
                                                    : progressSummary.attemptedQuizIds.has(item.id);
                                            const isLocked = !isEnrolled;
                                            const isClickable = isEnrolled;

                                            const content = (
                                                <div
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 rounded-2xl transition-all group border ${
                                                        isClickable
                                                            ? "hover:bg-white hover:border-[#e8e8e8] cursor-pointer border-transparent"
                                                            : "border-transparent"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0 min-w-0">
                                                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="text-[#f3184c]" size={18} />
                                                            ) : isLocked ? (
                                                                <Lock className="text-[#a0a0a0]" size={16} />
                                                            ) : item.kind === "quiz" ? (
                                                                <Star className="text-[#f3184c]" size={14} fill="currentColor" />
                                                            ) : (
                                                                <PlayCircle className="text-[#f3184c]" size={16} />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-sm truncate ${isCompleted ? "font-bold text-[#f3184c]" : "font-medium text-[#1a1c1c]"}`}>
                                                                {item.kind === "quiz" ? `Quiz: ${item.title}` : item.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] uppercase font-black tracking-wider text-[#5f5e5e] bg-[#f3f3f3] px-2 py-0.5 rounded">
                                                                    {item.kind === "quiz" ? "Assessment" : "Lesson"}
                                                                </span>
                                                                {isLocked && (
                                                                    <span className="text-[10px] uppercase font-black tracking-wider text-[#a0a0a0]">
                                                                        Locked
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-12 sm:ml-0">
                                                        <span className="text-xs text-[#5f5e5e] font-mono tracking-tighter bg-[#f9f9f9] px-2 py-1 rounded-md border border-[#e8e8e8]">
                                                            {item.kind === "quiz"
                                                                ? formatDuration(item.duration)
                                                                : formatDuration(item.duration)}
                                                        </span>
                                                        {!isLocked && (
                                                            <PlayCircle
                                                                className="text-[#f3184c] opacity-80 group-hover:opacity-100 transition-opacity"
                                                                size={18}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            );

                                            if (!isClickable) {
                                                return (
                                                    <div key={`${item.kind}-${item.id}`}>
                                                        {content}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={`${item.kind}-${item.id}`}
                                                    href={getLearningItemHref(course.id, item)}
                                                >
                                                    {content}
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Course Access Info */}
                    <div className="mt-10 bg-white border border-[#e8e8e8] rounded-3xl p-6 md:p-8">
                        <h2
                            className="text-2xl font-bold text-[#1a1c1c] mb-3"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Course Access
                        </h2>
                        <div className="mt-4 rounded-2xl border border-[#f3f3f3] bg-[#f9f9f9] p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#fff2f6] flex items-center justify-center shrink-0">
                                {isEnrolled ? (
                                    <Unlock
                                        className="text-[#f3184c]"
                                        size={18}
                                    />
                                ) : (
                                    <Lock
                                        className="text-[#f3184c]"
                                        size={18}
                                    />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-[#1a1c1c] mb-1">
                                    {isEnrolled
                                        ? "You are enrolled"
                                        : "Lessons are locked"}
                                </p>
                                <p className="text-sm text-[#5d5f5e]">
                                    {isEnrolled
                                        ? "Open My Courses to access lessons, quizzes, and progress tracking."
                                        : "This page shows course details only. Enroll to unlock all lessons and learning material."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Sidebar (30%) ── */}
                <aside className="w-full lg:w-[30%]">
                    <div className="sticky top-24 space-y-8">

                        {/* Video Preview Card */}
                        <div className="relative group rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-[#e0eae3]">
                            <img
                                alt="Course preview"
                                className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                src="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2000&auto=format&fit=crop"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <button className="w-16 h-16 bg-[#f3184c] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                    <Play
                                        size={24}
                                        fill="currentColor"
                                        className="ml-1"
                                    />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm">
                                <Eye className="text-[#f3184c]" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1c1c]">
                                    Preview this course
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-white border border-[#e8e8e8] rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,30,30,0.05)]">
                            <h3 className="text-xs uppercase tracking-widest font-black text-[#5d5f5e] mb-2">
                                Price
                            </h3>
                            <p
                                className="text-3xl font-black text-[#1a1c1c]"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                {formatPriceUsd(course.price)}
                            </p>
                            <p className="text-sm font-semibold text-[#5d5f5e] mt-1 mb-6">
                                {formatPriceInr(course.price)}
                            </p>

                            {/* Error */}
                            {error && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* CTA Button */}
                            {isEnrolled ? (
                                <button
                                    onClick={() => router.push(learnerContinuePath)}
                                    className="w-full py-4 rounded-full bg-[#1a1c1c] text-white font-bold hover:bg-black transition-colors"
                                    style={{
                                        fontFamily: "'Manrope', sans-serif",
                                    }}
                                >
                                    Continue From My Courses
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="w-full py-4 rounded-full bg-[#f3184c] text-white font-bold hover:bg-[#e01445] disabled:opacity-70 transition-colors shadow-[0_15px_35px_rgba(243,24,76,0.25)] hover:shadow-[0_20px_45px_rgba(243,24,76,0.35)]"
                                    style={{
                                        fontFamily: "'Manrope', sans-serif",
                                    }}
                                >
                                    {enrolling
                                        ? "Enrolling…"
                                        : `Enroll Now${parsePrice(course.price) ? ` — ${formatPriceUsd(course.price)}` : " — Free"}`}
                                </button>
                            )}

                            {!isEnrolled && (
                                <p className="text-center text-[11px] font-medium text-[#5f5e5e] uppercase tracking-widest mt-3">
                                    30-Day Money-Back Guarantee
                                </p>
                            )}

                            {/* Feature list */}
                            <div className="mt-8 pt-6 border-t border-[#f3f3f3] space-y-4">
                                <div className="flex items-center gap-3 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <BookOpen
                                            className="text-[#f3184c]"
                                            size={16}
                                        />
                                    </div>
                                    {course.total_lesson} lessons
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <Clock
                                            className="text-[#f3184c]"
                                            size={16}
                                        />
                                    </div>
                                    {formatDuration(course.total_duration)}{" "}
                                    total duration
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <FolderOpen
                                            className="text-[#f3184c]"
                                            size={16}
                                        />
                                    </div>
                                    Downloadable resources
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <Award
                                            className="text-[#f3184c]"
                                            size={16}
                                        />
                                    </div>
                                    Professional Certificate
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        <InfinityIcon
                                            className="text-[#f3184c]"
                                            size={16}
                                        />
                                    </div>
                                    Lifetime Access
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-[#1a1c1c]">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                        {isEnrolled ? (
                                            <Unlock
                                                className="text-[#f3184c]"
                                                size={16}
                                            />
                                        ) : (
                                            <Lock
                                                className="text-[#f3184c]"
                                                size={16}
                                            />
                                        )}
                                    </div>
                                    {isEnrolled
                                        ? "All lessons unlocked"
                                        : "Lessons unlock after enrollment"}
                                </div>
                            </div>
                        </div>

                        {/* Ratings Card */}
                        <div className="bg-[#111212] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f3184c]/20 blur-[50px] rounded-full pointer-events-none" />
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a0a0a0] mb-2">
                                        Student Feedback
                                    </p>
                                    <h4
                                        className="text-6xl font-black text-[#f3184c]"
                                        style={{
                                            fontFamily: "'Manrope', sans-serif",
                                        }}
                                    >
                                        4.9
                                    </h4>
                                </div>
                                <div className="flex flex-col items-end gap-1 mt-2">
                                    <div className="flex gap-1 text-[#f3184c]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill="currentColor"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[#a0a0a0]">
                                        Based on 1.2k reviews
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                {[
                                    { label: "5 Stars", pct: 92, w: "92%" },
                                    { label: "4 Stars", pct: 6, w: "6%", opacity: "opacity-60" },
                                    { label: "3 Stars", pct: 2, w: "2%", opacity: "opacity-40" },
                                ].map(({ label, pct, w, opacity }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="text-[10px] font-mono text-[#a0a0a0] w-12 tracking-widest uppercase">
                                            {label}
                                        </span>
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-[#f3184c] ${opacity ?? ""} shadow-[0_0_10px_rgba(243,24,76,0.5)]`}
                                                style={{ width: w }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-white">
                                            {pct}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(30,30,30,0.03)]">
                            <h4 className="text-xs uppercase font-black tracking-[0.2em] text-[#5f5e5e] mb-6">
                                Recent Reviews
                            </h4>
                            <div className="space-y-6 mb-8">
                                <div className="space-y-3 pb-6 border-b border-[#f3f3f3]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#f3f3f3] flex items-center justify-center text-xs font-bold text-[#1a1c1c]">
                                                MA
                                            </div>
                                            <span className="text-sm font-bold text-[#1a1c1c]">
                                                Marcus Aris
                                            </span>
                                        </div>
                                        <div className="flex text-[#f3184c]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    fill="currentColor"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#5f5e5e] leading-relaxed">
                                        Highly recommended for anyone looking
                                        to level up their skills. The
                                        curriculum is well-structured.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#f3f3f3] flex items-center justify-center text-xs font-bold text-[#1a1c1c]">
                                                EV
                                            </div>
                                            <span className="text-sm font-bold text-[#1a1c1c]">
                                                Elena Voss
                                            </span>
                                        </div>
                                        <div className="flex text-[#f3184c]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    fill="currentColor"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#5f5e5e] leading-relaxed">
                                        Finally a course that goes beyond the
                                        basics. Brilliant structure and
                                        real-world examples throughout.
                                    </p>
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
                    <Link
                        href="/"
                        className="text-xl font-black tracking-tighter text-[#1a1c1c]"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Learnova
                    </Link>
                    <p className="text-sm text-[#5f5e5e] font-medium">
                        © 2024 Learnova. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm font-bold text-[#5f5e5e]">
                        <Link
                            href="#"
                            className="hover:text-[#f3184c] transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-[#f3184c] transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-[#f3184c] transition-colors"
                        >
                            Support
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
