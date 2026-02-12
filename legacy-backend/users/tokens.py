from allauth.headless.tokens.sessions import SessionTokenStrategy
from rest_framework_simplejwt.tokens import RefreshToken


class JWTTokenStrategy(SessionTokenStrategy):
    """
    This custom token strategy overrides the default session-based one
    to include JWT access and refresh tokens in the login response.
    """

    def create_access_token_payload(self, request):
        """
        This method is called by allauth after a user successfully logs in.
        Its signature only includes the request.

        After a successful login, the user is attached to the request object.
        """
        # Safety check to ensure we have an authenticated user.
        if not request.user.is_authenticated:
            return None

        # Get the user from the request object.
        user = request.user

        # Create a token pair for the user using simplejwt.
        refresh = RefreshToken.for_user(request.user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Return the payload that allauth will merge into the final response.
        return {
            "access": access_token,
            "refresh": refresh_token,
            # extra compatibility keys:
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    def refresh(self, refresh_token: str):
        """
        Called by a custom refresh view (or by allauth if wired) to refresh tokens.
        Returns the same key set.
        """
        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
            new_refresh = str(refresh)  # unchanged unless you rotate

            return {
                "access": new_access,
                "refresh": new_refresh,
                "access_token": new_access,
                "refresh_token": new_refresh,
            }
        except TokenError:
            return None

    def create_session_token(self, request):
        """We don't use session tokens, so we do nothing."""
        return None

    def lookup_session(self, session_token: str):
        """We don't use sessions, so we can't look one up."""
        return None
