"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "@/lib/auth";
import Link from "next/link";
import {
    ArrowLeft, Users, BookOpen, Trophy, Clock, CheckCircle2,
    AlertCircle, X, ChevronDown, RefreshCw, Search
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LessonProgress {
    id: number;
    lesson_title: string;
    lesson_sequence: number;
    status: number;
    status_display: string;
    time_spent: number;
    completed_at: string | null;
}

interface QuizAttempt {
    id: number;
    quiz_title: string;
    score_data: { correctPoints: number | null; totalPoints: number | null };
    completed_at: string | null;
    created_at: string;
}

interface Enrollment {
    id: number;
    user: number;
    user_email: string;
    user_name: string;
    course_title: string;
    status: number;
    status_display: string;
    completed_at: string | null;
    created_at: string;
    lessons_completed: number;
    quizzes_attempted: number;
    total_lessons: number;
}

interface EnrollmentDetail extends Enrollment {
    lesson_progress: LessonProgress[];
    quiz_attempts: QuizAttempt[];
}

interface CourseStats {
    total_enrolled: number;
    completed: number;
    in_progress: number;
    enrolled: number;
    completion_rate: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: number) {
    if (status === 3) return "bg-emerald-100 text-emerald-700";
    if (status === 2) return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
}

function progressPct(completed: number, total: number) {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
}

function fmtDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Learner Detail Drawer ────────────────────────────────────────────────────

function LearnerDetailDrawer({
    enrollmentId,
    onClose,
}: {
    enrollmentId: number;
    onClose: () => void;
}) {
    const [detail, setDetail] = useState<EnrollmentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth(`/enrollments/${enrollmentId}/detail/`);
                if (!res.ok) throw new Error();
                setDetail(await res.json());
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [enrollmentId]);

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Drawer */}
            <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">
                            {loading ? "Loading..." : detail?.user_name || detail?.user_email}
                        </h2>
                        {!loading && detail && (
                            <p className="text-xs text-gray-400 mt-0.5">{detail.user_email}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <RefreshCw size={24} className="animate-spin text-indigo-400" />
                    </div>
                ) : !detail ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">Failed to load learner data.</div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Summary badges */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-indigo-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-indigo-600">{detail.lessons_completed}</div>
                                <div className="text-xs font-semibold text-indigo-400 mt-0.5">Lessons Done</div>
                            </div>
                            <div className="bg-violet-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-violet-600">{detail.quizzes_attempted}</div>
                                <div className="text-xs font-semibold text-violet-400 mt-0.5">Quizzes Tried</div>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-emerald-600">{progressPct(detail.lessons_completed, detail.total_lessons)}%</div>
                                <div className="text-xs font-semibold text-emerald-400 mt-0.5">Progress</div>
                            </div>
                        </div>

                        {/* Enrollment info */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(detail.status)}`}>{detail.status_display}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Enrolled</span>
                                <span className="font-medium text-gray-700">{fmtDate(detail.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Completed</span>
                                <span className="font-medium text-gray-700">{fmtDate(detail.completed_at)}</span>
                            </div>
                        </div>

                        {/* Lesson progress */}
                        {detail.lesson_progress.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <BookOpen size={15} /> Lesson Progress
                                </h3>
                                <div className="space-y-2">
                                    {detail.lesson_progress.map(lp => (
                                        <div key={lp.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${lp.status === 1 ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                {lp.status === 1
                                                    ? <CheckCircle2 size={14} className="text-emerald-600" />
                                                    : <Clock size={14} className="text-gray-400" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{lp.lesson_title}</p>
                                                {lp.completed_at && <p className="text-xs text-gray-400">{fmtDate(lp.completed_at)}</p>}
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lp.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                                {lp.status === 1 ? 'Done' : 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quiz attempts */}
                        {detail.quiz_attempts.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Trophy size={15} /> Quiz Attempts
                                </h3>
                                <div className="space-y-2">
                                    {detail.quiz_attempts.map(qa => {
                                        const hasScore = qa.score_data.totalPoints !== null && qa.score_data.totalPoints > 0;
                                        const pct = hasScore
                                            ? Math.round(((qa.score_data.correctPoints ?? 0) / qa.score_data.totalPoints!) * 100)
                                            : null;
                                        return (
                                            <div key={qa.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${pct !== null && pct >= 60 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                                    <Trophy size={13} className={pct !== null && pct >= 60 ? 'text-emerald-600' : 'text-amber-500'} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{qa.quiz_title}</p>
                                                    <p className="text-xs text-gray-400">{fmtDate(qa.created_at)}</p>
                                                </div>
                                                {hasScore
                                                    ? <span className={`text-xs font-black px-2.5 py-1 rounded-full ${pct! >= 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{pct}%</span>
                                                    : <span className="text-xs text-gray-400">—</span>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {detail.lesson_progress.length === 0 && detail.quiz_attempts.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No activity recorded yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnrolledPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params);

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [stats, setStats] = useState<CourseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
    const [courseTitle, setCourseTitle] = useState<string>("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ course: courseId });
            if (statusFilter) params.set("status", statusFilter);

            const [enrollRes, statsRes, courseRes] = await Promise.all([
                fetchWithAuth(`/enrollments/?${params}`),
                fetchWithAuth(`/enrollments/course-stats/?course=${courseId}`),
                fetchWithAuth(`/courses/${courseId}/`),
            ]);

            if (!enrollRes.ok) throw new Error("Failed to load enrollments");
            setEnrollments(await enrollRes.json());

            if (statsRes.ok) setStats(await statsRes.json());
            if (courseRes.ok) {
                const c = await courseRes.json();
                setCourseTitle(c.title || `Course #${courseId}`);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [courseId, statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = enrollments.filter(e => {
        const q = search.toLowerCase();
        return !q || e.user_email.toLowerCase().includes(q) || e.user_name.toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/courses/${courseId}`} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Course</p>
                            <h1 className="font-bold text-gray-900 text-lg leading-tight">{courseTitle || `Course #${courseId}`}</h1>
                        </div>
                        <span className="text-gray-300 text-lg">/</span>
                        <span className="text-gray-700 font-semibold">Enrolled Learners</span>
                    </div>
                    <button onClick={loadData} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Stats cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Total Enrolled", value: stats.total_enrolled, icon: <Users size={18} />, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
                            { label: "In Progress", value: stats.in_progress, icon: <Clock size={18} />, color: "bg-blue-50 text-blue-600 border-blue-100" },
                            { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={18} />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                            { label: "New (Enrolled)", value: stats.enrolled, icon: <BookOpen size={18} />, color: "bg-amber-50 text-amber-600 border-amber-100" },
                            { label: "Completion Rate", value: `${stats.completion_rate}%`, icon: <Trophy size={18} />, color: "bg-violet-50 text-violet-600 border-violet-100" },
                        ].map(s => (
                            <div key={s.label} className={`${s.color} border rounded-xl p-4`}>
                                <div className="mb-2 opacity-70">{s.icon}</div>
                                <div className="text-2xl font-black">{s.value}</div>
                                <div className="text-xs font-semibold opacity-60 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="1">Enrolled</option>
                            <option value="2">In Progress</option>
                            <option value="3">Completed</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                            <RefreshCw size={20} className="animate-spin" />
                            <span>Loading enrollments...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-red-500">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No learners found</p>
                            <p className="text-sm mt-1">{search || statusFilter ? "Try adjusting your filters." : "No one has enrolled in this course yet."}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-4 px-5">Learner</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5">Progress</th>
                                    <th className="py-4 px-5">Quizzes</th>
                                    <th className="py-4 px-5">Enrolled</th>
                                    <th className="py-4 px-5">Completed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(e => {
                                    const pct = progressPct(e.lessons_completed, e.total_lessons);
                                    return (
                                        <tr
                                            key={e.id}
                                            onClick={() => setSelectedEnrollmentId(e.id)}
                                            className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                        >
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {(e.user_name || e.user_email)[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">
                                                            {e.user_name || "—"}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{e.user_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(e.status)}`}>
                                                    {e.status_display}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2 min-w-[100px]">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 w-9 shrink-0">{pct}%</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">{e.lessons_completed}/{e.total_lessons} lessons</p>
                                            </td>
                                            <td className="py-4 px-5 text-sm font-semibold text-gray-700">{e.quizzes_attempted}</td>
                                            <td className="py-4 px-5 text-sm text-gray-500">{fmtDate(e.created_at)}</td>
                                            <td className="py-4 px-5 text-sm text-gray-500">{fmtDate(e.completed_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="text-xs text-gray-400 text-center">
                    {filtered.length > 0 && `Showing ${filtered.length} of ${enrollments.length} learner${enrollments.length !== 1 ? 's' : ''}`}
                </p>
            </div>

            {/* Learner detail drawer */}
            {selectedEnrollmentId !== null && (
                <LearnerDetailDrawer
                    enrollmentId={selectedEnrollmentId}
                    onClose={() => setSelectedEnrollmentId(null)}
                />
            )}
        </div>
    );
}
