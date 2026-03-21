from rest_framework import viewsets, permissions
from .models import Enrollment, UserProgress, UserQuizAttempt, UserLessonStat, UserPointsHistory
from .serializers import (
    EnrollmentSerializer, UserProgressSerializer, UserQuizAttemptSerializer,
    UserLessonStatSerializer, UserPointsHistorySerializer
)

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProgressViewSet(viewsets.ModelViewSet):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserQuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = UserQuizAttempt.objects.all()
    serializer_class = UserQuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserLessonStatViewSet(viewsets.ModelViewSet):
    queryset = UserLessonStat.objects.all()
    serializer_class = UserLessonStatSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserPointsHistoryViewSet(viewsets.ModelViewSet):
    queryset = UserPointsHistory.objects.all()
    serializer_class = UserPointsHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
