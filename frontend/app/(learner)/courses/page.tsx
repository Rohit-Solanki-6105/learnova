"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ChevronDown,
    ListFilter,
    PlayCircle,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

// Cover color palette (Learnova – red/white/black theme with accents)
const COVER_COLORS = [
    "bg-[#65A391]", // Teal
    "bg-[#D9A34A]", // Gold
    "bg-[#A7BC93]", // Moss
    "bg-[#7180B9]", // Blue
    "bg-[#D68C8C]", // Coral
    "bg-[#6CABDD]", // Light blue
];

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
    created_by: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    } | null;
}

interface Enrollment {
    id: number;
    course: number;
    user: number;
    status: number;
}

const USD_TO_INR_RATE = 83;

function formatDuration(minutes: number): string {
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h`;
    return `${minutes}m`;
}

function parsePrice(price: string | number | null): number | null {
    if (price == null) return null;
    const n = parseFloat(String(price));
    if (n === 0) return null;
    if (Number.isNaN(n)) return null;
    return n;
}

function formatPrice(price: string | number | null): string {
    const n = parsePrice(price);
    if (n == null) return "Free";
    return `$${n.toFixed(2)}`;
}

function formatPriceInr(price: string | number | null): string {
    const n = parsePrice(price);
    if (n == null) return "₹0";
    return `₹${(n * USD_TO_INR_RATE).toFixed(2)}`;
}

export default function CoursesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Learners should only see published courses.
                const res = await fetchWithAuth("/courses/?status=2&visibility=1");
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                const data = await res.json();
                setCourses(data);

                const enrollRes = await fetchWithAuth("/enrollments/");
                if (enrollRes.ok) {
                    const enrollData = await enrollRes.json();
                    setEnrollments(
                        new Set(enrollData.map((e: Enrollment) => e.course))
                    );
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load courses");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEnroll = async (courseId: number) => {
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
            setEnrolling((prev) => ({ ...prev, [courseId]: true }));
            setError(null);
            const res = await fetchWithAuth("/enrollments/", {
                method: "POST",
                body: JSON.stringify({ course: courseId, status: 1 }),
            });

            if (res.status === 401) {
                router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || data.detail || data.message || "Failed to enroll");
            }
            setEnrollments((prev) => new Set([...prev, courseId]));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to enroll in course");
            console.error("Error enrolling:", err);
        } finally {
            setEnrolling((prev) => ({ ...prev, [courseId]: false }));
        }
    };

    const allTags = Array.from(new Set(courses.flatMap((c) => c.tags.map((t) => t.name))));
    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || course.tags.some((t) => t.name === selectedTag);
        return matchesSearch && matchesTag;
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-[#f3184c] animate-spin mb-4" />
                <p className="text-[#5d5f5e] font-medium">Loading courses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Hero Section */}
            <div className="bg-white border-b border-[#e8e8e8] px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto py-16 md:py-20 text-center">
                    <h1
                        className="text-4xl md:text-6xl font-extrabold text-[#1a1c1c] tracking-tight leading-tight mb-6"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Unlock Your Potential with Expert-Led Courses
                    </h1>
                    <p className="text-lg text-[#5d5f5e] font-medium mb-10 max-w-2xl mx-auto">
                        Join thousands of learners mastering new skills every day. From technical deep-dives to creative masterclasses.
                    </p>

                    <div className="relative max-w-2xl mx-auto flex items-center shadow-[0_10px_30px_rgba(30,30,30,0.06)] rounded-full group">
                        <Search
                            className="absolute left-6 text-[#5d5f5e] group-focus-within:text-[#f3184c] transition-colors"
                            size={24}
                        />
                        <input
                            type="text"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-32 py-5 text-lg bg-white border-2 border-transparent focus:border-[#f3184c]/30 rounded-full outline-none transition-all"
                        />
                        <button className="absolute right-3 px-6 py-3 bg-[#1a1c1c] hover:bg-black text-white font-bold rounded-full transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
                {/* Error Alert */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 mb-8">
                        <AlertCircle className="h-5 w-5 text-[#f3184c] flex-shrink-0" />
                        <p className="text-sm text-red-800 flex-1">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-[#f3184c] hover:text-[#e01445] font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 no-scrollbar">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                                selectedTag === null
                                    ? "bg-[#f3184c] text-white shadow-md shadow-rose-500/20"
                                    : "bg-white text-[#5d5f5e] hover:bg-[#f3f3f3] border border-[#e8e8e8]"
                            }`}
                        >
                            All Courses
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                                    selectedTag === tag
                                        ? "bg-[#f3184c] text-white shadow-md shadow-rose-500/20"
                                        : "bg-white text-[#5d5f5e] hover:bg-[#f3f3f3] border border-[#e8e8e8]"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[#e8e8e8] rounded-full text-sm font-bold text-[#1a1c1c] hover:bg-[#f3f3f3] transition-colors">
                            <ListFilter size={18} /> Filters
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[#e8e8e8] rounded-full text-sm font-bold text-[#1a1c1c] hover:bg-[#f3f3f3] transition-colors">
                            Sort By <ChevronDown size={18} className="text-[#5d5f5e]" />
                        </button>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCourses.map((course, idx) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            coverColor={COVER_COLORS[idx % COVER_COLORS.length]}
                            isEnrolled={enrollments.has(course.id)}
                            isEnrolling={enrolling[course.id] ?? false}
                            onEnroll={() => handleEnroll(course.id)}
                        />
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="py-32 text-center">
                        <Search size={48} className="mx-auto text-[#e8e8e8] mb-6" />
                        <h3 className="text-2xl font-bold text-[#1a1c1c] mb-2">No courses found</h3>
                        <p className="text-[#5d5f5e] mb-6">
                            {searchQuery || selectedTag
                                ? "We couldn't find anything matching your filters."
                                : "Check back soon for more courses."}
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedTag(null);
                            }}
                            className="px-8 py-4 bg-[#f3184c] hover:bg-[#e01445] text-white font-bold rounded-full transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#1a1c1c] text-white mt-20 py-16">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-2">
                        <span className="text-2xl font-extrabold tracking-tight mb-4 block" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            Learnova
                        </span>
                        <p className="text-[#a0a0a0] text-sm max-w-sm">
                            Empowering learners worldwide through accessible, premium education.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Platform</h4>
                        <ul className="space-y-3 text-sm text-[#a0a0a0]">
                            <li><Link href="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
                            <li><Link href="/my-courses" className="hover:text-white transition-colors">My Learning</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-3 text-sm text-[#a0a0a0]">
                            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}

interface CourseCardProps {
    course: Course;
    coverColor: string;
    isEnrolled: boolean;
    isEnrolling: boolean;
    onEnroll: () => void;
}

function CourseCard({ course, coverColor, isEnrolled, isEnrolling, onEnroll }: CourseCardProps) {
    const instructorName = course.created_by
        ? `${course.created_by.first_name} ${course.created_by.last_name}`.trim() || course.created_by.username
        : "Unknown Instructor";

    return (
        <div className="group flex flex-col bg-white rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(30,30,30,0.06)] border border-[#e8e8e8] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex">
            {/* Cover */}
            <div className={`h-[240px] ${coverColor} relative p-6 flex flex-col justify-between overflow-hidden`}>
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : null}
                <div className="flex gap-2 relative z-10">
                    {course.tags.slice(0, 2).map((tag) => (
                        <span
                            key={tag.id}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md bg-[#1a1c1c]/40 text-white backdrop-blur-md"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
                {!course.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                        <div className="text-center transform rotate-[-5deg] scale-110">
                            <span className="text-[64px] font-black text-white leading-[0.8] tracking-tighter mix-blend-overlay">COURSE</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-1">
                <h3
                    className="text-[22px] leading-snug font-extrabold text-[#1a1c1c] mb-3 group-hover:text-[#f3184c] transition-colors"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                    {course.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5d5f5e] mb-6 flex-1 line-clamp-2">
                    {course.description}
                </p>

                <div className="flex items-center gap-4 text-[13px] font-bold text-[#1a1c1c] mb-8 border-t border-[#e8e8e8] pt-6">
                    <div className="flex items-center gap-1.5">
                        <PlayCircle size={16} className="text-[#5d5f5e]" /> {course.total_lesson} Lessons
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-[#5d5f5e]" /> {formatDuration(course.total_duration)}
                    </div>
                </div>

                <p className="text-xs text-[#5d5f5e] mb-4">by {instructorName}</p>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-[#1a1c1c]">{formatPrice(course.price)}</span>
                        <span className="text-xs font-semibold text-[#5d5f5e]">{formatPriceInr(course.price)}</span>
                    </div>
                    {isEnrolled ? (
                        <Link
                            href={`/courses/${course.id}`}
                            className="px-6 py-3 bg-[#f3184c] hover:bg-[#e01445] text-white font-bold rounded-xl text-sm transition-colors"
                        >
                            View Details
                        </Link>
                    ) : (
                        <button
                            onClick={onEnroll}
                            disabled={isEnrolling}
                            className="px-6 py-3 bg-[#1a1c1c] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
                        >
                            {isEnrolling ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Enrolling...
                                </>
                            ) : (
                                "Enroll Now"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
