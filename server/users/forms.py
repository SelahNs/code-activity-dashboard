from django import forms


class CustomSignupAddonForm(forms.Form):
    """
    This is an add-on form for the signup process, as documented by
    the ACCOUNT_SIGNUP_FORM_CLASS setting. It handles any fields
    beyond what the default allauth form handles.
    """
    fullName = forms.CharField(max_length=255, required=True)

    def signup(self, request, user):
        """
        This method is called after the user is created by the main form.
        We are passed the new user instance and can now save our
        additional data to it.
        """
        user.full_name = self.cleaned_data['fullName']
        user.save()
        return user
