"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Mail, Eye, Trash2, MoreVertical, Search, CheckCircle2, ChevronDown, Video, FileText, CheckSquare, Presentation, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CourseFormPage({ params }: { params: { id: string } }) {
    // Unwrapping params as needed for Next.js app router 
    const [id, setId] = useState<string>("");

    // Wireframe state
    const [activeTab, setActiveTab] = useState("content");
    const [courseTitle, setCourseTitle] = useState("Basics of Odoo CRM");
    const [tags, setTags] = useState("Sales, CRM, Beginner");
    const [responsible, setResponsible] = useState("Jane Smith");
    const [published, setPublished] = useState(false);
    const [shared, setShared] = useState(true);

    // UseEffect to unwrap params
    useEffect(() => {
        // Simple unwrap for params (in next.js 14/15 params are promises sometimes, but usually directly available in client components if passed correctly)
        if (params && params.id) setId(params.id);
    }, [params]);

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

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#2c2f30] font-sans pb-20 p-8">
            {/* Top Navigation / Breadcrumbs */}
            <div className="mb-6 flex items-center text-sm font-medium text-gray-500">
                <Link href="/admin/courses" className="flex items-center gap-2 hover:text-rose-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <span className="mx-3">/</span>
                <span className="text-gray-900">{id || "Loading..."}</span>
            </div>

            {/* Main White Card Wrapper */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                {/* 1. Header Actions */}
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
                        {/* Publish Toggles */}
                        <div className="flex items-center gap-6 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700">Publish on website</span>
                                <div className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors ${published ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setPublished(!published)}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${published ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                            {/* <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700">Share on web</span>
                                <div className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors ${shared ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setShared(!shared)}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${shared ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label> */}
                        </div>
                        {/* Preview */}
                        <button className="px-6 py-2.5 bg-[#f43f5e] hover:bg-rose-600 text-white font-semibold rounded-full text-sm shadow-sm transition-colors flex items-center gap-2">
                            <Eye size={16} /> Preview
                        </button>
                    </div>
                </div>

                {/* 2. Core Fields */}
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
                                    placeholder="Add tags separated by comma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Responsible</label>
                                <div className="relative">
                                    <select
                                        value={responsible}
                                        onChange={e => setResponsible(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
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
                        <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 cursor-pointer transition-all relative group">
                            <ImageIcon size={48} className="mb-4 opacity-50 group-hover:opacity-100" />
                            <span className="text-sm font-medium">Upload Image</span>
                            <button className="absolute top-4 right-4 bg-white p-2 text-gray-400 hover:text-rose-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Tabbed Navigation */}
                <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === tab.id
                                ? "border-rose-500 text-rose-600"
                                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 4. Tab Content */}
                {activeTab === "content" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6 bg-white shadow-sm">
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
                                                    <item.icon size={16} className="text-rose-500" />
                                                    {item.category}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-end pr-2 cursor-pointer text-gray-400 hover:text-gray-900 transition-colors">
                                                    <MoreVertical size={20} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-bold rounded-2xl transition-colors">
                            <Plus size={20} /> Add Content
                        </button>
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
