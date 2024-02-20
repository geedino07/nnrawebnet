from django.urls import path
from . import views

app_name='chat'

urlpatterns = [
    path('room/', views.chatroom, name='room')
]