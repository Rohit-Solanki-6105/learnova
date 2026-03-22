"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, BookOpen, Clock, Loader2, AlertCircle, Search } from "lucide-react";
import CreateCourseModal from "@/components/CreateCourseModal";
import { fetchWithAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STATUS_MAP: Record<number, string> = { 1: "Draft", 2: "Published", 3: "Archived" };
function statusBadge(s: string) {
    if (s === "Published") return "bg-emerald-100 text-emerald-700";
    if (s === "Archived") return "bg-gray-100 text-gray-600";
    return "bg-amber-100 text-amber-700";
}

interface Course {
    id: string;
    title: string;
    status: string;
    totalLessons: number;
    totalDuration: string;
    price: string | number | null;
}

interface ApiCourse {
    id: string | number;
    title?: string;
    status?: number;
    total_lesson?: number;
    total_duration?: number;
    lessons?: unknown[];
    price?: string | number | null;
}

interface NewCoursePayload extends Partial<ApiCourse> {
    id: string | number;
}

const USD_TO_INR_RATE = 83;

function parsePrice(price: string | number | null): number | null {
    if (price == null) return null;
    const n = parseFloat(String(price));
    if (Number.isNaN(n) || n === 0) return null;
    return n;
}

function formatPriceUsd(price: string | number | null): string {
    const n = parsePrice(price);
    if (n == null) return "Free";
    return `$${n.toFixed(2)}`;
}

function formatPriceInr(price: string | number | null): string {
    const n = parsePrice(price);
    if (n == null) return "₹0";
    return `₹${(n * USD_TO_INR_RATE).toFixed(2)}`;
}

function mapApiCourse(c: ApiCourse): Course {
    return {
        id: String(c.id),
        title: c.title ?? "Untitled Course",
        status: STATUS_MAP[c.status] ?? "Draft",
        totalLessons: c.total_lesson ?? (c.lessons?.length ?? 0),
        totalDuration: c.total_duration ? `${c.total_duration}m` : "—",
        price: c.price ?? null,
    };
}

export default function InstructorCoursesPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

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

    const onCourseCreated = (newCourse: NewCoursePayload) => {
        setCourses(prev => [...prev, mapApiCourse({ ...newCourse, id: newCourse.id, status: 1 })]);
        setIsModalOpen(false);
        toast.success("Course created!", {
            action: { label: "Edit", onClick: () => router.push(`/instructor/courses/${newCourse.id}`) },
        });
    };

    const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#f9fafb] p-8 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage your course content and lessons.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm w-48"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors text-sm font-semibold"
                    >
                        <Plus size={17} /> Create Course
                    </button>
                </div>
            </div>

            {/* States */}
            {loading && (
                <div className="flex items-center justify-center py-32 text-gray-400">
                    <Loader2 className="animate-spin mr-3" size={28} /> Loading courses...
                </div>
            )}
            {!loading && fetchError && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <AlertCircle size={48} className="text-red-300" />
                    <p className="text-gray-500 font-medium">{fetchError}</p>
                    <button onClick={loadCourses} className="px-5 py-2 bg-indigo-500 text-white rounded-full text-sm font-semibold hover:bg-indigo-600">Retry</button>
                </div>
            )}
            {!loading && !fetchError && courses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-28 gap-4 text-gray-400 text-center">
                    <BookOpen size={56} className="opacity-25" />
                    <p className="font-semibold text-gray-500">No courses yet</p>
                    <p className="text-sm">Click &quot;Create Course&quot; to start building your first course.</p>
                </div>
            )}

            {/* Course grid */}
            {!loading && !fetchError && courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(course => (
                        <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            {/* Color bar by status */}
                            <div className={`h-1.5 rounded-t-2xl ${course.status === "Published" ? "bg-emerald-400" : course.status === "Archived" ? "bg-gray-300" : "bg-amber-400"}`} />
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <h3 className="font-bold text-gray-900 leading-snug">{course.title}</h3>
                                    <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold ${statusBadge(course.status)}`}>
                                        {course.status}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><BookOpen size={12} /> {course.totalLessons} lessons</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {course.totalDuration}</span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-800">{formatPriceUsd(course.price)}</p>
                                    <p className="text-xs text-gray-500">{formatPriceInr(course.price)}</p>
                                </div>
                                <div className="mt-auto pt-3 border-t border-gray-100">
                                    <a
                                        href={`/instructor/courses/${course.id}`}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm transition-colors"
                                    >
                                        <Edit2 size={14} /> Edit Course
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-400 text-sm">No courses match &quot;{search}&quot;</div>
                    )}
                </div>
            )}

            <CreateCourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCourseCreated={onCourseCreated}
                baseEditPath="/instructor/courses"
            />
        </div>
    );
}
