from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount

User = get_user_model()

# This serializer will handle the nested 'user' object if you need it


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = ['full_name', 'username', 'email', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    full_name = serializers.CharField(write_only=True, required=False, source='user.full_name',max_length=155)
    class Meta:
        model = UserProfile
        # Now this list will work correctly
        fields = [
            'user', 'full_name','avatar_id', 'avatar', 'bio', 'is_hireable',
            'github_url', 'linkedin_url', 'twitter_url'
        ]
        #read_only_fields = ['avatar_url']
        read_only_fields = ['user']
        #extra_kwargs = {'avatar': {'write_only': True}}

    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data= validated_data.pop('user')
            user = instance.user
            user.full_name = user_data.get('full_name', user.full_name)
            user.save()


        validated_data.pop('avatar',None)
    

        avatar_file = self.context['request'].FILES.get('avatar')

        if avatar_file is not None:
            instance.avatar = avatar_file
            instance.avatar_id = ""  # clear predefined url
        else:
            if 'avatar_id' in validated_data: 
                instance.avatar.delete()
        # update remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
# def get_social_url(self, obj, provider_name):
    #     """Helper function to get a social URL from the user's SocialAccount."""

    #     user = obj.user
    #     try:
    #         social_account = user.socialaccount_set.get(provider=provider_name)
    #         if provider_name == 'github':
    #             return social_account.extra_data.get('html_url')
    #     except SocialAccount.DoesNotExist:
    #         return None

    # def get_github_url(self, obj):
    #     return self.get_social_url(obj, 'github')

    # def get_linkedin_url(self, obj):
    #     return self.get_social_url(obj, 'linkedin_oauth2')

    # def get_twitter_url(self, obj):
    #     return self.get_social_url(obj, 'twitter')
    # def update(self, instance, validated_data):
    #     # handle avatar logic
