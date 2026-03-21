"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Mail, Eye, Trash2, MoreVertical, Search, CheckCircle2, ChevronDown, Video as VideoIcon, FileText, CheckSquare, Presentation, Image as ImageIcon, ArrowLeft, Edit2, X, Save } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LearnovaQuiz from "@/components/Quiz";
import TextEditor from "@/components/TextEditor";

// Editor.tsx needs to be dynamically imported because it uses EditorJS which accesses `window`
const LessonEditor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface ContentItem {
    id: number;
    title: string;
    category: "Video" | "Document" | "Quiz" | "Interactive";
    description?: string;
    contentData?: any; // For EditorJS data
}

interface CourseEditorProps {
    courseId: string;
    role: "admin" | "instructor";
}

export default function CourseEditorWrapper({ courseId, role }: CourseEditorProps) {
    const [activeTab, setActiveTab] = useState("content");
    const [courseTitle, setCourseTitle] = useState("Basics of Odoo CRM");
    const [tags, setTags] = useState("Sales, CRM, Beginner");
    const [responsible, setResponsible] = useState("Jane Smith");
    const [published, setPublished] = useState(false);
    
    // Course Description state
    const [courseDescription, setCourseDescription] = useState("<p>Welcome to this comprehensive course.</p>");

    // Content/Lessons state
    const [contentList, setContentList] = useState<ContentItem[]>([
        { id: 1, title: "Advanced Sales & CRM Automation in Odoo", category: "Video", description: "" },
        { id: 2, title: "Odoo CRM: Advanced Features & Best Practices", category: "Document", description: "" },
    ]);
    
    // Editing a specific lesson
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

    // Quiz Tab state
    const [quizData, setQuizData] = useState<any>({
        quizTitle: "Course Final Assessment",
        quizSynopsis: "Test your knowledge on the CRM basics covered so far.",
        questions: []
    });

    const getIconForCategory = (category: string) => {
        switch (category) {
            case "Video": return VideoIcon;
            case "Document": return FileText;
            case "Quiz": return CheckSquare;
            default: return Presentation;
        }
    };

    const handleLessonSave = (id: number, updatedTitle: string, updatedDesc: string, updatedData: any) => {
        setContentList(prev => prev.map(item => 
            item.id === id ? { ...item, title: updatedTitle, description: updatedDesc, contentData: updatedData } : item
        ));
        setEditingLessonId(null);
    };

    const backLink = role === "admin" ? "/admin/courses" : "/instructor/courses";

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#2c2f30] font-sans pb-20 p-8">
            {/* Top Navigation / Breadcrumbs */}
            <div className="mb-6 flex items-center text-sm font-medium text-gray-500">
                <Link href={backLink} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <span className="mx-3">/</span>
                <span className="text-gray-900">{courseId || "Loading..."}</span>
            </div>

            {/* Main White Card Wrapper */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                {/* 1. Header Actions */}
                <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 pb-8 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2">
                            <Plus size={16} /> New Cohort
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2">
                            <Mail size={16} /> Contact Attendees
                        </button>
                        {role === "admin" && (
                            <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2">
                                <Users size={16} /> Manage Access
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        {/* Publish Toggles */}
                        <div className="flex items-center gap-6 bg-gray-50 px-5 py-2.5 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700">Publish on website</span>
                                <div className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors ${published ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setPublished(!published)}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${published ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>
                        {/* Preview */}
                        <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors flex items-center gap-2">
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
                                className="w-full text-4xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none bg-transparent focus:ring-0 p-0 outline-none"
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
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                    placeholder="Add tags separated by comma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Instructor / Responsible</label>
                                <div className="relative">
                                    <select
                                        value={responsible}
                                        onChange={e => setResponsible(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
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
                        <label className="block text-sm font-bold text-gray-500 mb-2 tracking-wide uppercase">Course Cover</label>
                        <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-all relative group">
                            <ImageIcon size={48} className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-medium">Upload Image</span>
                        </div>
                    </div>
                </div>

                {/* 3. Tabbed Navigation */}
                <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto hide-scrollbar">
                    {["content", "description", "quiz", "settings"].map(tabId => (
                        <button
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors duration-200 capitalize ${activeTab === tabId
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                                }`}
                        >
                            {tabId}
                        </button>
                    ))}
                </div>

                {/* 4. Tab Content */}
                {activeTab === "content" && (
                    <div className="animate-in fade-in duration-300">
                        {editingLessonId ? (
                            <LessonEditorForm 
                                item={contentList.find(c => c.id === editingLessonId)!} 
                                onSave={handleLessonSave}
                                onCancel={() => setEditingLessonId(null)}
                            />
                        ) : (
                            <>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6 bg-white shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100 text-sm text-gray-500">
                                                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs w-3/5">Lesson Title</th>
                                                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Type</th>
                                                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contentList.map((item, idx) => {
                                                const Icon = getIconForCategory(item.category);
                                                return (
                                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm text-gray-400 border border-gray-100 text-xs font-bold">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="font-semibold text-gray-900">{item.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                                <Icon size={16} className="text-indigo-500" />
                                                                {item.category}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex justify-end gap-2 pr-2">
                                                                <button 
                                                                    onClick={() => setEditingLessonId(item.id)}
                                                                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100"
                                                                    title="Edit Lesson"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button 
                                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                                                                    title="Delete Lesson"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <button 
                                    onClick={() => {
                                        const newId = Date.now();
                                        setContentList([...contentList, { id: newId, title: "New Lesson", category: "Document", description: "" }]);
                                        setEditingLessonId(newId);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 font-bold rounded-2xl transition-all"
                                >
                                    <Plus size={20} /> Add New Lesson
                                </button>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "description" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Course Overview Description</h3>
                            <p className="text-gray-500 text-sm mb-4">Provide a detailed description of the course, what students will learn, and prerequisites. This will be shown on the course landing page.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm">
                            <TextEditor 
                                text={courseDescription} 
                                setText={setCourseDescription} 
                                placeholder="Write a compelling course description here..." 
                            />
                        </div>
                    </div>
                )}

                {activeTab === "quiz" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Course Assessment Management</h3>
                            <p className="text-gray-500 text-sm mb-4">Create interactive quizzes and assessments for your students to test their knowledge upon completion.</p>
                        </div>
                        <LearnovaQuiz 
                            status="editing" 
                            data={quizData} 
                            setData={setQuizData} 
                        />
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="animate-in fade-in duration-300 py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Advanced Course Settings</h3>
                        <p className="text-sm">Pricing, enrollment limits, and visibility options will appear here.</p>
                    </div>
                )}

            </div>
        </div>
    );
}

// Subcomponent for editing an individual lesson inline
function LessonEditorForm({ item, onSave, onCancel }: { item: ContentItem, onSave: (id: number, title: string, desc: string, data: any) => void, onCancel: () => void }) {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description || "");
    const [contentData, setContentData] = useState<any>(item.contentData || { time: new Date().getTime(), blocks: [] });

    return (
        <div className="bg-gray-50/50 rounded-2xl border border-gray-200 p-6 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-300 shadow-sm relative overflow-hidden">
            {/* Action Bar */}
            <div className="sticky top-0 left-0 w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <span className="font-bold text-gray-900">Editing Lesson</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onSave(item.id, title, description, contentData)} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="pt-4 space-y-8">
                {/* Basic Meta */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            className="w-full text-xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-indigo-500 bg-transparent p-2 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="flex text-sm font-bold text-gray-700 mb-2 justify-between">
                            <span>Lesson Description (Optional)</span>
                            <span className="text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Rich Text</span>
                        </label>
                        <TextEditor text={description} setText={setDescription} placeholder="Briefly describe what this lesson covers..." />
                    </div>
                </div>

                {/* EditorJS Dynamic Content */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-bold text-gray-900">Interactive Content Builder</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">EditorJS</span>
                    </div>
                    <div className="ring-1 ring-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <LessonEditor is_editting={true} file={contentData} setFile={setContentData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
