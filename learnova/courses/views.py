import os
import uuid

from django.core.files.storage import default_storage
from django.db.models import Q
from django.utils.text import get_valid_filename
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Course, Lesson, Attachment, Tag
from .serializers import CourseSerializer, LessonSerializer, AttachmentSerializer, TagSerializer


def is_admin_or_instructor(user):
    return bool(user and user.is_authenticated and getattr(user, 'role', None) in (1, 2))


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

        user = self.request.user
        is_authenticated = bool(user and user.is_authenticated)
        can_manage_courses = is_authenticated and is_admin_or_instructor(user)

        # Learners and anonymous users should only see public, published courses.
        if not can_manage_courses:
            queryset = queryset.filter(status=2, visibility=1)
        
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

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Attachment.objects.all().order_by('-id')
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            try:
                queryset = queryset.filter(lesson_id=int(lesson_id))
            except (TypeError, ValueError):
                queryset = queryset.none()
        return queryset

    def create(self, request, *args, **kwargs):
        if not is_admin_or_instructor(request.user):
            return Response({'detail': 'Only admin or instructor can create attachments.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not is_admin_or_instructor(request.user):
            return Response({'detail': 'Only admin or instructor can update attachments.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_or_instructor(request.user):
            return Response({'detail': 'Only admin or instructor can update attachments.'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_or_instructor(request.user):
            return Response({'detail': 'Only admin or instructor can delete attachments.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(
        detail=False,
        methods=['post'],
        url_path='upload',
        parser_classes=[MultiPartParser, FormParser],
        permission_classes=[permissions.IsAuthenticated],
    )
    def upload(self, request):
        if not is_admin_or_instructor(request.user):
            return Response({'detail': 'Only admin or instructor can upload attachments.'}, status=status.HTTP_403_FORBIDDEN)

        file_obj = request.FILES.get('file')
        if file_obj is None:
            return Response({'detail': "No file provided. Use multipart/form-data with key 'file'."}, status=status.HTTP_400_BAD_REQUEST)

        base_name, ext = os.path.splitext(file_obj.name or 'attachment')
        safe_base_name = get_valid_filename(base_name) or 'attachment'
        safe_ext = ext.lower()[:10]
        save_name = f'uploads/{uuid.uuid4().hex}_{safe_base_name[:80]}{safe_ext}'

        stored_path = default_storage.save(save_name, file_obj)
        relative_url = default_storage.url(stored_path)
        absolute_url = request.build_absolute_uri(relative_url)

        return Response(
            {
                'url': absolute_url,
                'relative_url': relative_url,
                'name': file_obj.name,
                'size': file_obj.size,
                'content_type': getattr(file_obj, 'content_type', ''),
            },
            status=status.HTTP_201_CREATED,
        )
