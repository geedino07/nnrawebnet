from . import views
from django.contrib.auth import views as auth_views
from django.urls import path


app_name = 'accounts'
urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('confirmcode/', views.confirmcode, name='confirmcode')
]