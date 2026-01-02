from rest_framework import viewsets, permissions
from .models import DailyHealthLog
from .serializers import DailyHealthLogSerializer

class DailyHealthLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyHealthLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyHealthLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
