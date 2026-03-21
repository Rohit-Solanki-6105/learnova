from rest_framework import serializers
from quizzes.serializers import QuizSerializer
from .models import Course, Lesson, Attachment, Tag


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    # Read: returns full tag objects {id, name}
    tags = TagSerializer(many=True, read_only=True)
    # Write: accepts list of tag IDs
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='tags',
    )

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'visibility', 'price', 'thumbnail', 'status',
            'total_lesson', 'total_duration', 'responsible',
            'tags', 'tag_ids',
            'lessons', 'quizzes',
        ]
        read_only_fields = ['created_by', 'updated_by']

    def update(self, instance, validated_data):
        # Handle tags M2M explicitly so PATCH works
        tags = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set(tags)
        return instance

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        instance = super().create(validated_data)
        if tags:
            instance.tags.set(tags)
        return instance
