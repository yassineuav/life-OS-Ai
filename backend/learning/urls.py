from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LearningLogViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'logs', LearningLogViewSet, basename='learning-log')

urlpatterns = [
    path('', include(router.urls)),
]
