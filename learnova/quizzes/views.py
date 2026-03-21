from rest_framework import viewsets, permissions
from .models import Quiz, QuizReward
from .serializers import QuizSerializer, QuizRewardSerializer

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class QuizRewardViewSet(viewsets.ModelViewSet):
    queryset = QuizReward.objects.all()
    serializer_class = QuizRewardSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
