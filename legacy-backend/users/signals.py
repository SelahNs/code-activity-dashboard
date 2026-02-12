from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()


@receiver(user_signed_up)
def create_user_profile_on_signup(sender, request, user, **kwargs):
    """
    Listens for the user_signed_up signal from django-allauth and
    creates a UserProfile for the new user.

    We use get_or_create to make the function idempotent, meaning
    it can be run multiple times without causing an error.
    """
    UserProfile.objects.get_or_create(user=user)
