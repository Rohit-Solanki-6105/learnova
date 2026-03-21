import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, BookOpen, Clock, CheckCircle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Participants', value: '2,400', icon: Users, color: 'text-blue-500' },
    { name: 'Active Courses', value: '45', icon: BookOpen, color: 'text-indigo-500' },
    { name: 'In Progress', value: '1,200', icon: Clock, color: 'text-yellow-500' },
    { name: 'Completed', value: '800', icon: CheckCircle, color: 'text-green-500' },
  ]

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p className="text-gray-500">Overview of platform-wide activity and metrics.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="dark:bg-gray-800 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="dark:bg-gray-800 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Platform Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-gray-400">
            [Chart Placeholder - Growth Metrics]
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">U</div>
                    <div>
                      <p className="text-sm font-medium">User {i}</p>
                      <p className="text-xs text-gray-400">Enrolled in Course ABC</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
