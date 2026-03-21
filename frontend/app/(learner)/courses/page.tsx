'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Zap, Search, AlertCircle, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/auth';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: string | number | null;
  total_lesson: number;
  total_duration: number;
  status: number; // 1: Draft, 2: Published, 3: Archived
  visibility: number; // 1: Everyone, 2: Only Invited
  tags: Array<{ id: number; name: string }>;
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface Enrollment {
  id: number;
  course: number;
  user: number;
  status: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Fetch courses and enrollments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all courses
        const res = await fetchWithAuth('/courses/');
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setCourses(data);

        // Fetch user's enrollments
        const enrollRes = await fetchWithAuth('/enrollments/');
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          const enrolledCourseIds = new Set<number>(
            enrollData.map((enrollment: Enrollment) => enrollment.course)
          );
          setEnrollments(enrolledCourseIds);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load courses');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle enrollment
  const handleEnroll = async (courseId: number) => {
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      setError(null);
      
      const res = await fetchWithAuth('/enrollments/', {
        method: 'POST',
        body: JSON.stringify({
          course: courseId,
          status: 1, // Enrolled status
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.error || data.detail || data.message || 'Failed to enroll in course';
        throw new Error(errorMsg);
      }

      // Add course to enrollments set on success
      setEnrollments(prev => new Set([...prev, courseId]));
      
      // Show success (you can add a toast notification here if you set up sonner)
      console.log('Successfully enrolled in course', courseId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      setError(errorMessage);
      console.error('Error enrolling:', err);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Filter courses based on search and tag
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || course.tags.some(tag => tag.name === selectedTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(courses.flatMap(c => c.tags.map(t => t.name))));

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Courses</h1>
            <p className="text-gray-500 dark:text-gray-400">Discover and enroll in courses to start learning.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="dark:bg-gray-800 animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Courses</h1>
          <p className="text-gray-500 dark:text-gray-400">Discover and enroll in courses to start learning.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedTag === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrollments.has(course.id)}
              isEnrolling={enrolling[course.id] || false}
              onEnroll={() => handleEnroll(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchTerm ? 'Try adjusting your search terms' : 'Check back soon for more courses!'}
          </p>
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
}

function CourseCard({ course, isEnrolled, isEnrolling, onEnroll }: CourseCardProps) {
  const instructorName = course.created_by
    ? `${course.created_by.first_name} ${course.created_by.last_name}`.trim() || course.created_by.username
    : 'Unknown Instructor';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800 border-gray-100 dark:border-gray-700 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <BookOpen className="h-12 w-12 text-white/40" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          </div>
          <CardDescription className="line-clamp-2 text-sm">{course.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pb-3">
          {/* Tags */}
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.slice(0, 2).map(tag => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {course.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{course.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Course Stats */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{course.total_lesson} lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{course.total_duration} minutes</span>
            </div>
            {course.price && parseFloat(course.price.toString()) > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${parseFloat(course.price.toString()).toFixed(2)}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              by {instructorName}
            </p>
          </div>
        </CardContent>

        {/* Enrollment Button */}
        <div className="p-4 pt-0">
          <Button
            onClick={onEnroll}
            disabled={isEnrolled || isEnrolling}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-50"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : isEnrolled ? (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Already Enrolled
              </>
            ) : (
              'Enroll Now'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
