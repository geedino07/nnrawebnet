from django.shortcuts import render
from accounts.models import Office, Profile
from django.http import JsonResponse
import json
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Memo, MemoDocument, RecipientType, MemoRecipient
from django.contrib.auth.decorators import login_required
from django.contrib.sites.shortcuts import get_current_site
from django.db.models import Q




# Create your views here.

@login_required
def memo_list(request):
    user = request.user
    print(user)
    try:
        profile = Profile.objects.select_related('office').get(user__id=user.id)
    except Profile.DoesNotExist:
        return JsonResponse({
            'message': 'Profile not found', 
            'status': 404, 
            'data': {}
        })
    
    lookup_one = Q(rec_type=RecipientType.DEPARTMENT) & Q(recipient_id=profile.office.id)
    lookup_two = Q(rec_type=RecipientType.INDIVIDUAL) & Q(recipient_id=user.id)
    lookup_three = Q(rec_type=RecipientType.ALL)
    memos = MemoRecipient.objects.filter(lookup_one | lookup_two | lookup_three).select_related('memo')

    return render(request, 'memo/list.html', {
        'recipients': memos
    })

def memo_detail(request, mid):
    return JsonResponse({
        'message': 'Memo detail comming soon'
    })


def distribute_memo(memo, recipient_list, user, request=None):
    domain = get_current_site(request)    
    sender = 'Nigerian Nuclear Regulatory Authority <' + str(settings.EMAIL_HOST_USER) + '>' 
    email_body = render_to_string('emails/memo.html', {
        'sender': user,
        'memo': memo,
        'domain': domain

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

def create_memo(title, body, image, rec_type, sender):
    if image:
        memo = Memo.objects.create(title=title, body=body, image=image, rec_type=rec_type, sender=sender)
    else:
        memo = Memo.objects.create(title=title, body=body, rec_type=rec_type, sender=sender)

    return memo


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

        sender_profile = Profile.objects.get(user=request.user)
        if audience == 'departments':
            memo = create_memo(title=memo_title, body=memo_body, image=memo_image, rec_type=RecipientType.DEPARTMENT, sender=sender_profile)
            selected_departments = json.loads(request.POST.get('selected-departments'))
            recipients_profile = Profile.objects.filter(office__id__in=selected_departments).select_related('user')
            for department in selected_departments:
                MemoRecipient.objects.create(memo=memo, rec_type=RecipientType.DEPARTMENT, recipient_id=department)
        
        if audience == 'individuals':
            memo = create_memo(title=memo_title, body=memo_body, image=memo_image, rec_type=RecipientType.INDIVIDUAL, sender=sender_profile)

            selected_individuals = json.loads(request.POST.get('selected-individuals'))
            recipients_profile = Profile.objects.filter(id__in=selected_individuals).select_related('user')
            for profile  in recipients_profile:
                MemoRecipient.objects.create(memo=memo, rec_type=RecipientType.INDIVIDUAL, recipient_id=profile.user.id)
        
        if audience == 'all':
            memo = create_memo(title=memo_title, body=memo_body, image=memo_image, rec_type=RecipientType.ALL, sender=sender_profile)
            recipients_profile = Profile.objects.all().select_related('user')
            MemoRecipient.objects.create(memo=memo, rec_type=RecipientType.ALL)

        for file in files:
            MemoDocument.objects.create(memo=memo, document=file, doc_name=file.name)

        recipients_emails = list(recipients_profile.values_list('user__email', flat=True))
        distribute_memo(memo, recipients_emails, request.user, request)

        return JsonResponse({
            'message': 'Memo distributed successfully', 
            'status': 200,
            'data': {
                'url': memo.get_absolute_url()
            }
        }, status=200)
    

def test(): 
    pass