from django.shortcuts import render, redirect
from accounts.models import Profile
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Thread, ChatMessage
from django.contrib.auth.models import User
from accounts.serializers import ProfileSerializer
from .serializers import ChatMessageSerializer, ThreadSerializer
from django.db.models import Q
from accounts.views import get_people_may_know
from django.views.decorators.http import require_POST
#TEst for ubuntu server 


# Create your views here.

@require_POST 
def delete_message(request, msgid):
    try:
        chat_message = ChatMessage.objects.get(id=msgid)
    except ChatMessage.DoesNotExist:
        return JsonResponse({
            'message': 'Message does not exist',
            'data': {},
            'status': 404
        }, status=404)

    chat_message.deleted = True
    chat_message.message = ''
    chat_message.save()
    return JsonResponse({
        'message': 'Message deleted successfully', 
        'data': {},
        'status': 200
    }, status=200)

@require_POST
def edit_message(request, msgid):
    try:
        chat_message = ChatMessage.objects.get(id=msgid)
    except ChatMessage.DoesNotExist:
        return JsonResponse({
            'message': 'Message does not exist',
            'data': {},
            'status': 404
        }, status=404)


    new_message_body = request.POST.get('message')
    chat_message.message = new_message_body
    chat_message.save()

    return JsonResponse({
        'message': 'Message Edited successfully', 
        'data': {},
        'status': 200
    }, status=200)


@login_required
def mark_as_seen(request, mid):
    try:
        message = ChatMessage.objects.get(id=mid)
    except ChatMessage.DoesNotExist:
        return JsonResponse({
            'status': 404,
            'message': 'message not found',
            'data': {}
        }, status=404)
    
    if request.user is not message.receiver:
        if not message.seen: 
            message.seen = True
            message.save()

        return JsonResponse({
            'message': 'success',
            'status': 200,
            'data': {}
        }, status=200)
    else: 
        return JsonResponse({
            'status': 404, 
            'message': 'User is not allowed to see this message',
            'data': {}
        }, status=404)        

@login_required(login_url='accounts:login')
def chatroom(request):  
    chat_user_id = request.GET.get('chat')
    user = request.user
    user_threads = Thread.threadm.by_user(user=user)

    user_unseen_thread_ids = ChatMessage.objects.filter(receiver=user, seen=False).values_list('thread__id', flat=True)
    user_unseen_thread_count = Thread.objects.filter(id__in= user_unseen_thread_ids).count()

    if not user_threads and not chat_user_id:
        return redirect('accounts:networkprompt')
    

    profile = Profile.objects.filter(user=user).select_related('user', 'office').first()
    people_may_know = get_people_may_know(profile, required_number=4)

    return render(request, 'chat/room.html', {
        'profile': profile,
        'unseen_thread_count': user_unseen_thread_count,
        'people_may_know': people_may_know
        # 'chat_user': chat_user,
    })
    
@login_required
def get_thread(request, uidone, uidtwo):
    """
    Gets a thread instance associated with the two specified users
    """
    thread = Thread.threadm.get_thread(uidone, uidtwo)
    if thread:
        thread_data = ThreadSerializer(thread).data
        return JsonResponse({
            'message': 'success',
            'status': 200,
            'data': {
                'thread': thread_data
            }
        }, status=200)
    else:
        return JsonResponse({
            'message': 'thread not found',
            'status': 404,
            'data': {}
        }, status=404)

@require_POST
def get_department_network_thread(request, officeid):
    user = request.user
    subone = Q(user_one__id = user.id) & Q(user_one__profile__office__id=officeid)
    subtwo = Q(user_two__id = user.id) & Q(user_two__profile__office__id=officeid)

    lookup_two = Q(user_one__profile__office__id=officeid) |  Q(user_two__profile__office__id=officeid)
    user_threads = ThreadSerializer(Thread.threadm.by_user(user=user).filter(lookup_two).exclude(subone | subtwo), many=True)
    return JsonResponse({
        'status': 200, 
        'message': 'success',
        'data': {
            'user_threads': user_threads.data
        }
    })
    

def getUserThreads(request):
    """
    gets all the threads for the user that is currently logged in
    """
    if request.method == 'POST':
        user = request.user
        
        user_threads = ThreadSerializer(Thread.threadm.by_user(user=user), many=True)
        return JsonResponse({
            'status': 200, 
            'message': 'success',
            'data': {
                'user_threads': user_threads.data
            }
        })

    return JsonResponse({
        'status': 405,
        'message': 'method not allowed', 
        'data': {}
    })

@login_required
def getChatMessages(request, userid):
    user = request.user

    try: 
        chat_user = Profile.objects.select_related('user').get(user__id=userid)
    except User.DoesNotExist:
        return JsonResponse({
            'message': 'failed',
            'status': 404,
            'data': {}
        })

    lookup_one = Q(sender=user, receiver=chat_user.user)
    lookup_two = Q(sender=chat_user.user, receiver=user)
    chat_messages = ChatMessage.objects.filter(lookup_one | lookup_two).order_by('created')
    chats_serializer = ChatMessageSerializer(chat_messages, many=True)
    return JsonResponse({
        'message': 'success',
        'status': 200,
        'data': {
            'chat_user': ProfileSerializer(chat_user).data,
            'chat_messages': chats_serializer.data
        }
    })