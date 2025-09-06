from django.shortcuts import render
from rest_framework import generics, permissions
from .models import UserProfile
from .serializers import UserProfileSerializer
import os
from allauth.account.adapter import get_adapter
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from allauth.account.models import EmailAddress


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

User = get_user_model()

class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"email": "Email field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # This is the correct, direct way to handle this.
        # We query the EmailAddress model directly.
        try:
            email_address = EmailAddress.objects.get(email__iexact=email)
            
            # If the email is found but is not yet verified...
            if not email_address.verified:
                # ...we call the send_confirmation method ON the object itself.
                email_address.send_confirmation(request)

        except EmailAddress.DoesNotExist:
            # If the email does not exist in our system at all,
            # we do nothing. This prevents email enumeration.
            pass
        
        # In all cases, we return the same success response as per our API Contract.
        return Response(status=status.HTTP_204_NO_CONTENT)