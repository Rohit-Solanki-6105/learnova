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
    Download,
    Loader2,
    PlayCircle,
} from "lucide-react";

import { BlocksViewer } from "@/components/Editor";
import { LessonVideoPlayer } from "@/components/LessonVideoPlayer";
import { fetchWithAuth } from "@/lib/auth";

interface Attachment {
    id: number;
    attachment_name: string;
    attachment_url: string;
    attachment_type: number;
}

interface Lesson {
    id: number;
    title: string;
    sequence: number;
    duration: number;
    data: unknown;
    attachments?: Attachment[];
}

interface CourseDetail {
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
}

interface Enrollment {
    id: number;
    course: number;
    user: number;
    status: number;
}

interface UserProgress {
    id: number;
    lesson: number;
    status: number;
}

interface EditorBlock {
    id?: string;
    type: string;
    data: Record<string, unknown>;
}

interface EditorData {
    time: number;
    blocks: EditorBlock[];
    version: string;
}

const FALLBACK_VIDEO_SRC =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function formatDuration(minutes: number): string {
    if (!minutes) return "0m";
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
}

function normalizeEditorData(data: unknown): EditorData {
    if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as { blocks?: unknown[] }).blocks)
    ) {
        return data as EditorData;
    }

    if (typeof data === "string" && data.trim()) {
        return {
            time: Date.now(),
            version: "2.30.0",
            blocks: [
                {
                    type: "paragraph",
                    data: { text: data.trim() },
                },
            ],
        };
    }

    if (
        data &&
        typeof data === "object" &&
        typeof (data as { description?: unknown }).description === "string"
    ) {
        const description = (data as { description: string }).description.trim();
        if (description) {
            return {
                time: Date.now(),
                version: "2.30.0",
                blocks: [
                    {
                        type: "paragraph",
                        data: { text: description },
                    },
                ],
            };
        }
    }

    return {
        time: Date.now(),
        version: "2.30.0",
        blocks: [],
    };
}

function extractMp4FromLessonData(data: unknown): string {
    if (data && typeof data === "object") {
        const direct = (data as { videoUrl?: unknown; video_url?: unknown }).videoUrl;
        if (typeof direct === "string" && /\.mp4($|\?)/i.test(direct)) {
            return direct;
        }

        const directAlt = (data as { video_url?: unknown }).video_url;
        if (typeof directAlt === "string" && /\.mp4($|\?)/i.test(directAlt)) {
            return directAlt;
        }

        const blocks = (data as { blocks?: unknown[] }).blocks;
        if (Array.isArray(blocks)) {
            for (const block of blocks) {
                if (!block || typeof block !== "object") continue;
                const typedBlock = block as {
                    type?: string;
                    data?: { url?: unknown; embed?: unknown };
                };
                const candidate =
                    typeof typedBlock.data?.url === "string"
                        ? typedBlock.data.url
                        : typeof typedBlock.data?.embed === "string"
                          ? typedBlock.data.embed
                          : null;

                if (candidate && /\.mp4($|\?)/i.test(candidate)) {
                    return candidate;
                }
            }
        }
    }

    return FALLBACK_VIDEO_SRC;
}

export default function LessonPlayerPage({
    params,
}: {
    params: Promise<{ courseId: string; lessonId: string }>;
}) {
    const resolvedParams = use(params);
    const courseId = resolvedParams.courseId;
    const lessonId = resolvedParams.lessonId;

    const router = useRouter();

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [progressEntries, setProgressEntries] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const meRes = await fetchWithAuth("/users/me/");
                if (!meRes.ok) {
                    router.replace(
                        `/login?next=${encodeURIComponent(`/learn/${courseId}/${lessonId}`)}`
                    );
                    return;
                }

                const me = (await meRes.json()) as { id: number; role: number };
                if (me.role !== 3) {
                    router.replace("/admin/courses");
                    return;
                }

                const [courseRes, enrollRes, progressRes] = await Promise.all([
                    fetchWithAuth(`/courses/${courseId}/`),
                    fetchWithAuth(`/enrollments/?course=${courseId}&user=${me.id}`),
                    fetchWithAuth(`/user-progress/?course=${courseId}&user=${me.id}`),
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

                const courseData = (await courseRes.json()) as CourseDetail;
                const progressData = progressRes.ok
                    ? ((await progressRes.json()) as UserProgress[])
                    : [];

                if (!isMounted) return;

                setCourse(courseData);
                setProgressEntries(Array.isArray(progressData) ? progressData : []);
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load lesson data."
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
    }, [courseId, lessonId, router]);

    const sortedLessons = useMemo(() => {
        if (!course?.lessons) return [];
        return [...course.lessons].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    }, [course]);

    const currentLesson = useMemo(() => {
        return sortedLessons.find((lesson) => String(lesson.id) === String(lessonId)) ?? null;
    }, [sortedLessons, lessonId]);

    useEffect(() => {
        if (!course || sortedLessons.length === 0) return;
        if (currentLesson) return;

        router.replace(`/learn/${course.id}/${sortedLessons[0].id}`);
    }, [course, currentLesson, sortedLessons, router]);

    const currentLessonIndex = useMemo(() => {
        if (!currentLesson) return -1;
        return sortedLessons.findIndex((lesson) => lesson.id === currentLesson.id);
    }, [sortedLessons, currentLesson]);

    const nextLesson =
        currentLessonIndex >= 0 && currentLessonIndex < sortedLessons.length - 1
            ? sortedLessons[currentLessonIndex + 1]
            : null;

    const completedLessonIds = useMemo(() => {
        return new Set(
            progressEntries
                .filter((entry) => Number(entry.status) === 1)
                .map((entry) => Number(entry.lesson))
        );
    }, [progressEntries]);

    const completedCount = useMemo(() => {
        return sortedLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    }, [sortedLessons, completedLessonIds]);

    const overallProgress =
        sortedLessons.length > 0
            ? Math.round((completedCount / sortedLessons.length) * 100)
            : 0;

    const lessonContent = normalizeEditorData(currentLesson?.data);
    const lessonVideoSrc = extractMp4FromLessonData(currentLesson?.data);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#5d5f5e]">
                    <Loader2 className="animate-spin" size={22} />
                    <span className="font-medium">Loading lesson...</span>
                </div>
            </div>
        );
    }

    if (error || !course || !currentLesson) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] px-6 py-16 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white border border-[#e8e8e8] rounded-3xl p-8 text-center">
                    <AlertCircle className="mx-auto text-[#f3184c] mb-4" size={34} />
                    <h1 className="text-2xl font-bold text-[#1a1c1c] mb-2">Lesson unavailable</h1>
                    <p className="text-[#5d5f5e] mb-6">{error ?? "We couldn't load this lesson."}</p>
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
                                <span className="text-xs font-bold text-[#f3184c]">{overallProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#e2e2e2] rounded-full overflow-hidden">
                                <div className="h-full bg-[#f3184c] rounded-full" style={{ width: `${overallProgress}%` }}></div>
                            </div>
                            <p className="mt-2 text-[11px] text-[#5d5f5e]">
                                {completedCount}/{sortedLessons.length} lessons completed
                            </p>
                        </div>

                        <div className="space-y-2">
                            {sortedLessons.map((lesson) => {
                                const isCurrent = lesson.id === currentLesson.id;
                                const isCompleted = completedLessonIds.has(lesson.id);

                                return (
                                    <Link
                                        key={lesson.id}
                                        href={`/learn/${course.id}/${lesson.id}`}
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
                                                {lesson.title || `Lesson ${lesson.sequence}`}
                                            </p>
                                            <p className="text-[10px] font-mono mt-0.5">{formatDuration(lesson.duration)}</p>
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
                                LESSON {String(currentLessonIndex + 1).padStart(2, "0")}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                {currentLesson.title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                            <a href="#lesson-resources" className="flex items-center gap-2 text-[#5d5f5e] hover:bg-[#e8e8e8] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:text-[#f3184c] transition-colors whitespace-nowrap">
                                <Download size={16} />
                                Resources
                            </a>

                            {nextLesson ? (
                                <Link
                                    href={`/learn/${course.id}/${nextLesson.id}`}
                                    className="bg-[#f3184c] hover:bg-[#e01445] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-transform active:scale-95 whitespace-nowrap"
                                >
                                    Next Lesson
                                    <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="bg-[#e8e8e8] text-[#a0a0a0] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap cursor-not-allowed"
                                >
                                    Course Complete
                                </button>
                            )}
                        </div>
                    </header>

                    <section className="mb-10">
                        <LessonVideoPlayer
                            src={lessonVideoSrc}
                            poster="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2000&auto=format&fit=crop"
                        />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <section className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#e8e8e8]">
                            <BlocksViewer data={lessonContent} />
                        </section>

                        <aside id="lesson-resources" className="space-y-6">
                            <div className="p-8 bg-white border border-[#e8e8e8] rounded-[2rem] shadow-sm">
                                <h3 className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-[0.2em] mb-6">Lesson Resources</h3>

                                {currentLesson.attachments && currentLesson.attachments.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentLesson.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={attachment.attachment_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all border border-transparent hover:border-[#f3f3f3]"
                                            >
                                                <div className="min-w-0">
                                                    <span className="text-sm font-bold block text-[#1a1c1c] truncate">
                                                        {attachment.attachment_name}
                                                    </span>
                                                    <span className="text-[10px] text-[#5d5f5e] uppercase tracking-widest block mt-1">
                                                        {attachment.attachment_type === 2 ? "External Link" : "Download"}
                                                    </span>
                                                </div>
                                                <ArrowRight size={16} className="text-[#f3184c] shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#5d5f5e]">No resources attached to this lesson yet.</p>
                                )}
                            </div>

                            <div className="p-8 bg-[#111212] text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#f3184c]/20 rounded-full blur-[40px]"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-extrabold mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                        Continue Your Journey
                                    </h3>
                                    <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
                                        Stay consistent. Complete each lesson to increase your progress and points.
                                    </p>
                                    {nextLesson ? (
                                        <Link
                                            href={`/learn/${course.id}/${nextLesson.id}`}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#f3184c] flex items-center gap-2 hover:text-white transition-colors bg-white/5 py-3 px-5 rounded-full backdrop-blur-sm border border-white/10 w-fit"
                                        >
                                            Go to Next Lesson
                                            <ArrowRight size={14} />
                                        </Link>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70 bg-white/5 py-3 px-5 rounded-full border border-white/10 inline-flex">
                                            You completed all lessons
                                        </span>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
