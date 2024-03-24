from django.shortcuts import render
from accounts.models import Office, Profile
from django.http import JsonResponse
import json
from django.core.mail import send_mass_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Memo, MemoDocument
from django.contrib.auth.decorators import login_required


# Create your views here.

def memo_detail(request, mid):
    return JsonResponse({
        'message': 'Memo detail comming soon'
    })


def distribute_memo(memo, recipient_list, user):
    print('Initiate memo distribution')
    sender = 'Nigerian Nuclear Regulatory Authority <' + str(settings.EMAIL_HOST_USER) + '>' 
    email_body = render_to_string('emails/memo.html', {
        'sender': user,
        'memo': memo
    })
    text_content = strip_tags(email_body)

    email = EmailMultiAlternatives(
            memo.title,
            text_content,
            sender,
            recipient_list
        )
    
    email.attach_alternative(email_body, 'text/html')
    email.send()


@login_required
def create(request):
    if request.method == 'GET':
        offices = Office.objects.all()
        profiles = Profile.objects.filter(user__is_active=True).select_related('user', 'office')
        return render(request, 'memo/create.html', {
            'offices': offices,
            'user_profiles': profiles,
        })
    

    elif request.method == 'POST':
        memo_title = request.POST.get('memo-title')
        memo_body = request.POST.get('memo-body')
        memo_image = request.FILES.get('memo-image')
        files= request.FILES.getlist('files')
        audience = request.POST.get('audience')

        if audience == 'departments':
            selected_departments = json.loads(request.POST.get('selected-departments'))
            recipients_profile = Profile.objects.filter(office__id__in=selected_departments).select_related('user')
        
        if audience == 'individuals':
            selected_individuals = json.loads(request.POST.get('selected-individuals'))
            recipients_profile = Profile.objects.filter(id__in=selected_individuals).select_related('user')
        
        if audience == 'all':
            recipients_profile = Profile.objects.all().select_related('user')

        memo = Memo.objects.create(title=memo_title, body=memo_body, image=memo_image)

        for file in files:
            MemoDocument.objects.create(memo=memo, document=file, doc_name=file.name)

        recipients_emails = list(recipients_profile.values_list('user__email', flat=True))
        distribute_memo(memo, recipients_emails, request.user)

        return JsonResponse({
            'message': 'Memo distributed successfully', 
            'status': 200,
            'data': {}
        }, status=200)
    

