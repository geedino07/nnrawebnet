from . import views
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name='circle'
urlpatterns=[
    path('', views.home, name='home')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
