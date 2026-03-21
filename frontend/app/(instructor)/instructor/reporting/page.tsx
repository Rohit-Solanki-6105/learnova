import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function InstructorReportingPage() {
  const coursePerformance = [
    { title: "React Fundamentals", completion: 65, activeUsers: 40 },
    { title: "Next.js for Beginners", completion: 45, activeUsers: 28 },
    { title: "Tailwind CSS Mastery", completion: 82, activeUsers: 55 },
  ]

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reporting & Analytics</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="dark:bg-gray-800 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {coursePerformance.map((course) => (
              <div key={course.title} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{course.title}</span>
                  <span className="text-gray-500">{course.completion}% Complete</span>
                </div>
                <Progress value={course.completion} className="h-2" />
                <div className="text-xs text-gray-400">{course.activeUsers} active learners</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
