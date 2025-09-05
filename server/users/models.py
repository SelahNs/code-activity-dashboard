from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    full_name = models.CharField(max_length=155, blank=True)


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    is_hireable = models.BooleanField(default=False)
    github = models.CharField(max_length=50, blank=True)
    linkedin = models.CharField(max_length=50, blank=True)
    twitter = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.user.username
