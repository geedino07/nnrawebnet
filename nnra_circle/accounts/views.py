from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserRegistrationForm, LoginForm, OtpForm
from django.contrib.auth.models import User
from .utils import generate_otp
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

# Create your views here.

def confirmcode(request):
    form = OtpForm()
    if request.method == 'GET':
        return render(request, 'registration/confirmotp.html', {
            'form': form,
        })


def send_activation_mail(user, otpcode):
    email_subject = 'Activate your account'
    email_body = render_to_string('emails/verify-email.html', {
        'user':user, 
        'otpcode': otpcode,
        
    })

    text_content = strip_tags(email_body)
    sender = 'Nigerian Nuclear Regulatory Authority <' + str(settings.EMAIL_HOST_USER) + '>' 
    email = EmailMultiAlternatives(
        email_subject,
        text_content,
        sender,
        [user.email]
    )
    email.attach_alternative(email_body, 'text/html')
    email.send()
    return True


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
            error= False
            if cd['password'] != cd['password2']:
                messages.error(request, 'Passwords do not match')
                error=True

            #check if email already exists 
            if User.objects.filter(email=cd['email']).exists():
                messages.error(request, 'Email already exists')
                error=True

            #check if username already exists
            if User.objects.filter(username=cd['username']).exists():
                messages.error(request, 'Username already exiss')
                error=True

            if error:
                return redirect('register')
            
            #create new user account
            user = register_form.save()
            
            #create an otp for this user
            otpcode = generate_otp(user=user)

            #send user verification email
            send_activation_mail(user=user, otpcode=otpcode)

        else:
            messages.error(request, 'Kindly address the identified errors')
    else:
        register_form = UserRegistrationForm()

    return render(request, 'registration/register.html', {
        'form': register_form
    } )