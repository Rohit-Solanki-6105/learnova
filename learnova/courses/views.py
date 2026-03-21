from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Course, Lesson, Attachment, Tag
from .serializers import CourseSerializer, LessonSerializer, AttachmentSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter courses based on status and visibility."""
        queryset = Course.objects.select_related('created_by', 'responsible').prefetch_related('tags', 'lessons', 'quizzes')
        
        # Filter by status (1=Draft, 2=Published, 3=Archived)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=int(status))
        
        # Filter by visibility (1=Everyone, 2=Only Invited)
        visibility = self.request.query_params.get('visibility')
        if visibility:
            queryset = queryset.filter(visibility=int(visibility))
        
        # Search by title or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
