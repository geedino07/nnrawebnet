from django.urls import path
from . import views

app_name='chat'

urlpatterns = [
    path('room/', views.chatroom, name='room'),
    path('getchatmessages/<int:userid>/', views.getChatMessages, name='getchatmessages'),
    path('getuserthreads/', views.getUserThreads, name='getuserthreads')
]