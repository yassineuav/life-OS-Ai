from django.db import models
from django.conf import settings

class DailyHealthLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='health_logs')
    date = models.DateField()
    
    # Sleep
    sleep_hours = models.FloatField(default=0.0)
    sleep_quality = models.IntegerField(default=5, help_text="1-10 scale")
    
    # Energy
    energy_level = models.IntegerField(default=5, help_text="1-10 scale")
    
    # Gym
    gym_session_completed = models.BooleanField(default=False)
    gym_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"Health Log: {self.date}"
