import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Mail, UserPlus } from "lucide-react"

export default function AttendeesPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendees</h1>
          <p className="text-gray-500">Manage students and invitations for your courses.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <UserPlus size={18} />
          Invite Learner
        </button>
      </div>

      <Card className="dark:bg-gray-800 border-none shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-sm font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { name: "John Doe", email: "john@example.com", status: "Active", date: "2026-03-20" },
                { name: "Jane Smith", email: "jane@example.com", status: "Invited", date: "-" },
              ].map((attendee) => (
                <tr key={attendee.email}>
                  <td className="px-6 py-4 text-sm">{attendee.name}</td>
                  <td className="px-6 py-4 text-sm">{attendee.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      attendee.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {attendee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{attendee.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
