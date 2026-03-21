import React from 'react'

export default function InstructorDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back, Instructor!</p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Students', value: '1,234', change: '+12%', icon: 'Users' },
          { name: 'Active Courses', value: '12', change: '0', icon: 'BookOpen' },
          { name: 'Average Rating', value: '4.8', change: '+0.2', icon: 'Star' },
          { name: 'Completion Rate', value: '85%', change: '+5%', icon: 'CheckCircle' },
        ].map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-800">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{item.value}</dd>
          </div>
        ))}
      </div>
    </div>
  )
}
