from django.urls import path
from .views import UserProfileDetail, ResendVerificationLinkView, CsrfTokenView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    # This creates the endpoint at /api/profile/
    path('profile/', UserProfileDetail.as_view(), name='user-profile'),
    path('resend-verification/',
         ResendVerificationLinkView.as_view(), name='resend-verification-link'),
    path('csrf-token/', CsrfTokenView.as_view(), name='api-csrf-token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
