export interface LearningAttachment {
  id: number;
  attachment_name: string;
  attachment_url: string;
  attachment_type: number;
}

export interface LearningLesson {
  id: number;
  title: string;
  sequence: number;
  duration: number;
  data: unknown;
  attachments?: LearningAttachment[];
}

export interface LearningQuiz {
  id: number;
  title: string;
  description: string;
  sequence: number;
  duration: number;
  data: unknown;
}

export interface LearningCourse {
  id: number;
  title: string;
  description: string;
  lessons: LearningLesson[];
  quizzes: LearningQuiz[];
}

export interface UserProgressEntry {
  id: number;
  lesson: number;
  status: number;
}

export interface UserQuizAttemptEntry {
  id: number;
  quiz: number;
}

export type LearningItem =
  | {
      kind: "lesson";
      id: number;
      title: string;
      sequence: number;
      duration: number;
      lesson: LearningLesson;
    }
  | {
      kind: "quiz";
      id: number;
      title: string;
      sequence: number;
      duration: number;
      quiz: LearningQuiz;
    };

export interface CourseProgressSummary {
  percent: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalItems: number;
  completedItems: number;
  completedLessonIds: Set<number>;
  attemptedQuizIds: Set<number>;
}

export function buildLearningItems(course: LearningCourse): LearningItem[] {
  const items: LearningItem[] = [
    ...(course.lessons ?? []).map((lesson) => ({
      kind: "lesson" as const,
      id: lesson.id,
      title: lesson.title,
      sequence: lesson.sequence ?? 0,
      duration: lesson.duration ?? 0,
      lesson,
    })),
    ...(course.quizzes ?? []).map((quiz) => ({
      kind: "quiz" as const,
      id: quiz.id,
      title: quiz.title,
      sequence: quiz.sequence ?? 0,
      duration: quiz.duration ?? 0,
      quiz,
    })),
  ];

  return items.sort((a, b) => {
    if (a.sequence !== b.sequence) return a.sequence - b.sequence;
    if (a.kind === b.kind) return a.id - b.id;
    // If sequence is same, keep lessons before quizzes.
    return a.kind === "lesson" ? -1 : 1;
  });
}

export function calculateCourseProgress(
  course: LearningCourse,
  progressEntries: UserProgressEntry[],
  quizAttempts: UserQuizAttemptEntry[]
): CourseProgressSummary {
  const completedLessonIds = new Set(
    (progressEntries ?? [])
      .filter((entry) => Number(entry.status) === 1)
      .map((entry) => Number(entry.lesson))
  );
  const attemptedQuizIds = new Set(
    (quizAttempts ?? []).map((entry) => Number(entry.quiz))
  );

  const totalLessons = (course.lessons ?? []).length;
  const totalQuizzes = (course.quizzes ?? []).length;
  const totalItems = totalLessons + totalQuizzes;

  const completedLessons = (course.lessons ?? []).filter((lesson) =>
    completedLessonIds.has(Number(lesson.id))
  ).length;
  const completedQuizzes = (course.quizzes ?? []).filter((quiz) =>
    attemptedQuizIds.has(Number(quiz.id))
  ).length;

  const completedItems = completedLessons + completedQuizzes;
  const percent =
    totalItems > 0
      ? Math.max(0, Math.min(100, Math.round((completedItems / totalItems) * 100)))
      : 0;

  return {
    percent,
    totalLessons,
    completedLessons,
    totalQuizzes,
    completedQuizzes,
    totalItems,
    completedItems,
    completedLessonIds,
    attemptedQuizIds,
  };
}
