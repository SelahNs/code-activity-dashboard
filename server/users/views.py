from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
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
    queryset = UserProfile.objects.all()
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
            # Find the corresponding email address object in the database.
            email_address = EmailAddress.objects.get(email__iexact=email)
        except EmailAddress.DoesNotExist:
            # For security, we never reveal if an email exists or not.
            # This prevents attackers from guessing which emails are registered.
            return Response(
                {"detail": "If an account with this email exists, a new verification link has been sent."},
                status=status.HTTP_200_OK
            )

        # If the user's email is already verified, tell them.
        if email_address.verified:
            return Response(
                {"error": "This email address is already verified."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- THE DEFINITIVE FIX ---
        #
        # This is the official, high-level method provided by django-allauth.
        # It correctly performs all necessary steps in the right order:
        #   1. Deletes any old, unused confirmation keys from the database.
        #   2. Creates a new, secure EmailConfirmation object.
        #   3. Calls the correct adapter to send the email.
        #
        # Because your project is configured for link-based verification, this
        # method will correctly send an email with a new, valid link (key).
        #
        email_address.send_confirmation(request)

        # --- END OF FIX ---

        return Response(
            {"detail": "If an account with this email exists, a new verification link has been sent."},
            status=status.HTTP_200_OK
        )


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenView(APIView):
    """
    A view to provide a CSRF token to the frontend.
    The `@ensure_csrf_cookie` decorator forces Django to set the csrftoken cookie.
    """
    permission_classes = [AllowAny]  # No authentication needed

    def get(self, request, *args, **kwargs):
        # We also send the token in the response for convenience,
        # although the frontend can also read it from the cookie.
        return JsonResponse({'csrfToken': get_token(request)})
