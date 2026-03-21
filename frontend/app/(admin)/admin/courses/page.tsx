"use client";

import React, { useState } from "react";
import { Kanban } from "react-kanban-kit";
import { Search, LayoutGrid, List, Plus, Edit2, Share2, Eye, Clock, BookOpen, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CreateCourseModal from "@/components/CreateCourseModal";

type CourseStatus = "Draft" | "Published" | "Archived";

type Course = {
    id: string;
    title: string;
    tags: string[];
    views: number;
    totalLessons: number;
    totalDuration: string;
    status: CourseStatus;
};

const INITIAL_COURSES: Course[] = [
    { id: "c1", title: "Mastering UI/UX Systems", tags: ["Design", "Pro"], views: 1200, totalLessons: 48, totalDuration: "12h 45m", status: "Published" },
    { id: "c2", title: "Advanced React Patterns", tags: ["Frontend", "Code"], views: 850, totalLessons: 32, totalDuration: "8h 20m", status: "Published" },
    { id: "c3", title: "Introduction to Figma", tags: ["Design", "Beginner"], views: 0, totalLessons: 15, totalDuration: "3h 10m", status: "Draft" },
    { id: "c4", title: "Legacy Angular Course", tags: ["Code"], views: 3200, totalLessons: 55, totalDuration: "16h 00m", status: "Archived" },
];

export default function CoursesAdminPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
    const [view, setView] = useState<"kanban" | "list">("kanban");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredCourses = courses.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onCourseCreated = (newCourse: Course) => {
        setCourses((prevCourses) => [...prevCourses, newCourse]);
        setIsModalOpen(false);
        toast.success("Course created successfully!", {
            action: {
                label: "Edit Course",
                onClick: () => router.push(`/admin/courses/${newCourse.id}`),
            },
        });
    };

    // Build Kanban data source
    const draftCourses = filteredCourses.filter(c => c.status === "Draft");
    const publishedCourses = filteredCourses.filter(c => c.status === "Published");
    const archivedCourses = filteredCourses.filter(c => c.status === "Archived");

    const kanbanDataSource: any = {
        root: {
            id: "root",
            title: "Root",
            children: ["col-draft", "col-published", "col-archived"],
            totalChildrenCount: 3,
            parentId: null,
        },
        "col-draft": { id: "col-draft", title: "Draft", children: draftCourses.map(c => c.id), totalChildrenCount: draftCourses.length, parentId: "root" },
        "col-published": { id: "col-published", title: "Published", children: publishedCourses.map(c => c.id), totalChildrenCount: publishedCourses.length, parentId: "root" },
        "col-archived": { id: "col-archived", title: "Archived", children: archivedCourses.map(c => c.id), totalChildrenCount: archivedCourses.length, parentId: "root" },
    };

    filteredCourses.forEach(course => {
        kanbanDataSource[course.id] = {
            id: course.id,
            title: course.title,
            parentId: `col-${course.status.toLowerCase()}`,
            children: [],
            totalChildrenCount: 0,
            type: "card",
            content: course,
        };
    });

    const configMap = {
        card: {
            render: ({ data }: any) => {
                const c: Course = data.content;
                return (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 w-full">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900 leading-tight">{c.title}</h4>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${c.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                c.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {c.status}
                            </span>
                        </div>
                        {c.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {c.tags.map(tag => (
                                    <span key={tag} className="bg-rose-50 text-rose-600 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><Eye size={14} /> {c.views}</span>
                            <span className="flex items-center gap-1"><BookOpen size={14} /> {c.totalLessons}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {c.totalDuration}</span>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-3 flex items-center justify-end gap-2">
                            <button className="text-gray-400 hover:text-rose-600 transition-colors" title="Share"><Share2 size={16} /></button>
                            <a href={`/admin/courses/${c.id}`} className="text-gray-400 hover:text-rose-600 transition-colors" title="Edit"><Edit2 size={16} /></a>
                        </div>
                    </div>
                );
            },
            isDraggable: true,
        },
        divider: {
            render: ({ data }: any) => (
                <div className="flex items-center my-3">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-3 text-sm font-medium text-gray-400">{data.title}</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
            ),
            isDraggable: false,
        },
        footer: {
            render: ({ column }: any) => (
                <button className="w-full mt-3 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    + Add course to {column.title}
                </button>
            ),
            isDraggable: false,
        },
    };

    const onCardMove = (moveInfo: any) => {
        console.log("Card moved:", moveInfo);
        const { cardId, toColumnId } = moveInfo;
        const newStatusMatch = toColumnId?.match(/col-(.*)/);
        if (newStatusMatch) {
            const newStatusRaw = newStatusMatch[1];
            const newStatus = (newStatusRaw.charAt(0).toUpperCase() + newStatusRaw.slice(1)) as CourseStatus;
            setCourses(prev => prev.map(c => c.id === cardId ? { ...c, status: newStatus } : c));
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#2c2f30] p-8 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Courses</h1>
                    <p className="text-gray-500 mt-1">Manage, publish, and track your educational content.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 w-64 text-sm"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-200/50 p-1 rounded-full border border-gray-200">
                        <button
                            onClick={() => setView("kanban")}
                            className={`p-1.5 rounded-full transition-colors ${view === "kanban" ? "bg-white shadow-sm text-rose-600" : "text-gray-500 hover:text-gray-700"}`}
                            title="Kanban View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`p-1.5 rounded-full transition-colors ${view === "list" ? "bg-white shadow-sm text-rose-600" : "text-gray-500 hover:text-gray-700"}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#f43f5e] hover:bg-rose-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors"
                    >
                        <Plus size={18} />
                        <span>Create Course</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {view === "kanban" ? (
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-fit">
                        <Kanban
                            dataSource={kanbanDataSource}
                            configMap={configMap}
                            onCardMove={onCardMove}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
                                <th className="py-4 px-6 font-medium">Course Title</th>
                                <th className="py-4 px-6 font-medium">Status</th>
                                <th className="py-4 px-6 font-medium">Stats</th>
                                <th className="py-4 px-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((c) => (
                                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="font-semibold text-gray-900">{c.title}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {c.tags.map(tag => (
                                                <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                            c.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Eye size={14} /> {c.views}</span>
                                            <span className="flex items-center gap-1"><BookOpen size={14} /> {c.totalLessons}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {c.totalDuration}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-3">
                                            <button className="text-gray-400 hover:text-rose-600 transition-colors" title="Share"><Share2 size={18} /></button>
                                            <a href={`/admin/courses/${c.id}`} className="text-gray-400 hover:text-rose-600 transition-colors" title="Edit"><Edit2 size={18} /></a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCourses.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">No courses found matching "{searchQuery}"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Course Modal */}
            <CreateCourseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCourseCreated={onCourseCreated}
                baseEditPath="/admin/courses"
            />
        </div>
    );
}
