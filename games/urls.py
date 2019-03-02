"""
Routes for the game API
"""

from django.urls import path

from .views import GameIndexView, GameView, SquareFlagView, SquareRevealView

app_name = 'games'
urlpatterns = [
    path('games/<int:game_id>', GameView.as_view()),
    path('games', GameIndexView.as_view()),
    path('squares/<int:square_id>/flag', SquareFlagView.as_view()),
    path('squares/<int:square_id>/reveal', SquareRevealView.as_view()),
]
