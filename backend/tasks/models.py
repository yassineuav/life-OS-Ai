from django.db import models
from django.conf import settings

class Task(models.Model):
    CATEGORY_CHOICES = [
        ('LEARNING', 'Learning'),
        ('GYM', 'Gym'),
        ('SLEEP', 'Sleep'),
        ('FINANCE', 'Finance'),
        ('CUSTOM', 'Custom'),
    ]

    FREQUENCY_CHOICES = [
        ('ONCE', 'One-time'),
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('CUSTOM', 'Custom'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='CUSTOM')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    frequency = models.CharField(max_length=50, choices=FREQUENCY_CHOICES, default='ONCE')
    quantity = models.FloatField(help_text="e.g., hours, reps, dollars", null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, help_text="e.g., hrs, pages")
    progress_percent = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"
