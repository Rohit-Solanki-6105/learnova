from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import UserViewSet
from courses.views import CourseViewSet, LessonViewSet, AttachmentViewSet
from quizzes.views import QuizViewSet, QuizRewardViewSet
from enrollments.views import (
    EnrollmentViewSet, UserProgressViewSet, UserQuizAttemptViewSet,
    UserLessonStatViewSet, UserPointsHistoryViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'attachments', AttachmentViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'quiz-rewards', QuizRewardViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'user-progress', UserProgressViewSet)
router.register(r'quiz-attempts', UserQuizAttemptViewSet)
router.register(r'lesson-stats', UserLessonStatViewSet)
router.register(r'points-history', UserPointsHistoryViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
