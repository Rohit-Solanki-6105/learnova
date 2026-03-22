from django.urls import path
from .views import ai_doubt_solver

urlpatterns = [
    path("doubt/", ai_doubt_solver),
]