from rest_framework import serializers
from .models import Quiz, QuizReward

class QuizRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizReward
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    rewards = QuizRewardSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'
