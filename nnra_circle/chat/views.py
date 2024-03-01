from django.shortcuts import render, redirect
from accounts.models import Profile
from django.contrib.auth.decorators import login_required
from .models import Thread

# Create your views here.
@login_required(login_url='accounts:login')
def chatroom(request):  
    chat_user_id = request.GET.get('chat')
    user = request.user
    user_threads = Thread.theadm.by_user(user=user)

    if not user_threads and not chat_user_id:
        return redirect('accounts:networkprompt')
    

    profile = Profile.objects.filter(user=user).select_related('user', 'office').first()

    if chat_user_id:
        chat_user = Profile.objects.filter(user__id=chat_user_id).select_related('user').first()

    #get the threads of the user who is currently logged in 
    if user_threads:#user has previous chats
        #TODO: set chat_use here as the thread where the most recent chat message came from 
        chat_user = Profile.objects.filter(user__id=chat_user_id).select_related('user').first()

    return render(request, 'chat/room.html', {
        'profile': profile,
        'chat_user': chat_user,
        'user_threads': user_threads
    
    })
    
    
