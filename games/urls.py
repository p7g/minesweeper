"""
Routes for the game API
"""

from django.urls import path

from .views import GameIndexView

app_name = 'games'
urlpatterns = [
    path('/', GameIndexView.as_view()),
]
