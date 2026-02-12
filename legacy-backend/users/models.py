from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    full_name = models.CharField(max_length=155, blank=True)

    def save(self, *args, **kwargs):
        # This logic ensures that the name fields are always in sync.

        # Case 1: The user's full_name is being updated.
        if self.full_name:
            parts = self.full_name.split(' ', 1)
            self.first_name = parts[0]
            if len(parts) > 1:
                self.last_name = parts[1]
            else:
                self.last_name = ''

        # Case 2: A social provider (or the admin) is setting first/last name.
        elif self.first_name or self.last_name:
            if not self.full_name:  # Only set if full_name is not already set
                self.full_name = f"{self.first_name} {self.last_name}".strip()

        # Call the original save() method to save the instance
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    avatar_id = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    is_hireable = models.BooleanField(default=False)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)

    def __str__(self):
        return self.user.username
