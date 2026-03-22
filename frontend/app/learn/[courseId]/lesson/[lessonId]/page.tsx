"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyLessonRoutePage({
    params,
}: {
    params: Promise<{ courseId: string; lessonId: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();

    useEffect(() => {
        router.replace(`/learn/${resolvedParams.courseId}/${resolvedParams.lessonId}`);
    }, [router, resolvedParams.courseId, resolvedParams.lessonId]);

    return null;
}
