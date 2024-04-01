from django.db import models
from django.urls import reverse
from accounts.models import Profile
# Create your models here.

class RecipientType(models.TextChoices):
    INDIVIDUAL = 'ID', 'Individual'
    ALL = 'AL', 'All'
    DEPARTMENT = 'DP', 'Department'

class Memo(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length =250, null=False, blank=False)
    body = models.TextField()
    image = models.ImageField(upload_to='memoimage/%Y/%M/%d', default='def-memo-img.png')
    rec_type = models.CharField(max_length=2, null=False, blank=False, choices =RecipientType.choices, default=RecipientType.ALL)
    created = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def get_absolute_url(self):
        return reverse('memo:detail', args=[self.id])
    
    def get_formated_date(self):
        return self.created.strftime('%b %d, %Y %I:%M%p')

    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created'])
        ]

class MemoDocument(models.Model):
    memo = models.ForeignKey(Memo, on_delete=models.CASCADE, null=False, blank=False, related_name='documents')
    document = models.FileField(upload_to='memodoc/%Y/%M/%d', blank=False, null=False)
    doc_name = models.CharField(max_length=250, null=False, blank=False, default='')

    def get_fill_size_mb(self):
        file_size_bytes = self.document.size
        file_size_mb = file_size_bytes / (1024*1024)
        if file_size_mb >= 1:
            return "{:.2f}".format(file_size_mb) + 'MB'
        else:
            file_size_kb = file_size_bytes /1024
            return "{:.2f}".format(file_size_kb) + "KB"
        

class MemoRecipient(models.Model):
    memo = models.ForeignKey(Memo, on_delete=models.CASCADE, null=False, blank=False)
    rec_type = models.CharField(max_length=2, null=False, blank=False, choices =RecipientType.choices, default=RecipientType.ALL)
    recipient_id = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-memo__created']