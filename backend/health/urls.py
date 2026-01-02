from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyHealthLogViewSet

router = DefaultRouter()
router.register(r'daily', DailyHealthLogViewSet, basename='health-log')

urlpatterns = [
    path('', include(router.urls)),
]
