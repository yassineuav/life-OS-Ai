from rest_framework import viewsets, permissions
from .models import Course, LearningLog
from .serializers import CourseSerializer, LearningLogSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LearningLogViewSet(viewsets.ModelViewSet):
    serializer_class = LearningLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        log = serializer.save(user=self.request.user)
        if log.course:
            log.course.hours_completed += log.hours_spent
            # Auto-update status
            if log.course.hours_completed >= log.course.total_hours:
                log.course.status = 'COMPLETED'
            elif log.course.status == 'NOT_STARTED':
                log.course.status = 'IN_PROGRESS'
            log.course.save()
