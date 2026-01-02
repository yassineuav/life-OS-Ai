from django.db import models
from django.conf import settings

class Course(models.Model):
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=255)
    platform = models.CharField(max_length=100, blank=True)
    total_hours = models.FloatField(help_text="Estimated total hours to complete")
    hours_completed = models.FloatField(default=0.0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='NOT_STARTED')
    
    def __str__(self):
        return self.name

class LearningLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_logs')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    date = models.DateField()
    hours_spent = models.FloatField(default=0.0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.date}: {self.hours_spent}hrs"
