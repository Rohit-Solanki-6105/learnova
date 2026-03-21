from rest_framework import serializers
from django.db.models import Count, Sum, Avg
from .models import Enrollment, UserProgress, UserQuizAttempt, UserLessonStat, UserPointsHistory
from users.serializers import UserSerializer


class UserProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_sequence = serializers.IntegerField(source='lesson.sequence', read_only=True)

    class Meta:
        model = UserProgress
        fields = '__all__'


class UserQuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    score_data = serializers.SerializerMethodField()

    class Meta:
        model = UserQuizAttempt
        fields = '__all__'

    def get_score_data(self, obj):
        """Extract score from submitted_ans_data if stored there."""
        data = obj.submitted_ans_data or {}
        return {
            'correctPoints': data.get('correctPoints', None),
            'totalPoints': data.get('totalPoints', None),
        }


class UserLessonStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLessonStat
        fields = '__all__'


class UserPointsHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPointsHistory
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    """Basic enrollment — used in list views."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    lessons_completed = serializers.SerializerMethodField()
    quizzes_attempted = serializers.SerializerMethodField()
    total_lessons = serializers.IntegerField(source='course.total_lesson', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'user', 'user_email', 'user_name', 'course', 'course_title',
            'status', 'status_display', 'completed_at', 'created_at', 'updated_at',
            'lessons_completed', 'quizzes_attempted', 'total_lessons',
        ]

    def get_user_name(self, obj):
        u = obj.user
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username or u.email

    def get_lessons_completed(self, obj):
        return UserProgress.objects.filter(
            user=obj.user, lesson__course=obj.course, status=1
        ).count()

    def get_quizzes_attempted(self, obj):
        return UserQuizAttempt.objects.filter(
            user=obj.user, quiz__course=obj.course
        ).count()


class EnrollmentDetailSerializer(EnrollmentSerializer):
    """Detailed enrollment — includes lesson progress and quiz attempts."""
    lesson_progress = serializers.SerializerMethodField()
    quiz_attempts = serializers.SerializerMethodField()

    class Meta(EnrollmentSerializer.Meta):
        fields = EnrollmentSerializer.Meta.fields + ['lesson_progress', 'quiz_attempts']

    def get_lesson_progress(self, obj):
        qs = UserProgress.objects.filter(
            user=obj.user, lesson__course=obj.course
        ).select_related('lesson').order_by('lesson__sequence')
        return UserProgressSerializer(qs, many=True).data

    def get_quiz_attempts(self, obj):
        qs = UserQuizAttempt.objects.filter(
            user=obj.user, quiz__course=obj.course
        ).select_related('quiz').order_by('-created_at')
        return UserQuizAttemptSerializer(qs, many=True).data
