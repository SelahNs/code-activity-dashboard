# users/permissions.py

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class PublicClientAuthentication(BaseAuthentication):
    """
    An authentication class that allows requests that are identified as
    coming from our own public-facing client (e.g., the frontend app)
    to bypass the standard JWT authentication.
    
    This is used for views that need to be public, like Resend Verification.
    """
    # This is a secret "password" shared between our frontend and backend.
    # It proves the request is coming from our trusted client.
    PUBLIC_CLIENT_SECRET = "a-very-secret-and-hard-to-guess-string"

    def authenticate(self, request):
        client_secret = request.headers.get('X-Client-Secret')
        if client_secret and client_secret == self.PUBLIC_CLIENT_SECRET:
            # The request is from our trusted public client.
            # Returning (None, None) signifies that authentication is not
            # required for this request, and it should be allowed to proceed.
            return (None, None)
        
        # If the header is not present or is incorrect, we don't handle it.
        # This allows other authentication classes (like JWT) to run.
        return None