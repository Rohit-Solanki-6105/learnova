"use client";

import React, { useState } from "react";
import { BookOpen, Users, Trophy, PlayCircle, TrendingUp, DollarSign, Clock, Star, ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
import Link from "next/link";

// Mock Data aligned with Django Backend Models
const DASHBOARD_METRICS = {
    totalCourses: 124,
    totalEnrollments: 3450,
    activeLearners: 892,
    totalRevenue: 28450,
    revenueGrowth: 12.5,
    enrollmentGrowth: -2.4,
};

const HIGHEST_PREFERENCE_COURSE = {
    id: "c1",
    title: "Mastering UI/UX Systems",
    instructor: "Emily Wallace",
    enrollments: 1240,
    completionRate: 78,
    rating: 4.8,
    totalLessons: 48,
    duration: "12h 45m",
    price: 49.99,
    status: "Published",
    tags: ["Design", "Pro"],
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
};

const RECENT_COURSES = [
    { id: "c1", title: "Mastering UI/UX Systems", enrollments: 1240, views: 3200, revenue: 12400, status: "Published" },
    { id: "c2", title: "Advanced React Patterns", enrollments: 850, views: 2400, revenue: 8500, status: "Published" },
    { id: "c5", title: "Python for Data Science", enrollments: 520, views: 1800, revenue: 6200, status: "Published" },
    { id: "c3", title: "Introduction to Figma", enrollments: 0, views: 120, revenue: 0, status: "Draft" },
    { id: "c4", title: "Legacy Angular Course", enrollments: 450, views: 4500, revenue: 1350, status: "Archived" },
];

const ENROLLMENT_TRENDS = [
    { day: "Mon", count: 45 },
    { day: "Tue", count: 52 },
    { day: "Wed", count: 38 },
    { day: "Thu", count: 65 },
    { day: "Fri", count: 48 },
    { day: "Sat", count: 85 },
    { day: "Sun", count: 92 },
];


export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#2c2f30] p-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your courses today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/courses" className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm">
                        <BookOpen size={18} />
                        <span>Manage Courses</span>
                    </Link>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Courses"
                    value={DASHBOARD_METRICS.totalCourses}
                    icon={<PlayCircle className="text-blue-500" size={24} />}
                    trend={+5.2}
                    bg="bg-blue-50"
                />
                <MetricCard
                    title="Total Enrollments"
                    value={DASHBOARD_METRICS.totalEnrollments}
                    icon={<Users className="text-indigo-500" size={24} />}
                    trend={DASHBOARD_METRICS.enrollmentGrowth}
                    bg="bg-indigo-50"
                />
                <MetricCard
                    title="Active Learners"
                    value={DASHBOARD_METRICS.activeLearners}
                    icon={<TrendingUp className="text-rose-500" size={24} />}
                    trend={+12.4}
                    bg="bg-rose-50"
                />
                <MetricCard
                    title="Total Revenue"
                    value={`$${DASHBOARD_METRICS.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="text-emerald-500" size={24} />}
                    trend={DASHBOARD_METRICS.revenueGrowth}
                    bg="bg-emerald-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Highest Preference Course & Chart */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Highest Preference Course Spotlight */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                        <div className="w-full sm:w-2/5 md:w-1/3 h-48 sm:h-auto overflow-hidden relative">
                            <img
                                src={HIGHEST_PREFERENCE_COURSE.image}
                                alt={HIGHEST_PREFERENCE_COURSE.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Award size={14} /> Highest Preference
                            </div>
                        </div>
                        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{HIGHEST_PREFERENCE_COURSE.title}</h2>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">
                                        {HIGHEST_PREFERENCE_COURSE.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Instructor: {HIGHEST_PREFERENCE_COURSE.instructor}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Enrollments</p>
                                        <p className="font-semibold text-gray-900 flex items-center gap-1"><Users size={16} className="text-rose-500" /> {HIGHEST_PREFERENCE_COURSE.enrollments}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Rating</p>
                                        <p className="font-semibold text-gray-900 flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-current" /> {HIGHEST_PREFERENCE_COURSE.rating}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Completion</p>
                                        <p className="font-semibold text-gray-900 flex items-center gap-1"><Trophy size={16} className="text-indigo-500" /> {HIGHEST_PREFERENCE_COURSE.completionRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Lessons</p>
                                        <p className="font-semibold text-gray-900 flex items-center gap-1"><BookOpen size={16} className="text-blue-500" /> {HIGHEST_PREFERENCE_COURSE.totalLessons}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/admin/courses/${HIGHEST_PREFERENCE_COURSE.id}`}
                                    className="px-5 py-2.5 bg-[#f43f5e] hover:bg-rose-600 text-white text-sm font-medium rounded-full transition-colors inline-block"
                                >
                                    Manage Course
                                </Link>
                                <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors">
                                    View Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart Area (Simplified Representation) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Weekly Enrollments</h3>
                            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500">
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {ENROLLMENT_TRENDS.map((day, idx) => {
                                const heightPercentage = (day.count / 100) * 100;
                                return (
                                    <div key={idx} className="flex flex-col items-center w-full group">
                                        <div className="relative w-full flex justify-center h-full items-end pb-2">
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                                                {day.count}
                                            </div>
                                            <div
                                                className="w-full max-w-[40px] bg-rose-100 group-hover:bg-rose-200 rounded-t-sm transition-colors relative"
                                                style={{ height: `${heightPercentage}%` }}
                                            >
                                                <div
                                                    className="absolute bottom-0 w-full bg-[#f43f5e] group-hover:bg-rose-600 rounded-t-sm transition-colors"
                                                    style={{ height: '40%' }} // Represents subset, like completed vs just enrolled
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2 font-medium">{day.day}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-6 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
                                <span className="text-xs text-gray-600">Active Learned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-100"></div>
                                <span className="text-xs text-gray-600">New Enrollments</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Course Statistics Table */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Course Statistics</h3>
                            <Link href="/admin/courses" className="text-sm text-rose-500 hover:text-rose-600 font-medium">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {RECENT_COURSES.map(course => (
                                <div key={course.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1" title={course.title}>{course.title}</h4>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${course.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                                course.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {course.status}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">${course.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase">Enrollments</span>
                                            <span className="text-sm font-semibold text-gray-800">{course.enrollments}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase">Views</span>
                                            <span className="text-sm font-semibold text-gray-800">{course.views}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Top Metrics
function MetricCard({ title, value, icon, trend, bg }: { title: string, value: string | number, icon: React.ReactNode, trend: number, bg: string }) {
    const isPositive = trend >= 0;
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
        </div>
    )
}
