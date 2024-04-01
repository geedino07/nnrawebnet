import secrets
from .models import Otpcode
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.models import User

def validate_otp_code(code, type, user):
    otpcode = user.otpcode.filter(type=Otpcode.Type.PASSWORD_RESET).first()
    if otpcode and otpcode.code == code:
        if otpcode.expired:
           return None, 'The code provided has reached its expiration.'
        if otpcode.used:
            return None, 'The code has been used previously.'
        
        return otpcode, 'Code validated successfully'
    return None, 'Invalid code'
   

def user_exists(uid):
    try:
        user= User.objects.get(id=uid)
    except User.DoesNotExist:
        return None
    
    return user

def generate_otp(user, type=Otpcode.Type.AUTHENTICATION):
    Otpcode.objects.filter(user=user, type=type).delete()#deleting all existing otp codes of thesame type for this user
    code = generate_otp_code()
    otpcode = Otpcode(user=user, code=code, type=type)
    otpcode.save()
    return otpcode

def generate_otp_code():
    return str(secrets.randbelow(900000) + 100000)

def send_email(context, htmlpath, sender, subject, receiver_email):
    email_body = render_to_string(htmlpath, context)
    text_content = strip_tags(email_body)
    email = EmailMultiAlternatives(
        subject,
        text_content,
        sender,
        [receiver_email]
    )
    email.attach_alternative(email_body, 'text/html')
    email.send()
    return True

def send_password_reset_email(user, otpcode):
    email_subject = 'Reset your password'
    htmlpath = 'emails/passwordreset.html',
    sender = 'Nigerian Nuclear Regulatory Authority <' + str(settings.EMAIL_HOST_USER) + '>'
    context = {
        'user': user,
        'otpcode': otpcode
    }

    return send_email(context, htmlpath,sender,email_subject, user.email)

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

def generate_send_otp_code(user, type=Otpcode.Type.AUTHENTICATION):
    #create an otp for this user
    otpcode = generate_otp(user=user, type=type)
    
    #send user verification email
    if type == Otpcode.Type.AUTHENTICATION:
        email_sent = send_activation_mail(user=user, otpcode=otpcode)
        return email_sent
    
    if type == otpcode.Type.PASSWORD_RESET:
        email_sent = send_password_reset_email(user=user, otpcode=otpcode)
        return email_sent

def render_404(request):
    return render(request, '404page.html')

def render_error_page(request, message):
    return render(request, 'errorpage.html', {
        'message': message
    })