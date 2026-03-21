"use client";

import React, { use } from "react";
import CourseEditorWrapper from "@/components/CourseEditorWrapper";

export default function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <CourseEditorWrapper courseId={resolvedParams.id} role="admin" />;
}
