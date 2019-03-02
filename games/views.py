"""
Views relating to the game
"""
import json
import random

from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from .models import Game, Grid

DEFAULT_SIZE = 20

def new_game(difficulty):
    """
    Generate a new Game object with a grid of the given difficulty
    """
    grid = Grid(width=DEFAULT_SIZE, height=DEFAULT_SIZE)

    # generate a square for every index in the grid
    for y_coordinate in range(grid.height):
        for x_coordinate in range(grid.width):
            # Chance of each square being a mine is based on difficulty
            has_mine = bool(round(random.random() * difficulty))
            grid.square_set.create(
                x=x_coordinate,
                y=y_coordinate,
                has_mine=has_mine,
            )

    grid.save()
    game = Game(difficulty=difficulty, status='O', grid=grid)
    return game

# Create your views here.
class GameIndexView(View):
    """
    Class for views on /api/game/ for HTTP method dispatching
    """

    def post(self, request):
        """
        Make a new game object and send back the ID
        """
        data = json.loads(request.body)
        game = new_game(data['difficulty'])
        return JsonResponse({'id': game.id})

class GameView(View):
    """
    Class for views on /api/game/<id> for HTTP method dispatching
    """

    def get(self, request, game_id):
        """
        Get the game with the given ID
        """
        game = get_object_or_404(Game, pk=game_id)
        return JsonResponse(game.public_data())
