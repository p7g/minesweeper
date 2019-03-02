from django.urls import re_path

from .views import client

urlpatterns = [
    re_path(r'.*', client),
]
