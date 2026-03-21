from rest_framework import serializers
from quizzes.serializers import QuizSerializer
from .models import Course, Lesson, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'created_by', 'updated_by', 'visibility', 'price', 'thumbnail', 'status', 'total_lesson', 'total_duration', 'responsible', 'lessons', 'quizzes']
        read_only_fields = ['created_by', 'updated_by']
