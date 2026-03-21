
"use client";

import { fetchWithAuth } from "@/lib/auth";
import React, { use, useEffect, useState } from "react";
// import { User } from "@/types";

function page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [enrolled, setEnrolled] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEnrolled = async () => {
            try {
                const res = await fetchWithAuth(`/enrollments/`);
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                const data = await res.json();
                setEnrolled(data);
            } catch (err: any) {
                setError(err.message || "Failed to load enrolled users");
            } finally {
                setLoading(false);
            }
        };
        loadEnrolled();
    }, [resolvedParams.id]);
    return (
        <div>
            <h1>Enrolled Users</h1>
        </div>
    );
}


export default page;
