from django.urls import path
from .views import UserProfileDetail, ResendVerificationLinkView

urlpatterns = [
    # This creates the endpoint at /api/profile/
    path('profile/', UserProfileDetail.as_view(), name='user-profile'),
    path('resend-verification/',
         ResendVerificationLinkView.as_view(), name='resend-verification-link'),
]
