"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import CreateCourseModal from "@/components/CreateCourseModal";
import Link from 'next/link';

export default function InstructorCoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myCourses, setMyCourses] = useState([
    {
      id: "1",
      title: "React Fundamentals",
      students: 45,
      status: "Published",
      lessons: 12,
    },
    {
      id: "2",
      title: "Next.js for Beginners",
      students: 32,
      status: "Draft",
      lessons: 8,
    }
  ]);

  const onCourseCreated = (newCourse: any) => {
    setMyCourses((prev) => [
        ...prev, 
        {
            id: newCourse.id,
            title: newCourse.title,
            students: 0,
            status: newCourse.status,
            lessons: 0
        }
    ]);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500">Manage your course content and lessons.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.map((course) => (
          <Card key={course.id} className="dark:bg-gray-800 border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge variant={course.status === "Published" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>
              <CardDescription>{course.lessons} Lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Students</span>
                <span className="font-semibold">{course.students}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/instructor/courses/${course.id}`} className="flex-1 text-center px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    Edit
                </Link>
                <button className="flex-1 px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    Analytics
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateCourseModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onCourseCreated={onCourseCreated}
          baseEditPath="/instructor/courses"
      />
    </div>
  )
}
