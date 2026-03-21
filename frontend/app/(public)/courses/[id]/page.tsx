export default function CourseDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Course Detail: {params.id}</h1>
            <p>View course overview, ratings, reviews, and lesson breakdown here.</p>
        </div>
    );
}
