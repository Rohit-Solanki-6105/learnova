"use client";

import React, { useState } from "react";
import { Users, Clock, PlayCircle, CheckCircle, Search, Filter, Columns, X } from "lucide-react";

export const COLUMN_DEFS = [
    { id: "srNo", label: "Sr no." },
    { id: "course", label: "Course Name" },
    { id: "studentName", label: "Participant" },
    { id: "enrolledDate", label: "Enrolled Date" },
    { id: "startDate", label: "Start Date" },
    { id: "timeSpent", label: "Time Spent" },
    { id: "progress", label: "Completion %" },
    { id: "completedDate", label: "Completed Date" },
    { id: "status", label: "Status" },
] as const;

type Status = "Yet to Start" | "In Progress" | "Completed";

interface ReportData {
    id: string;
    studentName: string;
    course: string;
    enrolledDate: string;
    startDate: string;
    timeSpent: string;
    progress: number;
    completedDate: string;
    status: Status;
}

const MOCK_DATA: ReportData[] = [
    { id: "1", studentName: "Michael Doe", course: "Basics of Odoo CRM", enrolledDate: "Oct 12, 2023", startDate: "Oct 14, 2023", timeSpent: "14h 20m", progress: 45, completedDate: "-", status: "In Progress" },
    { id: "2", studentName: "Sarah Connor", course: "Advanced Automation", enrolledDate: "Sep 01, 2023", startDate: "Sep 05, 2023", timeSpent: "32h 10m", progress: 100, completedDate: "Sep 29, 2023", status: "Completed" },
    { id: "3", studentName: "James Smith", course: "Basics of Odoo CRM", enrolledDate: "Nov 02, 2023", startDate: "-", timeSpent: "0h 0m", progress: 0, completedDate: "-", status: "Yet to Start" },
    { id: "4", studentName: "Emma Lee", course: "Advanced Automation", enrolledDate: "Oct 15, 2023", startDate: "Oct 16, 2023", timeSpent: "28h 45m", progress: 80, completedDate: "-", status: "In Progress" },
    { id: "5", studentName: "David Chen", course: "Odoo Inventory", enrolledDate: "Aug 20, 2023", startDate: "Aug 22, 2023", timeSpent: "18h 30m", progress: 100, completedDate: "Sep 10, 2023", status: "Completed" },
    { id: "6", studentName: "Sophia Martinez", course: "Basics of Odoo CRM", enrolledDate: "Nov 10, 2023", startDate: "Nov 12, 2023", timeSpent: "2h 15m", progress: 15, completedDate: "-", status: "In Progress" },
    { id: "7", studentName: "William Taylor", course: "Odoo Inventory", enrolledDate: "Nov 11, 2023", startDate: "-", timeSpent: "0h 0m", progress: 0, completedDate: "-", status: "Yet to Start" },
];

export default function ReportingDashboardPage() {
    const [filter, setFilter] = useState<Status | "All">("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isColumnPanelOpen, setIsColumnPanelOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(COLUMN_DEFS.map(c => c.id));

    const toggleColumn = (id: string) => {
        setVisibleColumns(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const totalParticipants = MOCK_DATA.length;
    const yetToStart = MOCK_DATA.filter(d => d.status === "Yet to Start").length;
    const inProgress = MOCK_DATA.filter(d => d.status === "In Progress").length;
    const completed = MOCK_DATA.filter(d => d.status === "Completed").length;

    const filteredData = MOCK_DATA.filter(d => {
        const matchesFilter = filter === "All" || d.status === filter;
        const matchesSearch = d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.course.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const statCards = [
        { title: "Total Participants", count: totalParticipants, icon: Users, color: "bg-blue-50 text-blue-600 border-blue-100", filterVal: "All" },
        { title: "Yet to Start", count: yetToStart, icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-100", filterVal: "Yet to Start" },
        { title: "In Progress", count: inProgress, icon: PlayCircle, color: "bg-purple-50 text-purple-600 border-purple-100", filterVal: "In Progress" },
        { title: "Completed", count: completed, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 border-emerald-100", filterVal: "Completed" },
    ] as const;

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-8 font-sans pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reporting Dashboard</h1>
                <p className="text-sm text-gray-500 mt-2">Track course-wise learner progress and completion rates.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card) => {
                    const isActive = filter === card.filterVal;
                    return (
                        <div
                            key={card.title}
                            onClick={() => setFilter(card.filterVal)}
                            className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer hover:shadow-md ${isActive ? 'border-[#F43F5E] shadow-sm transform scale-[1.02]' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                                    <card.icon size={24} />
                                </div>
                                {isActive && (
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#F43F5E] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F43F5E]"></span>
                                    </span>
                                )}
                            </div>
                            <h3 className="text-gray-500 font-semibold text-sm mb-1">{card.title}</h3>
                            <p className="text-3xl font-black text-gray-900">{card.count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:px-8 md:py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        {filter === "All" ? "All Participants" : `${filter} Learners`}
                    </h2>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search student or course..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F43F5E] transition-all w-full md:w-64"
                            />
                        </div>
                        <button
                            onClick={() => setIsColumnPanelOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Columns size={16} /> Columns
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {visibleColumns.includes('srNo') && <th className="px-8 py-4 whitespace-nowrap">Sr no.</th>}
                                {visibleColumns.includes('course') && <th className="px-8 py-4 min-w-[200px]">Course Name</th>}
                                {visibleColumns.includes('studentName') && <th className="px-8 py-4 min-w-[180px]">Participant</th>}
                                {visibleColumns.includes('enrolledDate') && <th className="px-8 py-4 whitespace-nowrap">Enrolled Date</th>}
                                {visibleColumns.includes('startDate') && <th className="px-8 py-4 whitespace-nowrap">Start Date</th>}
                                {visibleColumns.includes('timeSpent') && <th className="px-8 py-4 whitespace-nowrap">Time Spent</th>}
                                {visibleColumns.includes('progress') && <th className="px-8 py-4 min-w-[180px]">Completion %</th>}
                                {visibleColumns.includes('completedDate') && <th className="px-8 py-4 whitespace-nowrap">Completed Date</th>}
                                {visibleColumns.includes('status') && <th className="px-8 py-4 whitespace-nowrap">Status</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.length > 0 ? filteredData.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-rose-50/30 transition-colors text-sm">
                                    {visibleColumns.includes('srNo') && <td className="px-8 py-4 text-gray-500 font-medium whitespace-nowrap">#{idx + 1}</td>}
                                    {visibleColumns.includes('course') && <td className="px-8 py-4 font-bold text-gray-900">{row.course}</td>}
                                    {visibleColumns.includes('studentName') && <td className="px-8 py-4 font-semibold text-gray-700">{row.studentName}</td>}
                                    {visibleColumns.includes('enrolledDate') && <td className="px-8 py-4 text-gray-500 whitespace-nowrap">{row.enrolledDate}</td>}
                                    {visibleColumns.includes('startDate') && <td className="px-8 py-4 text-gray-500 whitespace-nowrap">{row.startDate}</td>}
                                    {visibleColumns.includes('timeSpent') && <td className="px-8 py-4 font-semibold text-gray-700 whitespace-nowrap">{row.timeSpent}</td>}
                                    {visibleColumns.includes('progress') && <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${row.progress === 100 ? 'bg-emerald-500' : 'bg-[#F43F5E]'}`}
                                                    style={{ width: `${row.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 w-8">{row.progress}%</span>
                                        </div>
                                    </td>}
                                    {visibleColumns.includes('completedDate') && <td className="px-8 py-4 text-gray-500 whitespace-nowrap">{row.completedDate}</td>}
                                    {visibleColumns.includes('status') && <td className="px-8 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${row.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                            row.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={visibleColumns.length === 0 ? 1 : visibleColumns.length} className="px-8 py-16 text-center text-gray-400">
                                        <Users size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-lg font-semibold text-gray-600">No participants found.</p>
                                        <p className="text-sm">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Column Customization Side Panel Overlay */}
            {isColumnPanelOpen && (
                <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsColumnPanelOpen(false)}></div>
            )}

            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out ${isColumnPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Customize Columns</h2>
                            <p className="text-sm text-gray-500 mt-1">Select the metrics you want to see.</p>
                        </div>
                        <button onClick={() => setIsColumnPanelOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-4">
                            {COLUMN_DEFS.map((col) => {
                                const isChecked = visibleColumns.includes(col.id);
                                return (
                                    <label key={col.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleColumn(col.id)}
                                                className="w-5 h-5 appearance-none rounded border-2 border-gray-300 checked:bg-[#F43F5E] checked:border-[#F43F5E] transition-all cursor-pointer"
                                            />
                                            {isChecked && <CheckCircle size={14} className="absolute text-white pointer-events-none stroke-[3]" />}
                                        </div>
                                        <span className={`font-semibold text-sm select-none ${isChecked ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                            {col.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setVisibleColumns(COLUMN_DEFS.map(c => c.id))}
                                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Reset to Default
                            </button>
                            <button
                                onClick={() => setIsColumnPanelOpen(false)}
                                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-all active:scale-95"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
