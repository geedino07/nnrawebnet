import secrets
from .models import Otpcode
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import render

def generate_otp(user, type=Otpcode.Type.AUTHENTICATION):
    Otpcode.objects.filter(user=user, type=type).delete()#deleting all existing otp codes of thesame type for this user
    code = generate_otp_code()
    otpcode = Otpcode(user=user, code=code, type=type)
    otpcode.save()
    return otpcode

def generate_otp_code():
    return str(secrets.randbelow(900000) + 100000)


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
    email_sent = send_activation_mail(user=user, otpcode=otpcode)
    return email_sent

def render_404(request):
    return render(request, '404page.html')