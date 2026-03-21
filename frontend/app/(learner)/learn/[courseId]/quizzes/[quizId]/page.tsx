export default function QuizPlayerPage({ params }: { params: { courseId: string, quizId: string } }) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-sm max-w-2xl w-full">
                <h1 className="text-2xl font-bold mb-4">Quiz: {params.quizId}</h1>
                <p>Interactive quiz component matching the Stitch design system will be here.</p>
            </div>
        </div>
    );
}
