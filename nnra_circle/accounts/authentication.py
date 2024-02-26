from django.contrib.auth.models import User
from django.contrib.auth.backends import BaseBackend


class EmailBackend(BaseBackend):
    """
    Authenticate using email 
    An authentication backend is a class with provides two classes, authenticate and getuser

    #get ther user
    #check the password
    #if password matches, return user, else return none
    """
    def authenticate(self, request, username=None, password=None):
        try: 
            user = User.objects.get(email=username)
            if user.check_password(password):
                return user
            return None
        except(User.DoesNotExist, User.MultipleObjectsReturned):
            print('error occured')
            return None
    

    def get_user(self, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            user = None
        return user