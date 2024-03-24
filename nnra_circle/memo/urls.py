from django.urls import path
from . import views

app_name = 'memo'


urlpatterns = [
    path('create/', views.create, name='create'), 
    path('memo/<int:mid>/', views.memo_detail, name='memo_detail')
]