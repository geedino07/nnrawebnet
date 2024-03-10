from django.shortcuts import render, redirect
from accounts.models import Profile
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Thread, ChatMessage
from django.contrib.auth.models import User
from accounts.serializers import ProfileSerializer
from .serializers import ChatMessageSerializer, ThreadSerializer
from django.db.models import Q, OuterRef, Subquery, Max, F
from django.db import models

# Create your views here.



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

    return render(request, 'chat/room.html', {
        'profile': profile,
        'unseen_thread_count': user_unseen_thread_count
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