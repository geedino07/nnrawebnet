from django.shortcuts import render
from django.contrib import messages
# Create your views here.
def register(request):
    messages.error(request, "Fields could not be validated")
    return render(request, 'registration/register.html')