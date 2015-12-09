from django.http import JsonResponse, HttpResponse
from django.http import HttpResponseBadRequest
from user.services import UserManager
import json

def login(request):
    if request.method != "POST":
        return HttpResponseBadRequest('Has to be POST request.')
    body_unicode = request.body.decode('utf-8')
    data = json.loads(body_unicode)
    response = {}
    try:
        username = data['username']
    except KeyError:
        response['loggedIn'] = '0'
        response['msg'] = 'request doesnt contain username'
        return JsonResponse(response)
    try:
        password = data['password']
    except KeyError:
        response['loggedIn'] = '0'
        response['msg'] = 'request doesnt contain password'
        return JsonResponse(response)
    if UserManager.login(request = request, username = username, password = password):
        response['loggedIn'] = '1'
        response['username'] = username
    else:
        response['loggedIn'] = '0'
        response['msg'] = 'login failed'
    return JsonResponse(response)

def register(request):
    if request.method != "POST":
        return HttpResponseBadRequest('Has to be POST request.')
    body_unicode = request.body.decode('utf-8')
    data = json.loads(body_unicode)
    response = {}
    try:
        username = data['username']
        passwd = data['password']
        firstname = data.get('firstname','')
        lastname = data.get('lastname','')
        email = data['email']
    except KeyError:
        response['registred'] = '0'
        response['errorMSG'] = 'request doesnt contain one of fields'
        return JsonResponse(response)
    UserManager.register(username, firstname, lastname, email, passwd)
    response['registred']= True
    return JsonResponse(response)

def logout(request):
    UserManager.logout(request)
    response = {}
    response['data'] = True
    return JsonResponse(response)

def loggedIn(request):
    response = {}
    response['username'] = UserManager.loggedIn(request)
    return JsonResponse(response)