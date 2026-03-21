"use client";

import { LessonVideoPlayer } from "@/components/LessonVideoPlayer";

export default function LessonPlayerPage({ params }: { params: { courseId: string, lessonId: string } }) {
    return (
        <div className="h-screen w-full flex">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-50 border-r p-4">
                <h2 className="font-bold">Course Title</h2>
                <p>Lesson List Navigation...</p>
            </div>

            {/* Main Player Area with Video.js (fullscreen supported) */}
            <div className="w-3/4 p-8 flex flex-col">
                <h1 className="text-2xl font-bold mb-4">Lesson: {params.lessonId}</h1>
                <div className="flex-1 min-h-0">
                    <LessonVideoPlayer
                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                        poster="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2000&auto=format&fit=crop"
                    />
                </div>
            </div>
        </div>
    );
}
