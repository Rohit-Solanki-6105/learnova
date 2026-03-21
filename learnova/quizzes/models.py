from django.db import models
from courses.models import Lesson

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, related_name='quiz', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    data = models.JSONField(null=True, blank=True, help_text="JSON data using react-quiz-kit")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class QuizReward(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='rewards', on_delete=models.CASCADE)
    attempt_no = models.IntegerField()
    reward_points = models.IntegerField()

    def __str__(self):
        return f"{self.quiz.title} - Attempt {self.attempt_no}: {self.reward_points} pts"
