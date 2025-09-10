from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount

User = get_user_model()

# This serializer will handle the nested 'user' object if you need it


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = ['full_name', 'username', 'first_name', 'last_name', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    # These are your custom read-only fields
    github_url = serializers.SerializerMethodField()
    linkedin_url = serializers.SerializerMethodField()
    twitter_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        # Now this list will work correctly
        fields = [
            'user', 'avatar_url', 'bio', 'is_hireable',
            'github_url', 'linkedin_url', 'twitter_url'
        ]

    def get_social_url(self, obj, provider_name):
        """Helper function to get a social URL from the user's SocialAccount."""

        user = obj.user
        try:
            social_account = user.socialaccount_set.get(provider=provider_name)
            if provider_name == 'github':
                return social_account.extra_data.get('html_url')
        except SocialAccount.DoesNotExist:
            return None

    def get_github_url(self, obj):
        return self.get_social_url(obj, 'github')

    def get_linkedin_url(self, obj):
        return self.get_social_url(obj, 'linkedin_oauth2')

    def get_twitter_url(self, obj):
        return self.get_social_url(obj, 'twitter')
