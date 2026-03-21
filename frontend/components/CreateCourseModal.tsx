import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated: (course: any) => void;
    baseEditPath: string; // e.g. "/admin/courses" or "/instructor/courses"
}

export default function CreateCourseModal({ isOpen, onClose, onCourseCreated, baseEditPath }: CreateCourseModalProps) {
    const router = useRouter();
    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseDescription, setNewCourseDescription] = useState("Enter your excellent course description here.");
    const [isCreating, setIsCreating] = useState(false);

    if (!isOpen) return null;

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseName.trim()) return;
        
        setIsCreating(true);
        try {
            const token = localStorage.getItem("access_token");
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch("http://localhost:8000/api/courses/", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    title: newCourseName,
                    description: newCourseDescription,
                    status: 1, // 1 = Draft
                    visibility: 1 // 1 = Everyone
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("Failed to create course:", errData);
                toast.error("Failed to create course on the server.");
                setIsCreating(false);
                return;
            }

            const data = await res.json();
            
            // Format to match the frontend expected structure
            const newCourse = {
                id: data.id.toString(),
                title: data.title,
                tags: [],
                views: 0,
                totalLessons: 0,
                totalDuration: "0h",
                status: "Draft",
            };

            onCourseCreated(newCourse);
            setNewCourseName("");
            
            toast.success("Course created successfully!", {
                action: {
                    label: "Edit Course",
                    onClick: () => router.push(`${baseEditPath}/${newCourse.id}`),
                },
            });
            onClose();
        } catch (error) {
            console.error("Error creating course:", error);
            toast.error("An error occurred while communicating with the server.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
                <button
                    onClick={() => !isCreating && onClose()}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Course</h2>
                <p className="text-sm text-gray-500 mb-6">Enter a title to initialize your new course draft.</p>

                <form onSubmit={handleCreateCourse}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                            <input
                                id="courseName"
                                type="text"
                                required
                                autoFocus
                                value={newCourseName}
                                onChange={(e) => setNewCourseName(e.target.value)}
                                placeholder="e.g. Introduction to Masterpieces"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="courseDesc" className="block text-sm font-medium text-gray-700 mb-1">Brief Description (Required)</label>
                            <textarea
                                id="courseDesc"
                                required
                                rows={3}
                                value={newCourseDescription}
                                onChange={(e) => setNewCourseDescription(e.target.value)}
                                placeholder="Enter a brief description to initialize the course draft..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => !isCreating && onClose()}
                            disabled={isCreating}
                            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create & Continue"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
