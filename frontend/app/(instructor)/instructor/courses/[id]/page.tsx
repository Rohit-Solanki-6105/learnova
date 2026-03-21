"use client";

import React, { useState, useEffect } from "react";
import CourseEditorWrapper from "@/components/CourseEditorWrapper";

export default function InstructorCourseEditorPage({ params }: { params: { id: string } }) {
    const [id, setId] = useState<string>("");

    useEffect(() => {
        if (params && params.id) setId(params.id);
    }, [params]);

    if (!id) return null; // or a loading state

    return <CourseEditorWrapper courseId={id} role="instructor" />;
}
