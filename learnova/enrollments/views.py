from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from courses.models import Lesson
from quizzes.models import Quiz
from .models import Enrollment, UserProgress, UserQuizAttempt, UserLessonStat, UserPointsHistory
from .serializers import (
    EnrollmentSerializer, EnrollmentDetailSerializer,
    UserProgressSerializer, UserQuizAttemptSerializer,
    UserLessonStatSerializer, UserPointsHistorySerializer
)


def sync_enrollment_status(user, course):
    enrollment = Enrollment.objects.filter(user=user, course=course).first()
    if not enrollment:
        return

    total_lessons = course.lessons.count()
    total_quizzes = course.quizzes.count()
    total_items = total_lessons + total_quizzes

    completed_lessons = UserProgress.objects.filter(
        user=user,
        lesson__course=course,
        status=1,
    ).count()
    attempted_quizzes = UserQuizAttempt.objects.filter(
        user=user,
        quiz__course=course,
    ).values('quiz_id').distinct().count()

    completed_items = completed_lessons + attempted_quizzes

    if total_items > 0 and completed_items >= total_items:
        new_status = 3
    elif completed_items > 0:
        new_status = 2
    else:
        new_status = 1

    enrollment.status = new_status
    if new_status == 3:
        if enrollment.completed_at is None:
            enrollment.completed_at = timezone.now()
    else:
        enrollment.completed_at = None
    enrollment.save(update_fields=['status', 'completed_at', 'updated_at'])


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Enrollment.objects.all()

    def get_queryset(self):
        qs = Enrollment.objects.select_related('user', 'course').all()
        course_id = self.request.query_params.get('course')
        user_id = self.request.query_params.get('user')
        enroll_status = self.request.query_params.get('status')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if enroll_status:
            qs = qs.filter(status=enroll_status)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Handle enrollment creation with duplicate prevention."""
        course_id = request.data.get('course')
        
        if not course_id:
            return Response(
                {'error': 'course field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is already enrolled
        existing = Enrollment.objects.filter(user=request.user, course_id=course_id).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new enrollment with user auto-set
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'], url_path='detail')
    def learner_detail(self, request, pk=None):
        """Full learner stats for a single enrollment."""
        enrollment = self.get_object()
        serializer = EnrollmentDetailSerializer(enrollment, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='course-stats')
    def course_stats(self, request):
        """Aggregate enrollment stats for a course."""
        course_id = request.query_params.get('course')
        if not course_id:
            return Response({'error': 'course param required'}, status=status.HTTP_400_BAD_REQUEST)

        enrollments = Enrollment.objects.filter(course_id=course_id)
        total = enrollments.count()
        completed = enrollments.filter(status=3).count()
        in_progress = enrollments.filter(status=2).count()
        enrolled = enrollments.filter(status=1).count()

        return Response({
            'total_enrolled': total,
            'completed': completed,
            'in_progress': in_progress,
            'enrolled': enrolled,
            'completion_rate': round((completed / total * 100) if total else 0, 1),
        })


class UserProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = UserProgress.objects.select_related('user', 'lesson').all()
        user_id = self.request.query_params.get('user')
        lesson_id = self.request.query_params.get('lesson')
        course_id = self.request.query_params.get('course')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        if course_id:
            qs = qs.filter(lesson__course_id=course_id)
        return qs

    @action(detail=False, methods=['post'], url_path='mark-complete')
    def mark_complete(self, request):
        lesson_id = request.data.get('lesson')
        if not lesson_id:
            return Response({'error': 'lesson field is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lesson_id = int(lesson_id)
        except (TypeError, ValueError):
            return Response({'error': 'lesson must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
        if not Lesson.objects.filter(id=lesson_id).exists():
            return Response({'error': 'lesson not found'}, status=status.HTTP_404_NOT_FOUND)

        progress = (
            UserProgress.objects
            .select_related('lesson', 'lesson__course')
            .filter(user=request.user, lesson_id=lesson_id)
            .order_by('-updated_at')
            .first()
        )

        now = timezone.now()
        if progress is None:
            progress = UserProgress.objects.create(
                user=request.user,
                lesson_id=lesson_id,
                status=1,
                completed_at=now,
            )
        else:
            progress.status = 1
            progress.completed_at = progress.completed_at or now
            progress.save(update_fields=['status', 'completed_at', 'updated_at'])

        if progress.lesson and progress.lesson.course:
            sync_enrollment_status(request.user, progress.lesson.course)

        serializer = self.get_serializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = UserQuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = UserQuizAttempt.objects.select_related('user', 'quiz').all()
        user_id = self.request.query_params.get('user')
        quiz_id = self.request.query_params.get('quiz')
        course_id = self.request.query_params.get('course')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        if course_id:
            qs = qs.filter(quiz__course_id=course_id)
        return qs.order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='mark-attempted')
    def mark_attempted(self, request):
        quiz_id = request.data.get('quiz')
        if not quiz_id:
            return Response({'error': 'quiz field is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quiz_id = int(quiz_id)
        except (TypeError, ValueError):
            return Response({'error': 'quiz must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
        if not Quiz.objects.filter(id=quiz_id).exists():
            return Response({'error': 'quiz not found'}, status=status.HTTP_404_NOT_FOUND)

        submitted_ans_data = request.data.get('submitted_ans_data')
        now = timezone.now()

        attempt = (
            UserQuizAttempt.objects
            .select_related('quiz', 'quiz__course')
            .filter(user=request.user, quiz_id=quiz_id)
            .order_by('-updated_at')
            .first()
        )

        if attempt is None:
            attempt = UserQuizAttempt.objects.create(
                user=request.user,
                quiz_id=quiz_id,
                submitted_ans_data=submitted_ans_data if submitted_ans_data is not None else {},
                completed_at=now,
            )
        else:
            if submitted_ans_data is not None:
                attempt.submitted_ans_data = submitted_ans_data
            attempt.completed_at = attempt.completed_at or now
            attempt.save(update_fields=['submitted_ans_data', 'completed_at', 'updated_at'])

        if attempt.quiz and attempt.quiz.course:
            sync_enrollment_status(request.user, attempt.quiz.course)

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserLessonStatViewSet(viewsets.ModelViewSet):
    queryset = UserLessonStat.objects.all()
    serializer_class = UserLessonStatSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPointsHistoryViewSet(viewsets.ModelViewSet):
    queryset = UserPointsHistory.objects.all()
    serializer_class = UserPointsHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
