from django.db import models

# Create your models here.

class Memo(models.Model):
    title = models.CharField(max_length =250, null=False, blank=False)
    body = models.TextField()
    image = models.ImageField(upload_to='memoimage/%Y/%M/%d', default='def-memo-img.png')
    
class MemoDocument(models.Model):
    memo = models.ForeignKey(Memo, on_delete=models.CASCADE, null=False, blank=False)
    document = models.FileField(upload_to='memodoc/%Y/%M/%d', blank=False, null=False)
    doc_name = models.CharField(max_length=250, null=False, blank=False, default='')

