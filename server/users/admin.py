from django.contrib import admin
<<<<<<< Updated upstream
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Register your models here.
admin.site.register(CustomUser, UserAdmin)
=======
from .models import UserProfile

admin.site.register(UserProfile)
>>>>>>> Stashed changes
