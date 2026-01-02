from django.urls import path
from .views import DailyPredictionView

urlpatterns = [
    path('daily-insight/', DailyPredictionView.as_view(), name='daily-insight'),
]
