from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class OtpForm(forms.Form):
    code = forms.CharField(widget=forms.TextInput({'placeholder': 'Enter your six digit code'}))

class LoginForm(forms.Form):
    email = forms.CharField(widget=forms.EmailInput({'placeholder': 'Email'}))
    password = forms.CharField(widget=forms.PasswordInput({'placeholder': 'Password'}))
class SignUpForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Username'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'placeholder': 'Email'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    confirm_password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Confirm password'}))

class ResetPasswordForm(forms.Form):
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    repeat_password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Repeat password'}))

    def clean_repeat_password(self):
        cd = self.cleaned_data
        print(cd)
        if cd['password'] != cd['repeat_password']:
            raise forms.ValidationError('Passwords do not match')
        return cd['password']

    
class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Confirm password'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        widgets = {
            'username': forms.TextInput(attrs={'placeholder': 'Username'}),
            'email': forms.EmailInput(attrs={'placeholder': 'Email'}),
            'first_name': forms.TextInput(attrs={'placeholder': 'First name'}),
            'last_name': forms.TextInput(attrs={'placeholder': 'Last name'}),
        }

        help_texts = {
            'username': None
        }

    def clean_password2(self):
        cd = self.cleaned_data
        if cd['password'] != cd['password2']:
            raise forms.ValidationError('Passwords do not match')
        return cd['password2']
    
    def clean_email(self):
        cd= self.cleaned_data
        if User.objects.filter(email= cd['email']).exists():
            raise forms.ValidationError('Email is already in use')
        return cd['email']
    
    def clean_username(self):
        cd = self.cleaned_data
        if User.objects.filter(username=cd['username']).exists():
            raise forms.ValidationError('Username already exists')
        return cd['username']
