from django.shortcuts import render
from django.contrib import messages
from .forms import UserRegistrationForm, LoginForm
# Create your views here.

def login(request):
    if request.method == 'POST':
        messages.success(request, 'Login successful')
    login_form = LoginForm()
    return render(request, 'registration/login.html', {'form': login_form})

def register(request):
    if request.method == 'POST':
        register_form = UserRegistrationForm(request.POST)
        if register_form.is_valid():
            cd= register_form.cleaned_data
            #check if password and confirm password match

            #check if email already exists 

            #check if username already exists

            print(cd['email'])
        else:
            messages.error(request, 'Please corrrect the errors below')
    else:
        register_form = UserRegistrationForm()
    return render(request, 'registration/register.html', {
        'form': register_form
    } )