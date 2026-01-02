from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import DailyHealthLog
from .serializers import DailyHealthLogSerializer

class DailyHealthLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyHealthLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyHealthLog.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        date = request.data.get('date')
        try:
            # Check if log exists for this date
            instance = DailyHealthLog.objects.get(user=request.user, date=date)
            # Update existing
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except DailyHealthLog.DoesNotExist:
            # Create new
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
