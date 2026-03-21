"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Paperclip, Video, ImageIcon, FileText, CheckSquare, Settings2, Link as LinkIcon } from "lucide-react";
import Editor from "@/components/Editor";

export default function LessonEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    const resolvedParams = use(params);
    const id = resolvedParams.id;

    // State hooks
    const [activeTab, setActiveTab] = useState("description");
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonType, setLessonType] = useState("document");

    // EditorJS state
    const [descriptionData, setDescriptionData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Form states specific to lesson types
    const [videoUrl, setVideoUrl] = useState("");
    const [allowDownload, setAllowDownload] = useState(false);

    useEffect(() => {
        // Mock loading existing lesson data if editing
        if (editId) {
            setLessonTitle(`Editable Lesson Example ${editId}`);
            setLessonType(editId === "1" ? "video" : editId === "2" ? "document" : "quiz");
        }
    }, [editId]);

    const tabs = [
        // { id: "content", label: "Content Component" },
        { id: "description", label: "Content Component" },
        { id: "attachments", label: "Additional Attachments" },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#2c2f30] font-sans pb-20 p-8">
            {/* Nav & Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Link
                        href={`/admin/courses/${id || 'demo'}`}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#F43F5E] transition-colors mb-2"
                    >
                        <ArrowLeft size={16} /> Back to Course Configuration
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {editId ? `Editing Lesson: ${lessonTitle}` : "Create New Lesson"}
                    </h1>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-full text-sm transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button className="px-6 py-2.5 bg-[#F43F5E] hover:bg-[#BF517A] text-white font-semibold rounded-full text-sm shadow-sm transition-colors flex items-center gap-2">
                        <Save size={16} /> Save Lesson
                    </button>
                </div>
            </div>

            {/* Main Editor Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">

                {/* Left Sidebar Layout */}
                <div className="w-full md:w-64 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Lesson Configuration</h3>

                        <div className="space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex justify-between items-center ${activeTab === tab.id
                                        ? "bg-rose-50 text-[#F43F5E] shadow-sm ring-1 ring-[#F43F5E]/20"
                                        : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm ring-1 ring-transparent hover:ring-gray-100"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Interactive Area */}
                <div className="flex-1 p-4 md:p-8">

                    {activeTab === "description" && (
                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto space-y-6 flex flex-col">

                            {/* Basics Section */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Title</label>
                                    <input
                                        type="text"
                                        value={lessonTitle}
                                        onChange={e => setLessonTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F43F5E] focus:bg-white transition-colors text-lg font-semibold"
                                        placeholder="e.g. Intro to Variables"
                                    />
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { id: "video", label: "Video", icon: Video },
                                            { id: "document", label: "Document", icon: FileText },
                                            { id: "image", label: "Image", icon: ImageIcon },
                                            { id: "quiz", label: "Quiz", icon: CheckSquare },
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setLessonType(type.id)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${lessonType === type.id
                                                    ? "border-[#8763CC] bg-purple-50 text-[#8763CC]"
                                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <type.icon size={24} className="mb-2" />
                                                <span className="text-sm font-semibold">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div> */}
                            </div>

                            <hr className="border-gray-100 border-t-2 border-dashed" />

                            {/* Dynamic Content Config based on lessonType */}
                            <div className="bg-white rounded-2xl">

                                {lessonType === "video" && (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Settings2 size={18} className="text-[#BF517A]" /> Video Setup</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">External Video URL (YouTube / Drive Link)</label>
                                            <input
                                                type="url"
                                                value={videoUrl}
                                                onChange={e => setVideoUrl(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8763CC] focus:bg-white transition-colors"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {(lessonType === "document" || lessonType === "image") && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                                        {/* <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Settings2 size={18} className="text-[#8763CC]" />
                                            {lessonType === "document" ? "Document" : "Image"} Upload
                                        </h3> */}

                                        {/* <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-purple-50 hover:border-[#8763CC] hover:text-[#8763CC] transition-colors cursor-pointer group">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                {lessonType === "document" ? <FileText size={32} /> : <ImageIcon size={32} />}
                                            </div>
                                            <h4 className="font-bold text-gray-700 group-hover:text-[#8763CC]">Click to upload {lessonType}</h4>
                                            <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
                                        </div> */}

                                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors ${allowDownload ? 'bg-[#8763CC]' : 'bg-gray-300'}`} onClick={() => setAllowDownload(!allowDownload)}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${allowDownload ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-800 block">Allow Learner Downloads</span>
                                                <span className="text-xs text-gray-500">Toggling this will let learners download this {lessonType} directly to their device.</span>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {lessonType === "quiz" && (
                                    <div className="text-center py-10 bg-gray-50 border border-gray-200 border-dashed rounded-2xl animate-in slide-in-from-bottom-2">
                                        <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
                                        <h3 className="font-bold text-gray-900">Quiz Selected</h3>
                                        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto mb-6">Create the actual quiz questions via the Quiz Builder tab on your course dashboard.</p>
                                        <button className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-sm font-semibold text-gray-700 shadow-sm transition-colors">Go to Quiz Builder</button>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100 border-t-2 border-dashed" />

                            <div className="mb-2 mt-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Editor Context</h2>
                                <p className="text-sm text-gray-500">
                                    Utilize the rich text editor below for formatting complex lesson descriptions showing to the learners.
                                </p>
                            </div>
                            {/* Rendering the Editor.js wrapper */}
                            <div className="w-full mt-2">
                                <Editor
                                    is_editting={true}
                                    file={descriptionData}
                                    setFile={setDescriptionData}
                                />
                            </div>
                        </div>
                    )}


                    {activeTab === "attachments" && (
                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Attachments</h2>
                                <p className="text-sm text-gray-500">
                                    Attach supplementary files or external links that compliment this lesson.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                        <Paperclip size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">Local Resource File</h3>
                                    <p className="text-sm text-gray-500 mb-4 h-10">Upload a PDF, Zip, or internal document.</p>
                                    <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
                                        Browse Computer
                                    </button>
                                </div>
                                <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                        <LinkIcon size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">External Web Link</h3>
                                    <p className="text-sm text-gray-500 mb-4 h-10">Paste a link to Google Drive, GitHub, etc.</p>
                                    <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
                                        Add URL
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
