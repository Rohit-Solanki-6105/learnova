export default function QuizBuilderPage({ params }: { params: { id: string, quizId: string } }) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Quiz Builder: {params.quizId}</h1>
            <p>Create quiz questions, define multiple choices, and set reward points here.</p>
        </div>
    );
}
