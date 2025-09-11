from django.conf import settings
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
from django.contrib.auth import logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
import os


# Helper function to generate tokens (good practice)
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh_token': str(refresh),
        'access_token': str(refresh.access_token),
    }


class SessionToJWTView(APIView):
    """
    An endpoint to exchange a valid session ID for a JWT.
    This is used to transition from a stateful login to a stateless session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        tokens = get_tokens_for_user(user)

        response_data = {
            "user": {
                "id": user.id,
                "display": getattr(user, 'display', user.username),
                "email": user.email,
                "username": user.username
            },
            **tokens
        }

        response = Response(response_data, status=status.HTTP_200_OK)

        # --- THIS IS THE ROBUST FIX ---
        # We explicitly tell the browser to delete the cookie for the root path ('/'),
        # which is Django's default for the sessionid. This ensures the delete
        # command matches the set command.

        # We also read the cookie name from settings for correctness.
        session_cookie_name = settings.SESSION_COOKIE_NAME

        print(
            f"\n[DEBUG] Attempting to delete cookie '{session_cookie_name}' with Path='/'\n")
        response.delete_cookie(session_cookie_name, path='/')

        # Destroy the server-side session.
        logout(request)

        return response


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
