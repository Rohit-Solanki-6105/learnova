"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Plus, Eye, EyeOff, Trash2, ArrowLeft, Edit2, X, Save,
    GripVertical, CheckCircle2, Archive, Globe, Lock,
    BookOpen, HelpCircle, Loader2, ImageIcon, ChevronDown,
    AlertCircle, Users
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import TextEditor from "@/components/TextEditor";
import LearnovaQuiz, { QuizData } from "@/components/Quiz";
import TagsInput, { Tag } from "@/components/TagsInput";
import { fetchWithAuth } from "@/lib/auth";

const LessonEditor = dynamic(() => import("@/components/Editor"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────

interface LessonData {
    id: number;
    title: string;
    sequence: number;
    description?: string;   // stored inside data.description
    data: any;              // EditorJS JSON
    course: number;
    duration: number;       // minutes
}

interface QuizFromApi {
    id: number;
    title: string;
    description: string;
    sequence: number;
    data: QuizData | null;
    course: number;
    duration: number;       // minutes
}

interface ContentItem {
    kind: "lesson" | "quiz";
    id: number;
    title: string;
    sequence: number;
}

interface Instructor {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: number;
}

interface CourseDetail {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    status: 1 | 2 | 3;
    visibility: 1 | 2;
    responsible: number | null;
    price: string | null;
    tags: Tag[];
    lessons: LessonData[];
    quizzes: QuizFromApi[];
    total_lesson: number;
    total_duration: number;
}

interface CourseEditorProps {
    courseId: string;
    role: "admin" | "instructor";
}

const STATUS_MAP: Record<number, string> = { 1: "Draft", 2: "Published", 3: "Archived" };

function statusBadgeClass(status: number) {
    if (status === 2) return "bg-emerald-100 text-emerald-700";
    if (status === 3) return "bg-gray-100 text-gray-600";
    return "bg-amber-100 text-amber-700";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseEditorWrapper({ courseId, role }: CourseEditorProps) {
    const backLink = role === "admin" ? "/admin/courses" : "/instructor/courses";
    const numericId = parseInt(courseId, 10);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [status, setStatus] = useState<1 | 2 | 3>(1);
    const [visibility, setVisibility] = useState<1 | 2>(1);
    const [responsibleId, setResponsibleId] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [price, setPrice] = useState<string>("");
    const [totalDuration, setTotalDuration] = useState<number>(0);
    const [totalLesson, setTotalLesson] = useState<number>(0);

    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [activeTab, setActiveTab] = useState<"content" | "description" | "overview">("content");
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);

    const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
    const [editingQuiz, setEditingQuiz] = useState<QuizFromApi | null>(null);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // ─── Fetch helpers ────────────────────────────────────────────────────────

    const fetchCourse = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`/courses/${numericId}/`);
            if (!res.ok) throw new Error(`Failed to load course (${res.status})`);
            const data: CourseDetail = await res.json();

            setCourseTitle(data.title);
            setCourseDescription(data.description || "");
            setThumbnail(data.thumbnail || "");
            setStatus(data.status);
            setVisibility(data.visibility);
            setResponsibleId(data.responsible);
            setSelectedTags(data.tags ?? []);
            setPrice(data.price ? String(data.price) : "");
            setTotalDuration(data.total_duration ?? 0);
            setTotalLesson(data.total_lesson ?? 0);

            const merged: ContentItem[] = [
                ...data.lessons.map(l => ({ kind: "lesson" as const, id: l.id, title: l.title, sequence: l.sequence })),
                ...data.quizzes.map(q => ({ kind: "quiz" as const, id: q.id, title: q.title, sequence: q.sequence })),
            ].sort((a, b) => a.sequence - b.sequence);
            setContentItems(merged);
        } catch (err: any) {
            setError(err.message || "Failed to load course");
        } finally {
            setLoading(false);
        }
    }, [numericId]);

    const fetchInstructors = useCallback(async () => {
        try {
            const res = await fetchWithAuth("/users/");
            if (!res.ok) return;
            const users: Instructor[] = await res.json();
            setInstructors(users.filter(u => u.role === 2));
        } catch { }
    }, []);

    useEffect(() => {
        fetchCourse();
        fetchInstructors();
    }, [fetchCourse, fetchInstructors]);

    // ─── Course PATCH ─────────────────────────────────────────────────────────

    const saveCourse = async (patch: object) => {
        setSaving(true);
        try {
            const res = await fetchWithAuth(`/courses/${numericId}/`, {
                method: "PATCH",
                body: JSON.stringify(patch),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(JSON.stringify(err));
            }
            return true;
        } catch (err: any) {
            toast.error("Save failed: " + (err.message || "Unknown error"));
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDetails = async () => {
        const priceVal = price.trim() === '' || parseFloat(price) === 0 ? null : parseFloat(price).toFixed(2);
        const ok = await saveCourse({
            title: courseTitle,
            description: courseDescription,
            thumbnail: thumbnail || null,
            visibility,
            responsible: responsibleId,
            tag_ids: selectedTags.map(t => t.id),
            price: priceVal,
        });
        if (ok) toast.success("Course details saved!");
    };

    const handleStatusChange = async (newStatus: 1 | 2 | 3) => {
        const ok = await saveCourse({ status: newStatus });
        if (ok) {
            setStatus(newStatus);
            const labels: Record<number, string> = { 1: "moved to Draft", 2: "Published!", 3: "Archived" };
            toast.success(`Course ${labels[newStatus]}`);
        }
    };

    // ─── Add content ──────────────────────────────────────────────────────────

    const nextSeq = () =>
        contentItems.length > 0 ? Math.max(...contentItems.map(i => i.sequence)) + 1 : 1;

    const handleAddLesson = async () => {
        const res = await fetchWithAuth("/lessons/", {
            method: "POST",
            body: JSON.stringify({
                course: numericId,
                title: "New Lesson",
                sequence: nextSeq(),
                data: { time: Date.now(), blocks: [], description: "" },
            }),
        });
        if (!res.ok) { toast.error("Failed to create lesson"); return; }
        const lesson: LessonData = await res.json();
        setContentItems(prev => [...prev, { kind: "lesson", id: lesson.id, title: lesson.title, sequence: lesson.sequence }]);
        setEditingLesson(lesson);
        toast.success("Lesson added!");
    };

    const handleAddQuiz = async () => {
        const defaultQuizData: QuizData = {
            quizTitle: "New Quiz",
            quizSynopsis: "Test your knowledge with this quiz.",
            questions: [],
        };
        const res = await fetchWithAuth("/quizzes/", {
            method: "POST",
            body: JSON.stringify({
                course: numericId,
                title: "New Quiz",
                description: "",
                sequence: nextSeq(),
                data: defaultQuizData,
            }),
        });
        if (!res.ok) { toast.error("Failed to create quiz"); return; }
        const quiz: QuizFromApi = await res.json();
        setContentItems(prev => [...prev, { kind: "quiz", id: quiz.id, title: quiz.title, sequence: quiz.sequence }]);
        setEditingQuiz(quiz);
        toast.success("Quiz added!");
    };

    const handleDeleteItem = async (item: ContentItem) => {
        const endpoint = item.kind === "lesson" ? `/lessons/${item.id}/` : `/quizzes/${item.id}/`;
        const res = await fetchWithAuth(endpoint, { method: "DELETE" });
        if (res.ok || res.status === 204) {
            setContentItems(prev => prev.filter(i => !(i.kind === item.kind && i.id === item.id)));
            toast.success(`${item.kind === "lesson" ? "Lesson" : "Quiz"} deleted`);
        } else {
            toast.error("Failed to delete item");
        }
    };

    // ─── Drag & drop ──────────────────────────────────────────────────────────

    const handleDrop = async () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;

        const reordered = [...contentItems];
        const dragged = reordered.splice(dragItem.current, 1)[0];
        reordered.splice(dragOverItem.current, 0, dragged);
        const withSeq = reordered.map((item, idx) => ({ ...item, sequence: idx + 1 }));
        setContentItems(withSeq);
        dragItem.current = null;
        dragOverItem.current = null;

        try {
            await Promise.all(withSeq.map(item => {
                const ep = item.kind === "lesson" ? `/lessons/${item.id}/` : `/quizzes/${item.id}/`;
                return fetchWithAuth(ep, { method: "PATCH", body: JSON.stringify({ sequence: item.sequence }) });
            }));
            toast.success("Order saved!");
        } catch {
            toast.error("Failed to save order");
        }
    };

    // ─── Open edit view ───────────────────────────────────────────────────────

    const openEdit = async (item: ContentItem) => {
        if (item.kind === "lesson") {
            const res = await fetchWithAuth(`/lessons/${item.id}/`);
            if (res.ok) setEditingLesson(await res.json());
        } else {
            const res = await fetchWithAuth(`/quizzes/${item.id}/`);
            if (res.ok) setEditingQuiz(await res.json());
        }
    };

    // ─── Render states ────────────────────────────────────────────────────────

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
                <p className="text-sm font-medium">Loading course...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                <AlertCircle size={48} className="text-red-400" />
                <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
                <p className="text-sm text-gray-500">{error}</p>
                <div className="flex gap-3">
                    <button onClick={fetchCourse} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700">Retry</button>
                    <Link href={backLink} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200">Go Back</Link>
                </div>
            </div>
        </div>
    );

    if (editingLesson) return (
        <LessonEditView
            lesson={editingLesson}
            onClose={() => { setEditingLesson(null); fetchCourse(); }}
        />
    );

    if (editingQuiz) return (
        <QuizEditView
            quiz={editingQuiz}
            onClose={() => { setEditingQuiz(null); fetchCourse(); }}
        />
    );

    // ─── Main editor UI ───────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#2c2f30] font-sans pb-20 p-6 md:p-8">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-sm font-medium text-gray-500">
                <Link href={backLink} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <span className="mx-3 text-gray-300">/</span>
                <span className="text-gray-900 truncate max-w-xs">{courseTitle || `Course #${courseId}`}</span>
                <span className={`ml-3 text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusBadgeClass(status)}`}>
                    {STATUS_MAP[status]}
                </span>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                {/* Header Actions */}
                <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 pb-8 border-b border-gray-100">
                    {/* Visibility dropdown */}
                    <div className="relative">
                        <select
                            value={visibility}
                            onChange={e => setVisibility(Number(e.target.value) as 1 | 2)}
                            className="appearance-none pl-9 pr-7 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                        >
                            <option value={1}>Everyone</option>
                            <option value={2}>Invited Only</option>
                        </select>
                        {visibility === 1
                            ? <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            : <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        }
                    </div>

                    {/* Status & save */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={`/${role === "admin" ? "admin" : "instructor"}/courses/${courseId}/enrolled`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                            <Users size={15} />
                            Enrolled · {totalLesson} lessons
                        </Link>
                        {status !== 3 && (
                            <button
                                onClick={() => handleStatusChange(status === 2 ? 1 : 2)}
                                disabled={saving}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${status === 2 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {status === 2 ? "Unpublish" : "Publish"}
                            </button>
                        )}
                        {status !== 3 ? (
                            <button onClick={() => handleStatusChange(3)} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                                <Archive size={16} /> Archive
                            </button>
                        ) : (
                            <button onClick={() => handleStatusChange(1)} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors">
                                <AlertCircle size={16} /> Restore to Draft
                            </button>
                        )}
                        <button onClick={handleSaveDetails} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white transition-colors shadow-sm">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save
                        </button>
                    </div>
                </div>

                {/* Core Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 py-10">
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Course Title</label>
                            <input
                                type="text"
                                value={courseTitle}
                                onChange={e => setCourseTitle(e.target.value)}
                                className="w-full text-3xl md:text-4xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none bg-transparent focus:ring-0 p-0 outline-none"
                                placeholder="e.g: Basics of Odoo CRM"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Tags</label>
                            <TagsInput
                                selectedTags={selectedTags}
                                onChange={setSelectedTags}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Responsible Instructor</label>
                            <div className="relative max-w-sm">
                                <select
                                    value={responsibleId ?? ""}
                                    onChange={e => setResponsibleId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">— Unassigned —</option>
                                    {instructors.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username || u.email}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Price (USD)</label>
                            <div className="relative max-w-xs">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Leave empty or 0 for free access</p>
                        </div>
                    </div>

                    {/* Cover URL */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Cover Image URL</label>
                        {thumbnail ? (
                            <div className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={thumbnail} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button onClick={() => setThumbnail("")} className="bg-white rounded-full p-2 text-gray-700 hover:text-red-600"><X size={18} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all p-4">
                                <ImageIcon size={36} className="mb-2 opacity-40" />
                                <span className="text-xs font-medium text-center">Paste URL below</span>
                            </div>
                        )}
                        <input
                            type="url"
                            value={thumbnail}
                            onChange={e => setThumbnail(e.target.value)}
                            placeholder="https://example.com/cover.jpg"
                            className="mt-3 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-100 mb-8">
                    {(["content", "description", "overview"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors capitalize ${activeTab === tab ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"}`}>
                            {tab === 'overview' ? 'Overview' : tab === 'description' ? 'Description' : 'Content'}
                        </button>
                    ))}
                </div>

                {/* ─── Content tab ─── */}
                {activeTab === "content" && (
                    <div className="animate-in fade-in duration-200">
                        {contentItems.length > 0 ? (
                            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6 bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            <th className="py-4 pl-4 w-8"></th>
                                            <th className="py-4 px-3 w-10">#</th>
                                            <th className="py-4 px-4">Title</th>
                                            <th className="py-4 px-4">Type</th>
                                            <th className="py-4 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contentItems.map((item, idx) => (
                                            <tr
                                                key={`${item.kind}-${item.id}`}
                                                draggable
                                                onDragStart={() => { dragItem.current = idx; }}
                                                onDragEnter={() => { dragOverItem.current = idx; }}
                                                onDragEnd={handleDrop}
                                                onDragOver={e => e.preventDefault()}
                                                className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group cursor-grab active:cursor-grabbing"
                                            >
                                                <td className="pl-4 text-gray-300 group-hover:text-gray-400"><GripVertical size={16} /></td>
                                                <td className="py-4 px-3">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm text-gray-400 border border-gray-100 text-xs font-bold">{idx + 1}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${item.kind === "lesson" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"}`}>
                                                        {item.kind === "lesson" ? <BookOpen size={12} /> : <HelpCircle size={12} />}
                                                        {item.kind === "lesson" ? "Lesson" : "Quiz"}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100" title="Edit">
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button onClick={() => handleDeleteItem(item)} className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100" title="Delete">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl mb-6 text-gray-400">
                                <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="font-semibold text-gray-500">No content yet</p>
                                <p className="text-sm">Add lessons or quizzes below.</p>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button onClick={handleAddLesson} className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-400 text-indigo-600 font-bold rounded-2xl transition-all text-sm">
                                <Plus size={18} /> Add Lesson
                            </button>
                            <button onClick={handleAddQuiz} className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-violet-200 bg-violet-50/50 hover:bg-violet-100 hover:border-violet-400 text-violet-600 font-bold rounded-2xl transition-all text-sm">
                                <Plus size={18} /> Add Quiz
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Description tab ─── */}
                {activeTab === "description" && (
                    <div className="animate-in fade-in duration-200">
                        <p className="text-gray-400 text-sm mb-4">This description is shown on the course landing page.</p>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <TextEditor text={courseDescription} setText={setCourseDescription} placeholder="Write a compelling course description here..." />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleSaveDetails} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Description
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Overview tab ─── */}
                {activeTab === "overview" && (
                    <div className="animate-in fade-in duration-200 space-y-6">
                        {/* Stat grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Lessons', value: totalLesson, icon: '📚', color: 'bg-indigo-50 text-indigo-600' },
                                { label: 'Quizzes', value: contentItems.filter(i => i.kind === 'quiz').length, icon: '❓', color: 'bg-violet-50 text-violet-600' },
                                { label: 'Total Duration', value: totalDuration > 0 ? `${totalDuration} min` : '—', icon: '⏱', color: 'bg-emerald-50 text-emerald-600' },
                                { label: 'Price', value: price ? `$${parseFloat(price).toFixed(2)}` : 'Free', icon: '💰', color: 'bg-amber-50 text-amber-600' },
                            ].map(s => (
                                <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-current/10`}>
                                    <div className="text-2xl mb-2">{s.icon}</div>
                                    <div className="text-2xl font-black">{s.value}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Course info table */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Course Details</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <dt className="text-gray-400 font-medium">Course ID</dt>
                                    <dd className="font-semibold text-gray-800">#{courseId}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <dt className="text-gray-400 font-medium">Status</dt>
                                    <dd><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(status)}`}>{STATUS_MAP[status]}</span></dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <dt className="text-gray-400 font-medium">Visibility</dt>
                                    <dd className="font-semibold text-gray-800">{visibility === 1 ? 'Everyone' : 'Invited Only'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <dt className="text-gray-400 font-medium">Tags</dt>
                                    <dd className="font-semibold text-gray-800">{selectedTags.length > 0 ? selectedTags.map(t => t.name).join(', ') : '—'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <dt className="text-gray-400 font-medium">Lesson Duration</dt>
                                    <dd className="font-semibold text-gray-800">{totalDuration > 0 ? `${totalDuration} min` : '—'}</dd>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <dt className="text-gray-400 font-medium">Price</dt>
                                    <dd className="font-semibold text-gray-800">{price ? `$${parseFloat(price).toFixed(2)}` : 'Free'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Lesson Edit View ─────────────────────────────────────────────────────────

function LessonEditView({ lesson, onClose }: { lesson: LessonData; onClose: () => void }) {
    // Description is stored inside data.description field
    const [title, setTitle] = useState(lesson.title);
    const [lessonDuration, setLessonDuration] = useState<number>(lesson.duration ?? 0);
    const [description, setDescription] = useState<string>(
        typeof lesson.data === "object" && lesson.data !== null
            ? (lesson.data.description ?? "")
            : ""
    );
    const [editorData, setEditorData] = useState<any>(
        lesson.data
            ? { ...lesson.data, description: undefined }
            : { time: Date.now(), blocks: [] }
    );
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                title,
                duration: lessonDuration,
                data: { ...editorData, description },
            };
            const res = await fetchWithAuth(`/lessons/${lesson.id}/`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Save failed");
            toast.success("Lesson saved!");
            onClose();
        } catch {
            toast.error("Failed to save lesson");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] font-sans pb-20">
            {/* Sticky bar */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"><ArrowLeft size={18} /></button>
                    <span className="font-bold text-gray-800 text-sm">Editing Lesson</span>
                    <span className="text-xs text-gray-400">#{lesson.id}</span>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setPreview(p => !p)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${preview ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        {preview ? <EyeOff size={15} /> : <Eye size={15} />}
                        {preview ? "Edit" : "Preview"}
                    </button>
                    <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Lesson
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
                {preview ? (
                    // Preview mode — render exactly what the learner will see
                    <div className="space-y-6">
                        {/* Learner-view banner */}
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3">
                            <Eye size={16} className="text-indigo-500" />
                            <p className="text-indigo-700 text-sm font-semibold">Learner Preview — this is exactly what students will see</p>
                        </div>

                        {/* Lesson page wrapper (mimics learner player) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Hero header */}
                            <div className="px-8 pt-10 pb-6 border-b border-gray-100">
                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Lesson</span>
                                <h1 className="text-3xl font-extrabold text-gray-900 mt-2 leading-tight">{title}</h1>
                                {description && (
                                    <div
                                        className="mt-4 text-gray-600 text-base leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: description }}
                                    />
                                )}
                            </div>

                            {/* Content blocks rendered via the Editor's read-only BlocksViewer */}
                            <div className="px-2 py-2">
                                <LessonEditor
                                    is_editting={false}
                                    file={editorData}
                                    setFile={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Edit mode
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Lesson Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-indigo-500 bg-transparent p-2 outline-none transition-colors" />
                            </div>
                            <div className="max-w-xs">
                                <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Duration (minutes)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number" min={0} step={1}
                                        value={lessonDuration}
                                        onChange={e => setLessonDuration(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-28 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700"
                                    />
                                    <span className="text-sm text-gray-400 font-medium">min</span>
                                    {lessonDuration > 0 && <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">⏱ {Math.floor(lessonDuration / 60)}h {lessonDuration % 60}m</span>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Description (Rich Text)</label>
                                <TextEditor text={description} setText={setDescription} placeholder="Briefly describe what this lesson covers..." />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">Lesson Content</h3>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">EditorJS</span>
                            </div>
                            <div className="p-2">
                                <LessonEditor is_editting={true} file={editorData} setFile={setEditorData} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Quiz Edit View ───────────────────────────────────────────────────────────

function QuizEditView({ quiz, onClose }: { quiz: QuizFromApi; onClose: () => void }) {
    const [title, setTitle] = useState(quiz.title);
    const [description, setDescription] = useState(quiz.description || "");
    const [quizDuration, setQuizDuration] = useState<number>(quiz.duration ?? 0);
    const [quizData, setQuizData] = useState<QuizData>(
        quiz.data ?? { quizTitle: quiz.title, quizSynopsis: quiz.description || "", questions: [] }
    );
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        setQuizData(prev => ({ ...prev, quizTitle: val }));
    };

    const handleDescriptionChange = (val: string) => {
        setDescription(val);
        setQuizData(prev => ({ ...prev, quizSynopsis: val }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetchWithAuth(`/quizzes/${quiz.id}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    title,
                    description,
                    duration: quizDuration,
                    data: quizData,
                }),
            });
            if (!res.ok) throw new Error("Save failed");
            toast.success("Quiz saved!");
            onClose();
        } catch {
            toast.error("Failed to save quiz");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] font-sans pb-20">
            {/* Sticky bar */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"><ArrowLeft size={18} /></button>
                    <span className="font-bold text-gray-800 text-sm">Editing Quiz</span>
                    <span className="text-xs text-gray-400">#{quiz.id}</span>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setPreview(p => !p)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${preview ? "bg-violet-100 text-violet-700 hover:bg-violet-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        {preview ? <EyeOff size={15} /> : <Eye size={15} />}
                        {preview ? "Edit" : "Preview"}
                    </button>
                    <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 flex items-center gap-2 shadow-sm">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Quiz
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
                {preview ? (
                    // Preview (attempt) mode using the Quiz component
                    <div className="space-y-4">
                        <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-3 flex items-center gap-2">
                            <Eye size={16} className="text-violet-500" />
                            <p className="text-violet-700 text-sm font-semibold">Learner Preview — this is how students will experience this quiz</p>
                        </div>
                        <LearnovaQuiz status="attempting" data={quizData} duration={quizDuration} />
                    </div>
                ) : (
                    // Edit mode
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Quiz Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-violet-500 bg-transparent p-2 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Description / Synopsis</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={e => handleDescriptionChange(e.target.value)}
                                    placeholder="Brief description shown before the quiz starts..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm"
                                />
                            </div>
                            <div className="max-w-xs">
                                <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">Time Limit (minutes)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number" min={0} step={1}
                                        value={quizDuration}
                                        onChange={e => setQuizDuration(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-28 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-semibold text-gray-700"
                                    />
                                    <span className="text-sm text-gray-400 font-medium">min</span>
                                    {quizDuration > 0
                                        ? <span className="text-xs text-violet-600 font-semibold bg-violet-50 px-2.5 py-1 rounded-full">⏱ Countdown timer active</span>
                                        : <span className="text-xs text-gray-400">No limit (0 = unlimited)</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Full quiz question editor */}
                        <LearnovaQuiz
                            status="editing"
                            data={quizData}
                            setData={newData => setQuizData(newData)}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
