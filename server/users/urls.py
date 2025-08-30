from django.urls import path
from .views import UserProfileDetail

urlpatterns = [
    # This creates the endpoint at /api/profile/
    path('api/profile/', UserProfileDetail.as_view(), name='user-profile'),
]
