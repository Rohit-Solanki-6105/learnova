"use client";

import React, { useState, useEffect, use } from "react";
import { Plus, Users, Mail, Eye, Trash2, MoreVertical, ChevronDown, Video, FileText, CheckSquare, Image as ImageIcon, ArrowLeft, Edit2 } from "lucide-react";
import Link from "next/link";

export default function CourseFormPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [activeTab, setActiveTab] = useState("content");
    const [courseTitle, setCourseTitle] = useState("Basics of Odoo CRM");
    const [tags, setTags] = useState("Sales, CRM, Beginner");
    const [responsible, setResponsible] = useState("Jane Smith");
    const [published, setPublished] = useState(false);

    // For 3-dot dropdown tracking
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const contentList = [
        { id: 1, title: "Advanced Sales & CRM Automation in Odoo", category: "Video", icon: Video },
        { id: 2, title: "Odoo CRM: Advanced Features & Best Practices", category: "Document", icon: FileText },
        { id: 3, title: "Quiz 1: Automation", category: "Quiz", icon: CheckSquare },
    ];

    const tabs = [
        { id: "content", label: "Content" },
        { id: "description", label: "Description" },
        { id: "options", label: "Options" },
        { id: "quiz", label: "Quiz" },
    ];

    const handleDelete = (lessonId: number) => {
        if (window.confirm("Are you sure you want to delete this lesson?")) {
            console.log("Deleted lesson", lessonId);
            setActiveDropdown(null);
            // In a real app, send delete request and mutate list
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#2c2f30] font-sans pb-20 p-8">
            <div className="mb-6 flex items-center text-sm font-medium text-gray-500">
                <Link href="/admin/courses" className="flex items-center gap-2 hover:text-[#F43F5E] transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <span className="mx-3">/</span>
                <span className="text-gray-900">{id || "Loading..."}</span>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                {/* Header Actions */}
                <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 pb-8 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-full text-sm transition-colors flex items-center gap-2">
                            <Plus size={16} /> New
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-full text-sm transition-colors flex items-center gap-2">
                            <Mail size={16} /> Contact Attendees
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-full text-sm transition-colors flex items-center gap-2">
                            <Users size={16} /> Add Attendees
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-6 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700">Publish on website</span>
                                <div className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors ${published ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setPublished(!published)}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${published ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>
                        <button className="px-6 py-2.5 bg-[#F43F5E] hover:bg-[#BF517A] text-white font-semibold rounded-full text-sm shadow-sm transition-colors flex items-center gap-2">
                            <Eye size={16} /> Preview
                        </button>
                    </div>
                </div>

                {/* Core Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-10">
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Course Title</label>
                            <input
                                type="text"
                                value={courseTitle}
                                onChange={e => setCourseTitle(e.target.value)}
                                className="w-full text-4xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none bg-transparent focus:ring-0 p-0"
                                placeholder="e.g: Basics of Odoo CRM"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Tags</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F43F5E] focus:bg-white transition-colors"
                                    placeholder="Add tags separated by comma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Responsible</label>
                                <div className="relative">
                                    <select
                                        value={responsible}
                                        onChange={e => setResponsible(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#F43F5E] focus:bg-white transition-colors"
                                    >
                                        <option value="Jane Smith">Jane Smith (Admin)</option>
                                        <option value="John Doe">John Doe (Instructor)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Course Image</label>
                        <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:text-[#F43F5E] hover:border-rose-200 hover:bg-rose-50 cursor-pointer transition-all relative group">
                            <ImageIcon size={48} className="mb-4 opacity-50 group-hover:opacity-100" />
                            <span className="text-sm font-medium">Upload Image</span>
                        </div>
                    </div>
                </div>

                {/* Tabbed Navigation */}
                <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === tab.id
                                ? "border-[#F43F5E] text-[#F43F5E]"
                                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "content" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="border border-gray-100 rounded-2xl overflow-visible mb-6 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-sm text-gray-500">
                                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs w-2/3">Content Title</th>
                                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Category</th>
                                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contentList.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-rose-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm text-gray-400 border border-gray-100">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                    <item.icon size={16} className="text-[#F43F5E]" />
                                                    {item.category}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 relative text-right">
                                                <div
                                                    className="inline-flex justify-center p-2 cursor-pointer text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === item.id ? null : item.id);
                                                    }}
                                                >
                                                    <MoreVertical size={20} />
                                                </div>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === item.id && (
                                                    <div className="absolute right-12 top-10 bg-white border border-gray-100 shadow-xl rounded-xl z-20 w-36 py-1 animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                        <Link
                                                            href={`/admin/courses/${id}/lessons?edit=${item.id}`}
                                                            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-medium transition-colors"
                                                        >
                                                            <Edit2 size={16} className="text-[#8763CC]" /> Edit
                                                        </Link>
                                                        <div className="h-px bg-gray-100 mx-3 my-0.5"></div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(item.id);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-sm text-[#F43F5E] hover:bg-rose-50 flex items-center gap-3 font-medium transition-colors text-left"
                                                        >
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Content & Quiz Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href={`/admin/courses/${id}/lessons`}
                                className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 text-[#F43F5E] font-bold rounded-2xl transition-colors shadow-sm"
                            >
                                <Plus size={20} /> Add Lesson
                            </Link>
                            <Link
                                href={`/admin/courses/${id}/quizzes/new`}
                                className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 text-[#8763CC] font-bold rounded-2xl transition-colors shadow-sm"
                            >
                                <Plus size={20} /> Add Quiz
                            </Link>
                        </div>
                    </div>
                )}

                {activeTab === "description" && (
                    <div className="animate-in fade-in duration-300 py-12 text-center text-gray-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Description editor placeholder.</p>
                        <p className="text-sm mt-2">Implementation pending.</p>
                    </div>
                )}

                {activeTab === "options" && (
                    <div className="animate-in fade-in duration-300 py-12 text-center text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Access & Visibility options placeholder.</p>
                    </div>
                )}

                {activeTab === "quiz" && (
                    <div className="animate-in fade-in duration-300 py-12 text-center text-gray-400">
                        <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Quizzes attached to this course.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
