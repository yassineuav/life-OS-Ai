from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(blank=True)
    # Add other fields here if needed (e.g. settings)

    def __str__(self):
        return self.username
