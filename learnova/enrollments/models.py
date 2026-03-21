from django.db import models
from django.conf import settings
from courses.models import Course, Lesson
from quizzes.models import Quiz

class Enrollment(models.Model):
    STATUS_CHOICES = (
        (1, 'Enrolled'),
        (2, 'In Progress'),
        (3, 'Completed'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"


class UserProgress(models.Model):
    STATUS_CHOICES = (
        (1, 'Completed'),
        (2, 'Not Completed'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='progress', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='user_progress', on_delete=models.CASCADE)
    status = models.IntegerField(choices=STATUS_CHOICES, default=2)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent = models.IntegerField(default=0, help_text="Time spent in seconds/minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.lesson.title}"


class UserQuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='quiz_attempts', on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, related_name='user_attempts', on_delete=models.CASCADE)
    submitted_ans_data = models.JSONField(null=True, blank=True, help_text="JSON data using react-quiz-kit")
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.quiz.title} Attempt"


class UserLessonStat(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lesson_stats', on_delete=models.CASCADE)
    total_points = models.IntegerField(default=0)
    completed_lesson = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Stats"


class UserPointsHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='points_history', on_delete=models.CASCADE)
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.points} pts at {self.created_at}"
