from rest_framework import serializers
from .models import Enrollment, UserProgress, UserQuizAttempt, UserLessonStat, UserPointsHistory

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'

class UserQuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizAttempt
        fields = '__all__'

class UserLessonStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLessonStat
        fields = '__all__'

class UserPointsHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPointsHistory
        fields = '__all__'
