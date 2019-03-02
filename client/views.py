"""
View for sending the client application
"""

from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def client(request):
    """ Always render index.html """
    return render(request, 'client/index.html')
