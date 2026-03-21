from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from courses.models import Course


class Quiz(models.Model):
    course = models.ForeignKey(Course, related_name='quizzes', on_delete=models.CASCADE, null=True)
    sequence = models.IntegerField(default=0)
    title = models.CharField(max_length=255)
    description = models.TextField()
    data = models.JSONField(null=True, blank=True, help_text="JSON data using react-quiz-kit")
    duration = models.IntegerField(default=0, help_text="Duration in minutes (time limit for this quiz)")
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


# ─── Signals: auto-update course.total_duration ───────────────────────────────

def _update_course_duration(course_id):
    """Recompute total_duration for a course from its lessons + quizzes."""
    if not course_id:
        return
    from courses.models import Lesson
    lesson_total = Lesson.objects.filter(course_id=course_id).aggregate(
        total=models.Sum('duration')
    )['total'] or 0
    quiz_total = Quiz.objects.filter(course_id=course_id).aggregate(
        total=models.Sum('duration')
    )['total'] or 0
    Course.objects.filter(pk=course_id).update(total_duration=lesson_total + quiz_total)


@receiver(post_save, sender=Quiz)
def quiz_post_save(sender, instance, **kwargs):
    _update_course_duration(instance.course_id)


@receiver(post_delete, sender=Quiz)
def quiz_post_delete(sender, instance, **kwargs):
    _update_course_duration(instance.course_id)

