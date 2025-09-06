from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from allauth.account.models import EmailConfirmation
from allauth.account.admin import EmailConfirmationAdmin

# Register your models here.
admin.site.register(CustomUser, UserAdmin)
admin.site.register(EmailConfirmation, EmailConfirmationAdmin)