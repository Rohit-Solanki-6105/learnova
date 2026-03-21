import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, TrendingUp, Search } from "lucide-react"
import Link from "next/link"

export default function MyCoursesPage() {
    // Mock data for demonstration
    const stats = [
        { name: "Total Points", value: "85", icon: TrendingUp },
        { name: "Courses in Progress", value: "3", icon: BookOpen },
        { name: "Badges Earned", value: "4", icon: Award },
    ]

    const courses = [
        {
            id: 1,
            title: "Introduction to React",
            description: "Learn the fundamentals of React, including components, hooks, and state management.",
            progress: 65,
            tag: "Development",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"
        },
        {
            id: 2,
            title: "Advanced CSS Techniques",
            description: "Master CSS Grid, Flexbox, and advanced animations for modern web design.",
            progress: 30,
            tag: "Design",
            image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80"
        }
    ]

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Learning</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your progress and continue your journey.</p>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search your courses..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-none shadow-sm dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <section className="lg:col-span-3 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Courses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course) => (
                            <Link href={`/learn/${course.id}`} key={course.id}>
                                <Card className="group hover:shadow-md transition-shadow overflow-hidden dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                                        <img 
                                            src={course.image} 
                                            alt={course.title} 
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 backdrop-blur-sm border-none">
                                            {course.tag}
                                        </Badge>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-sm">{course.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="space-y-2 mt-4">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Progress</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-300">{course.progress}%</span>
                                            </div>
                                            <Progress value={course.progress} className="h-1.5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                <aside className="space-y-6">
                    <Card className="dark:bg-gray-800 border-none shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                My Badges
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "Specialist", points: "85/80", active: true },
                                { name: "Expert", points: "85/100", active: false },
                                { name: "Master", points: "85/120", active: false },
                            ].map((badge) => (
                                <div key={badge.name} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    badge.active 
                                        ? "bg-yellow-50/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30" 
                                        : "bg-gray-50/30 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 opacity-60"
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${badge.active ? "bg-yellow-100 text-yellow-600" : "bg-gray-200 text-gray-400"}`}>
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <span className={`text-sm font-medium ${badge.active ? "text-yellow-900 dark:text-yellow-100" : "text-gray-500"}`}>
                                            {badge.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{badge.points}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
