from django.contrib import admin
from .models import Enrollment, UserProgress, UserQuizAttempt, UserLessonStat, UserPointsHistory

# Register your models here.

admin.site.register(Enrollment)
admin.site.register(UserProgress)
admin.site.register(UserQuizAttempt)
admin.site.register(UserLessonStat)
admin.site.register(UserPointsHistory)
