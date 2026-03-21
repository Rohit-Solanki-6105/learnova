export default function LessonPlayerPage({ params }: { params: { courseId: string, lessonId: string } }) {
    return (
        <div className="h-screen w-full flex">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-50 border-r p-4">
                <h2 className="font-bold">Course Title</h2>
                <p>Lesson List Navigation...</p>
            </div>

            {/* Main Player Area */}
            <div className="w-3/4 p-8">
                <h1 className="text-2xl font-bold mb-4">Lesson: {params.lessonId}</h1>
                <p>Video Player / Content Viewer area.</p>
            </div>
        </div>
    );
}
