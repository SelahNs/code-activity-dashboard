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
        refresh = RefreshToken.for_user(user)

        # Return the payload that allauth will merge into the final response.
        return {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        }

    def create_session_token(self, request):
        """We don't use session tokens, so we do nothing."""
        return None

    def lookup_session(self, session_token: str):
        """We don't use sessions, so we can't look one up."""
        return None
