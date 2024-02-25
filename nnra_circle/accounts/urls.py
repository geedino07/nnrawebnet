from . import views
from django.contrib.auth import views as auth_views
from django.urls import path
from .departments import seed_departments,seed_offices


app_name = 'accounts'
urlpatterns = [
    path('confirmcode/<int:uid>/', views.confirmcode, name='confirmcode'),
    path('resendcode/<int:uid>/', views.resend_activation_code, name='resendcode'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('selectdept/<int:uid>/', views.select_dept, name='selectdept'),
    path('welcomeuser/<int:uid>/', views.welcome_user, name='welcomeuser')
    # path('seed/department/', seed_departments, name='seeddartments'),
    # path('seed/offices/', seed_offices, name='seedoffices')
]