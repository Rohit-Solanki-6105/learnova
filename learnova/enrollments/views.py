from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Enrollment, UserProgress, UserQuizAttempt, UserLessonStat, UserPointsHistory
from .serializers import (
    EnrollmentSerializer, EnrollmentDetailSerializer,
    UserProgressSerializer, UserQuizAttemptSerializer,
    UserLessonStatSerializer, UserPointsHistorySerializer
)


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


class UserLessonStatViewSet(viewsets.ModelViewSet):
    queryset = UserLessonStat.objects.all()
    serializer_class = UserLessonStatSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPointsHistoryViewSet(viewsets.ModelViewSet):
    queryset = UserPointsHistory.objects.all()
    serializer_class = UserPointsHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
