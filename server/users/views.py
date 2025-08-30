from django.shortcuts import render
from rest_framework import generics, permissions
from .models import UserProfile
from .serializers import UserProfileSerializer
import os
# Create your views here.


class UserProfileDetail(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows a user's profile to be viewed or edited.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """
        This method ensures that users can only access their own profile.
        It retrieves the profile associated with the currently logged-in user.
        """
        return self.request.user.userprofile

