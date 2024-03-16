from django.urls import path
from . import views

app_name='chat'

urlpatterns = [
    path('room/', views.chatroom, name='room'),
    path('getchatmessages/<int:userid>/', views.getChatMessages, name='getchatmessages'),
    path('getuserthreads/', views.getUserThreads, name='getuserthreads'),
    path('markasseen/<int:mid>/', views.mark_as_seen, name='mark_as_seen'),
    path('getthread/<int:uidone>/<int:uidtwo>/', views.get_thread, name='getthread'),
    path('getnetworkdeptthread/<int:officeid>/', views.get_department_network_thread, name='getnetworkdeptthread')
]