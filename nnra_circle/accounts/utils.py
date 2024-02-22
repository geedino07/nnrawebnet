import secrets
from .models import Otpcode


def generate_otp(user):
    code = generate_otp_code()
    otpcode = Otpcode(user=user, code=code)
    otpcode.save()
    return otpcode

def generate_otp_code():
    return str(secrets.randbelow(900000) + 100000)
