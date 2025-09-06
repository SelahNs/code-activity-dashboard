from django.shortcuts import render
from rest_framework import generics, permissions
from .models import UserProfile
from .serializers import UserProfileSerializer
from allauth.account.models import EmailAddress, EmailConfirmation
from allauth.account.adapter import get_adapter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
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


class ResendVerificationLinkView(APIView):
    permission_classes = [AllowAny]  # Anyone can request a new link

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            email_address = EmailAddress.objects.get(email__iexact=email)
        except EmailAddress.DoesNotExist:
            # Always return a success response to prevent email enumeration
            return Response(
                {"detail": "If an account with this email exists, a new verification link has been sent."},
                status=status.HTTP_200_OK
            )

        # Check if the email is already verified
        if email_address.verified:
            return Response(
                {"error": "This email address is already verified."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- This is the logic you found ---
        # Delete any old, pending confirmations for this email
        EmailConfirmation.objects.filter(email_address=email_address).delete()

        # Create a new confirmation
        confirmation = EmailConfirmation.create(email_address)

        # Send the email using the allauth adapter
        adapter = get_adapter(self.request)
        adapter.send_confirmation_mail(
            self.request, confirmation, signup=False)
        # --- End of your logic ---

        return Response(
            {"detail": "If an account with this email exists, a new verification link has been sent."},
            status=status.HTTP_200_OK
        )
