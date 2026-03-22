"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Clock, PlayCircle, Users, Award, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/auth";
import { BADGE_LEVELS, fetchUserTotalPoints, getBadgeForPoints, getNextBadge } from "@/lib/gamification";

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    price: string | number | null;
    total_lesson: number;
    total_duration: number;
    status: number;
    visibility: number;
    tags: Array<{ id: number; name: string }>;
}

interface Enrollment {
    id: number;
    course: number;
    status: number;
    lessons_completed: number;
    quizzes_attempted: number;
    total_lessons: number;
    status_display: string;
}

type LearnerCourseState = "enrolled" | "in_progress" | "completed";

interface MyCourseItem {
    enrollment: Enrollment;
    course: Course;
    state: LearnerCourseState;
}

const COVER_COLORS = [
    "bg-[#65A391]",
    "bg-[#D9A34A]",
    "bg-[#A7BC93]",
    "bg-[#7180B9]",
    "bg-[#D68C8C]",
    "bg-[#6CABDD]",
];

function formatDuration(minutes: number): string {
    if (!minutes) return "0m";
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
}

function getCourseState(enrollment: Enrollment): LearnerCourseState {
    if (enrollment.status === 3) return "completed";
    if (enrollment.status === 2 || enrollment.lessons_completed > 0) return "in_progress";
    return "enrolled";
}

function getStateLabel(state: LearnerCourseState): string {
    if (state === "completed") return "COMPLETED";
    if (state === "in_progress") return "IN PROGRESS";
    return "ENROLLED";
}

function getActionLabel(state: LearnerCourseState): string {
    if (state === "completed") return "Review";
    if (state === "in_progress") return "Continue";
    return "Start";
}

export default function MyCoursesPage() {
    const { user, loading: authLoading } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState<MyCourseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [totalPoints, setTotalPoints] = useState(0);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadProfilePoints = async () => {
            if (!user || user.role !== 3) {
                setTotalPoints(0);
                setProfileLoading(false);
                return;
            }

            setProfileLoading(true);
            try {
                const points = await fetchUserTotalPoints(user.id);
                if (isMounted) {
                    setTotalPoints(points);
                }
            } catch {
                if (isMounted) {
                    setTotalPoints(0);
                }
            } finally {
                if (isMounted) {
                    setProfileLoading(false);
                }
            }
        };

        loadProfilePoints();

        return () => {
            isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        let isMounted = true;

        const loadMyCourses = async () => {
            if (authLoading) return;

            if (!user || user.role !== 3) {
                setCourses([]);
                setLoading(false);
                setError(null);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [enrollmentsRes, coursesRes] = await Promise.all([
                    fetchWithAuth(`/enrollments/?user=${user.id}`),
                    fetchWithAuth("/courses/?status=2&visibility=1"),
                ]);

                if (!enrollmentsRes.ok) {
                    throw new Error(`Failed to load enrollments (${enrollmentsRes.status})`);
                }
                if (!coursesRes.ok) {
                    throw new Error(`Failed to load courses (${coursesRes.status})`);
                }

                const enrollmentsData = (await enrollmentsRes.json()) as Enrollment[];
                const coursesData = (await coursesRes.json()) as Course[];

                const coursesById = new Map<number, Course>(coursesData.map((course) => [course.id, course]));

                const merged = enrollmentsData
                    .map((enrollment) => {
                        const course = coursesById.get(Number(enrollment.course));
                        if (!course) return null;

                        return {
                            enrollment,
                            course,
                            state: getCourseState(enrollment),
                        } as MyCourseItem;
                    })
                    .filter((item): item is MyCourseItem => item !== null);

                if (isMounted) {
                    setCourses(merged);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Unable to load your courses.");
                    setCourses([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadMyCourses();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user]);

    const currentBadge = useMemo(() => getBadgeForPoints(totalPoints), [totalPoints]);
    const nextBadge = useMemo(() => getNextBadge(totalPoints), [totalPoints]);
    const totalUnlockedBadges = useMemo(
        () => BADGE_LEVELS.filter((badge) => totalPoints >= badge.minPoints).length,
        [totalPoints]
    );

    const levelProgress = useMemo(() => {
        if (!nextBadge) return 100;

        const previousThreshold = currentBadge?.minPoints ?? 0;
        const segment = nextBadge.minPoints - previousThreshold;
        if (segment <= 0) return 0;

        const rawProgress = ((totalPoints - previousThreshold) / segment) * 100;
        return Math.max(0, Math.min(100, rawProgress));
    }, [currentBadge, nextBadge, totalPoints]);

    const filteredCourses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return courses;

        return courses.filter((item) => {
            return (
                item.course.title.toLowerCase().includes(q) ||
                item.course.description.toLowerCase().includes(q) ||
                item.course.tags.some((tag) => tag.name.toLowerCase().includes(q))
            );
        });
    }, [courses, searchQuery]);

    const profileName = user?.name?.trim() || user?.email?.split("@")[0] || "Learner";

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-[#f3184c] animate-spin mb-4" />
                <p className="text-[#5d5f5e] font-medium">Loading your courses...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
                <h1 className="text-3xl font-black text-[#1a1c1c] mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Sign in to view My Courses
                </h1>
                <p className="text-[#5d5f5e] mb-6">Please log in to access your enrolled learning path.</p>
                <Link href="/login?next=%2Fmy-courses" className="px-6 py-3 rounded-full bg-[#f3184c] text-white font-bold hover:bg-[#e01445] transition-colors">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-[320px] flex-shrink-0">
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(30,30,30,0.06)] border border-[#e8e8e8] text-center sticky top-28">
                        <p className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">My Profile</p>
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-[#1a1c1c] border-4 border-white shadow-sm mx-auto overflow-hidden flex items-center justify-center">
                                <Users size={40} className="text-[#5d5f5e]" />
                            </div>
                            <div className="absolute -bottom-1 right-0 w-8 h-8 bg-[#f3184c] rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-sm">
                                <Award size={14} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>{profileName}</h2>
                        <p className="text-xs font-bold text-[#5d5f5e] uppercase tracking-widest mt-1.5">{user.role === 3 ? "Learner Level" : "User"}</p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-[#f9f9f9] rounded-2xl p-4">
                                <div className="text-2xl font-black text-[#f3184c] min-h-8 flex items-center justify-center">
                                    {profileLoading ? <Loader2 size={20} className="animate-spin" /> : totalPoints.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest mt-1">TOTAL POINTS</div>
                            </div>
                            <div className="bg-[#f9f9f9] rounded-2xl p-4">
                                <div className="text-2xl font-black text-[#f3184c]">{totalUnlockedBadges}</div>
                                <div className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest mt-1">BADGES UNLOCKED</div>
                            </div>
                        </div>

                        <div className="mt-8 text-left px-1">
                            <div className="flex justify-between items-end mb-2.5">
                                <span className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">CURRENT BADGE</span>
                                <span className="text-[11px] font-bold text-[#f3184c]">{currentBadge?.name ?? "No badge yet"}</span>
                            </div>
                            <div className="h-2 w-full bg-[#e8e8e8] rounded-full overflow-hidden">
                                <div className="h-full bg-[#f3184c] rounded-full" style={{ width: `${levelProgress}%` }}></div>
                            </div>
                            <p className="text-[11px] text-[#5d5f5e] mt-2">
                                {nextBadge
                                    ? `${Math.max(0, nextBadge.minPoints - totalPoints)} points to ${nextBadge.name}`
                                    : "You reached the highest badge tier"}
                            </p>
                        </div>

                        <div className="mt-8 text-left px-1">
                            <span className="text-[10px] font-bold text-[#5d5f5e] uppercase tracking-widest">Badge Levels</span>
                            <div className="mt-3 space-y-2">
                                {BADGE_LEVELS.map((badge) => {
                                    const unlocked = totalPoints >= badge.minPoints;
                                    const isCurrent = currentBadge?.name === badge.name;

                                    return (
                                        <div
                                            key={badge.name}
                                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold ${
                                                isCurrent
                                                    ? "border-[#f3184c] bg-[#fff2f6] text-[#f3184c]"
                                                    : unlocked
                                                    ? "border-[#e8e8e8] bg-[#f9f9f9] text-[#1a1c1c]"
                                                    : "border-[#f0f0f0] bg-white text-[#9ca3af]"
                                            }`}
                                        >
                                            <span>{badge.name}</span>
                                            <span>{badge.minPoints} pts</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-[40px] leading-none font-extrabold text-[#1a1c1c] tracking-tight mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                My Courses
                            </h1>
                            <p className="text-[#5d5f5e] font-medium pb-1">
                                Keep moving forward. {nextBadge ? `${Math.max(0, nextBadge.minPoints - totalPoints)} points to ${nextBadge.name}.` : "You have unlocked all badge tiers."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5d5f5e]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search your courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e8e8e8] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#f3184c]/20 focus:border-[#f3184c] transition-all"
                                />
                            </div>
                            <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c] rounded-full text-sm font-bold transition-colors">
                                <Filter size={16} /> Filter
                            </button>
                            <Link href="/courses" className="px-5 py-2.5 bg-[#f3184c] hover:bg-[#e01445] text-white rounded-full text-sm font-bold transition-colors shadow-lg shadow-rose-500/20">
                                Find New
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 mb-8">
                            <AlertCircle className="h-5 w-5 text-[#f3184c] flex-shrink-0" />
                            <p className="text-sm text-red-800 flex-1">{error}</p>
                            <button onClick={() => setError(null)} className="text-[#f3184c] hover:text-[#e01445] font-bold">
                                ×
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredCourses.map((item, idx) => {
                            const progress = item.enrollment.total_lessons > 0
                                ? Math.round((item.enrollment.lessons_completed / item.enrollment.total_lessons) * 100)
                                : 0;

                            return (
                                <div
                                    key={item.enrollment.id}
                                    className="flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(30,30,30,0.06)] border border-[#e8e8e8] transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className={`h-[220px] ${COVER_COLORS[idx % COVER_COLORS.length]} relative p-6 flex flex-col justify-between overflow-hidden`}>
                                        {item.course.thumbnail ? (
                                            <img src={item.course.thumbnail} alt={item.course.title} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : null}
                                        <div className="flex gap-2 relative z-10">
                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-white text-[#f3184c] shadow-sm">
                                                {getStateLabel(item.state)}
                                            </span>
                                            {item.course.tags[0] && (
                                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-[#1a1c1c]/60 text-white shadow-sm">
                                                    {item.course.tags[0].name}
                                                </span>
                                            )}
                                        </div>
                                        {!item.course.thumbnail && (
                                            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center opacity-25 pointer-events-none select-none">
                                                <div className="text-center transform -translate-y-2">
                                                    <div className="text-[52px] font-black text-white leading-[0.85] tracking-tighter mix-blend-overlay">COURSE</div>
                                                    <div className="text-[52px] font-black text-white leading-[0.85] tracking-tighter mix-blend-overlay">COVER</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <h3 className="text-[22px] leading-[1.3] font-extrabold mb-3 text-[#1a1c1c]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                            {item.course.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed mb-6 flex-1 text-[#5d5f5e]">
                                            {item.course.description}
                                        </p>

                                        <div className="mb-5">
                                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-[#5d5f5e] mb-2">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-[#e8e8e8] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#f3184c]" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#1a1c1c] mb-8 border-t border-[#e8e8e8] pt-6">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-[#f3184c]" strokeWidth={3} /> {formatDuration(item.course.total_duration)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <PlayCircle size={14} className="text-[#f3184c]" strokeWidth={3} />
                                                {item.enrollment.lessons_completed}/{item.enrollment.total_lessons || item.course.total_lesson} lessons
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 size={14} className="text-[#f3184c]" /> {item.enrollment.status_display}
                                            </div>
                                        </div>

                                        <Link
                                            href={`/courses/${item.course.id}`}
                                            className={`block w-full py-3.5 rounded-xl text-[15px] font-bold text-center transition-all active:scale-[0.98] ${
                                                item.state === "in_progress"
                                                    ? "bg-[#f3184c] hover:bg-[#e01445] text-white shadow-lg shadow-rose-500/20"
                                                    : item.state === "completed"
                                                    ? "bg-[#1a1c1c] hover:bg-black text-white shadow-lg"
                                                    : "bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c]"
                                            }`}
                                        >
                                            {getActionLabel(item.state)}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-20 text-[#5d5f5e]">
                            <Search size={48} className="mx-auto text-[#e8e8e8] mb-4" />
                            <h3 className="text-lg font-bold text-[#1a1c1c] mb-1">{courses.length === 0 ? "No enrolled courses yet" : "No courses found"}</h3>
                            <p className="text-sm mb-5">
                                {courses.length === 0 ? "Enroll in a course to start your learning journey." : "Try adjusting your search criteria."}
                            </p>
                            <Link href="/courses" className="inline-flex px-6 py-3 rounded-full bg-[#f3184c] text-white font-bold hover:bg-[#e01445] transition-colors">
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
