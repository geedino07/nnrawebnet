from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserRegistrationForm, LoginForm, OtpForm
from django.contrib.auth.models import User
from .utils import generate_send_otp_code
from .models import Otpcode, Profile, Office
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login



# Create your views here.

def edit_profile(request, uid):
    return render(request, 'accounts/editprofile.html')


def welcome_user(request, uid):
    try:
        user = User.objects.get(id=uid)
    except User.DoesNotExist:
        user= None

    #TODO: create a 404 page and render thatt page if user is none
    return render(request, 'registration/regcomplete.html', {
        'user': user
    })


def select_dept(request, uid):
    offices = Office.objects.all()

    if request.method == 'GET':
        return render(request,'registration/select-dept.html', {
            'offices': offices,
            'uid': uid})
    elif request.method == 'POST':
        office_name = request.POST.get('office_name')
        
        #get the selected office
        try: 
            office = Office.objects.get(office_name=office_name)
        except Office.DoesNotExist:
            office = None
            return JsonResponse({
                'status': 404, 
                'message': 'Office not found'
            }, status=404)

        #Get the user
        try: 
            user = User.objects.get(id=uid)
            profile = user.profile.first()
        except User.DoesNotExist:
            user= None
            return JsonResponse({
                'status': 404, 
                'message': 'User not found'
            }, status=404)
        
        if profile:
            profile.office = office
            profile.save()
            return JsonResponse({
                'status': 200, 
                'message': 'Department set successfully'
            }, status=200)
        else:
             return JsonResponse({
                'status': 404, 
                'message': 'User profile not found'
            }, status=404)

def resend_activation_code(request, uid):
    #get the user
    try:
        user = User.objects.get(id=uid)
    except User.DoesNotExist:
        user= None

    #generate and resend an activation code for that user
    if user is not None:
        user_profile = user.profile.first()
        if user_profile is not None and user_profile.is_email_verified:
            messages.success(request, 'Your email is already verified, please login to use your account.')
            return redirect('accounts:confirmcode', uid=user.id)
        
        code_sent = generate_send_otp_code(user=user, type=Otpcode.Type.AUTHENTICATION)
        if code_sent:
            messages.success(request, f"A new verification code has been sent to {user.email}.")
        else:
            messages.error(request, 'An error occured while resending your verification code.')

        return redirect('accounts:confirmcode', uid=user.id)
    else:
        messages.error(request, 'Fatal: An error occured.')

def confirmcode(request, uid):
    #get the user with the uid
    try:
        user =User.objects.get(id=uid)
        profile = Profile.objects.get(user=user)
    except User.DoesNotExist:
        user= None
    except Profile.DoesNotExist:
        profile = None
    if request.method == 'GET':
        form = OtpForm()
    elif request.method == 'POST':
        form = OtpForm(data=request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            code= cd['code']
            otpcode = user.otpcode.filter(type= Otpcode.Type.AUTHENTICATION).first()

            #check if the users account is already verified
            if profile and profile.is_email_verified:  
                if profile.office:
                    messages.success(request, 'Your email is already verified, please login to use your account.')
                    return render(request, 'registration/confirmotp.html', {
                            'form': form,
                            'user': user
                    })
                else:
                    return redirect('accounts:selectdept', uid=user.id)


            #Validate otpcode
            if otpcode.code == code:
                #ensure otp code has not expired
                if otpcode.expired == True:
                    messages.error(request, "The code provided is expired, please reqeust a new one")
                    return render(request, 'registration/confirmotp.html', {
                            'form': form,
                            'user': user
                        })

                #Ensure otpcode has not been used
                if otpcode.used == True:
                    messages.error(request, "The code provided has been used, please request a new one")
                    return render(request, 'registration/confirmotp.html', {
                            'form': form,
                            'user': user
                        })
                
                otpcode.used = True
                otpcode.save()

                #create a user profile
                if not profile:
                    user_profile = Profile(user=user, is_email_verified=True)
                    user_profile.save()
                
                #activate the user
                user.is_active = True
                user.save()
                return redirect('accounts:selectdept', uid=user.id)
            else: 
                messages.error(request, 'Invalid code, please check the code in your mail and try again')
        else:
            messages.error('Invalid input')
        
    return render(request, 'registration/confirmotp.html', {
        'form': form,
        'user': user
    })

def user_login(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            cd = form.cleaned_data
    
            user = authenticate(request, username=cd['email'], password=cd['password'])
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return redirect('/')
                else:
                    messages.error(request, 'Your account seems to be deactivated at this moment, please seek admin support.')
            else:
                messages.error(request, 'Invalid email or password.')
        else:
            messages.error(request, 'An error occured.')
    else:
        form = LoginForm()
    return render(request, 'registration/login.html', {'form': form})

def register(request):
    if request.method == 'POST':
        register_form = UserRegistrationForm(request.POST)
    
        if register_form.is_valid():               
            cd = register_form.cleaned_data

            #create new user account
            user = register_form.save(commit=False)
            user.set_password(cd['password'])
            user.is_active = False
            user.save()

            code_sent = generate_send_otp_code(user=user, type=Otpcode.Type.AUTHENTICATION)
            if code_sent:
                return redirect('accounts:confirmcode', uid=user.id)
            else:
                messages.error(request, 'An error occured')
        else:
            messages.error(request, 'Kindly address the identified errors')
    else:
        register_form = UserRegistrationForm()

    return render(request, 'registration/register.html', {
        'form': register_form
    } )