from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth import get_user_model

User = get_user_model()

# This serializer will handle the nested 'user' object if you need it


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # We only expose non-sensitive fields
        fields = ['username', 'first_name', 'last_name', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    # This makes the user details appear nested within the profile JSON
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        # List all the fields from your UserProfile model that the API should handle
        fields = ['user', 'avatar_url', 'bio',
                  'is_hireable', 'github', 'linkedin', 'twitter']
