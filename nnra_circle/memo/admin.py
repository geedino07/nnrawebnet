from django.contrib import admin
from .models import Memo, MemoDocument

# Register your models here.
admin.site.register(Memo)
admin.site.register(MemoDocument)