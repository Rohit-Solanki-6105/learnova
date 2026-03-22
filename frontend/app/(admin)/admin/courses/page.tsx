"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Kanban } from "react-kanban-kit";
import { Search, LayoutGrid, List, Plus, Edit2, Clock, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CreateCourseModal from "@/components/CreateCourseModal";
import { fetchWithAuth } from "@/lib/auth";

type CourseStatus = "Draft" | "Published" | "Archived";

const STATUS_NUM_TO_STR: Record<number, CourseStatus> = { 1: "Draft", 2: "Published", 3: "Archived" };
const STATUS_STR_TO_NUM: Record<CourseStatus, number> = { Draft: 1, Published: 2, Archived: 3 };

type ApiTag = string | { name: string };

interface ApiCourse {
    id: string | number;
    title?: string;
    tags?: ApiTag[];
    total_lesson?: number;
    total_duration?: number;
    lessons?: unknown[];
    status?: number;
}

type Course = {
    id: string;
    title: string;
    tags: string[];
    views: number;
    totalLessons: number;
    totalDuration: string;
    status: CourseStatus;
};

function mapApiCourse(c: ApiCourse): Course {
    return {
        id: String(c.id),
        title: c.title ?? "Untitled Course",
        tags: (c.tags || []).map((t) => (typeof t === "string" ? t : t.name)),
        views: 0,
        totalLessons: c.total_lesson ?? (c.lessons?.length ?? 0),
        totalDuration: c.total_duration ? `${c.total_duration}m` : "—",
        status: STATUS_NUM_TO_STR[c.status] ?? "Draft",
    };
}

export default function CoursesAdminPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [view, setView] = useState<"kanban" | "list">("kanban");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadCourses = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetchWithAuth("/courses/");
            if (!res.ok) throw new Error(`Server responded with ${res.status}`);
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
                setCourses(data.map((item) => mapApiCourse(item as ApiCourse)));
            } else {
                setCourses([]);
            }
        } catch (err: unknown) {
            setFetchError(err instanceof Error ? err.message : "Failed to load courses");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCourses(); }, [loadCourses]);

    const onCourseCreated = (newCourse: Course) => {
        setCourses(prev => [...prev, newCourse]);
        setIsModalOpen(false);
        toast.success("Course created!", {
            action: { label: "Edit", onClick: () => router.push(`/admin/courses/${newCourse.id}`) },
        });
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── Kanban Setup ─────────────────────────────────────────────────────────
    const draftCourses    = filteredCourses.filter(c => c.status === "Draft");
    const publishedCourses = filteredCourses.filter(c => c.status === "Published");
    const archivedCourses  = filteredCourses.filter(c => c.status === "Archived");

    const kanbanDataSource: Record<string, unknown> = {
        root: { id: "root", title: "Root", children: ["col-draft", "col-published", "col-archived"], totalChildrenCount: 3, parentId: null },
        "col-draft":     { id: "col-draft",     title: "Draft",     children: draftCourses.map(c => c.id),     totalChildrenCount: draftCourses.length,     parentId: "root" },
        "col-published": { id: "col-published", title: "Published", children: publishedCourses.map(c => c.id), totalChildrenCount: publishedCourses.length, parentId: "root" },
        "col-archived":  { id: "col-archived",  title: "Archived",  children: archivedCourses.map(c => c.id),  totalChildrenCount: archivedCourses.length,  parentId: "root" },
    };
    filteredCourses.forEach(course => {
        kanbanDataSource[course.id] = {
            id: course.id, title: course.title,
            parentId: `col-${course.status.toLowerCase()}`,
            children: [], totalChildrenCount: 0,
            type: "card", content: course,
        };
    });

    const configMap = {
        card: {
            render: ({ data }: { data: { content: Course } }) => {
                const c: Course = data.content;
                return (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 w-full">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-gray-900 leading-tight text-sm">{c.title}</h4>
                            <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-semibold ${c.status === "Published" ? "bg-emerald-100 text-emerald-700" : c.status === "Draft" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                {c.status}
                            </span>
                        </div>
                        {c.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {c.tags.map(tag => <span key={tag} className="bg-rose-50 text-rose-600 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>)}
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><BookOpen size={13} /> {c.totalLessons}</span>
                            <span className="flex items-center gap-1"><Clock size={13} /> {c.totalDuration}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex items-center justify-end">
                            <a href={`/admin/courses/${c.id}`} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                <Edit2 size={13} /> Edit
                            </a>
                        </div>
                    </div>
                );
            },
            isDraggable: true,
        },
        footer: {
            render: () => null,
            isDraggable: false,
        },
    };

    const onCardMove = async (moveInfo: { cardId: string; toColumnId: string }) => {
        const { cardId, toColumnId } = moveInfo;
        const match = toColumnId?.match(/col-(.*)/);
        if (!match) return;
        const newStatus = (match[1].charAt(0).toUpperCase() + match[1].slice(1)) as CourseStatus;

        const normalizedCardId = String(cardId);
        const prevCourse = courses.find((c) => c.id === normalizedCardId);
        if (!prevCourse || prevCourse.status === newStatus) return;

        setCourses((prev) =>
            prev.map((c) => (c.id === normalizedCardId ? { ...c, status: newStatus } : c))
        );

        const numStatus = STATUS_STR_TO_NUM[newStatus];
        if (!numStatus) {
            setCourses((prev) =>
                prev.map((c) => (c.id === normalizedCardId ? { ...c, status: prevCourse.status } : c))
            );
            toast.error("Invalid course status");
            return;
        }

        try {
            const res = await fetchWithAuth(`/courses/${normalizedCardId}/`, {
                method: "PATCH",
                body: JSON.stringify({ status: numStatus }),
            });

            if (!res.ok) {
                setCourses((prev) =>
                    prev.map((c) => (c.id === normalizedCardId ? { ...c, status: prevCourse.status } : c))
                );
                toast.error("Failed to update course status in database");
                return;
            }

            const updated = await res.json().catch(() => null);
            if (updated && typeof updated.status === "number") {
                const confirmedStatus = STATUS_NUM_TO_STR[updated.status] ?? prevCourse.status;
                setCourses((prev) =>
                    prev.map((c) => (c.id === normalizedCardId ? { ...c, status: confirmedStatus } : c))
                );
            }

            toast.success(`Course moved to ${newStatus}`);
        } catch {
            setCourses((prev) =>
                prev.map((c) => (c.id === normalizedCardId ? { ...c, status: prevCourse.status } : c))
            );
            toast.error("Network error while updating status");
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#2c2f30] p-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Courses</h1>
                    <p className="text-gray-500 mt-1">Manage, publish, and track your educational content.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 w-56 text-sm"
                        />
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-gray-200/50 p-1 rounded-full border border-gray-200">
                        <button onClick={() => setView("kanban")} className={`p-1.5 rounded-full transition-colors ${view === "kanban" ? "bg-white shadow-sm text-rose-600" : "text-gray-500 hover:text-gray-700"}`} title="Kanban"><LayoutGrid size={17} /></button>
                        <button onClick={() => setView("list")} className={`p-1.5 rounded-full transition-colors ${view === "list" ? "bg-white shadow-sm text-rose-600" : "text-gray-500 hover:text-gray-700"}`} title="List"><List size={17} /></button>
                    </div>
                    {/* Create */}
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#f43f5e] hover:bg-rose-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm">
                        <Plus size={17} /> Create Course
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-32 text-gray-400">
                    <Loader2 className="animate-spin mr-3" size={28} /> Loading courses...
                </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <AlertCircle size={48} className="text-red-300" />
                    <p className="text-gray-500 font-medium">{fetchError}</p>
                    <button onClick={loadCourses} className="px-5 py-2 bg-rose-500 text-white rounded-full text-sm font-semibold hover:bg-rose-600">Retry</button>
                </div>
            )}

            {/* Empty */}
            {!loading && !fetchError && courses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400 text-center">
                    <BookOpen size={56} className="opacity-30" />
                    <p className="font-semibold text-gray-500">No courses yet</p>
                    <p className="text-sm">Click &quot;Create Course&quot; to get started.</p>
                </div>
            )}

            {/* Kanban */}
            {!loading && !fetchError && courses.length > 0 && view === "kanban" && (
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-fit">
                        <Kanban dataSource={kanbanDataSource} configMap={configMap} onCardMove={onCardMove} />
                    </div>
                </div>
            )}

            {/* List */}
            {!loading && !fetchError && courses.length > 0 && view === "list" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                <th className="py-4 px-6">Course Title</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6">Stats</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(c => (
                                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="font-semibold text-gray-900">{c.title}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {c.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.status === "Published" ? "bg-emerald-100 text-emerald-700" : c.status === "Draft" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><BookOpen size={13} /> {c.totalLessons} lessons</span>
                                            <span className="flex items-center gap-1"><Clock size={13} /> {c.totalDuration}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-3">
                                            <a href={`/admin/courses/${c.id}`} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                                <Edit2 size={13} /> Edit
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCourses.length === 0 && (
                                <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm">No courses match &quot;{searchQuery}&quot;</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <CreateCourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCourseCreated={onCourseCreated}
                baseEditPath="/admin/courses"
            />
        </div>
    );
}
