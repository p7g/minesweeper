"""
Views relating to the game
"""
import json
import random

from django.views import View
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404

from .models import Game, Grid, Square

DEFAULT_SIZE = 20

def new_game(difficulty):
    """
    Generate a new Game object with a grid of the given difficulty
    """
    grid = Grid.objects.create(width=DEFAULT_SIZE, height=DEFAULT_SIZE)

    squares = []
    # generate a square for every index in the grid
    for y_coordinate in range(grid.height):
        for x_coordinate in range(grid.width):
            # Chance of each square being a mine is based on difficulty
            has_mine = bool(round(random.random() * difficulty))
            squares.append(Square(
                x=x_coordinate,
                y=y_coordinate,
                has_mine=has_mine,
                grid=grid,
            ))
    grid.square_set.bulk_create(squares)

    game = Game.objects.create(difficulty=difficulty, status='O', grid=grid)
    return game

# Create your views here.
class GameIndexView(View):
    """
    Class for views on /api/games/ for HTTP method dispatching
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
    Class for views on /api/games/<id> for HTTP method dispatching
    """

    def get(self, request, game_id):
        """
        Get the game with the given ID
        """
        game = get_object_or_404(Game, pk=game_id)
        return JsonResponse(game.public_data())

class SquareFlagView(View):
    """
    Class for views on /api/squares/<id>/flag
    """

    def post(self, request, square_id):
        """
        Add a flag to the square
        """
        square = get_object_or_404(Square, pk=square_id)
        square.has_flag = True
        square.save()
        return HttpResponse()

    def delete(self, request, square_id):
        """
        Remove the flag from a square
        """
        square = get_object_or_404(Square, pk=square_id)
        square.has_flag = False
        square.save()
        return HttpResponse()

class SquareRevealView(View):
    """
    Class for views on /api/squares/<id>/reveal
    """

    def post(self, request, square_id): # FIXME: keep track of seen squares to avoid infinite recursion
        """
        Reveal a square. Returns a result object, which is either success with
        the revealed squares and game status, or failure (from a mine)
        """
        square = get_object_or_404(Square, pk=square_id)

        result = ''
        data = None
        if square.has_mine:
            result = 'fail'
            square.is_revealed = True
            square.save()

            # end game
            square.grid.game.status = 'L'
            square.grid.game.save()
        else:
            result = 'success'
            grid = square.grid
            revealed = []
            squares = [square]

            while squares:
                # get the next square from the list
                current = squares.pop()

                # for each of the squares which are adjacent,
                # reveal if there is no mine, and recurse if no adjacent mines
                for adjacent_square in grid.get_squares_adjacent_to(current):
                    if not adjacent_square.has_mine:
                        adjacent_square.is_revealed = True
                        adjacent_square.save()
                        revealed.append(adjacent_square.public_data())

                    if adjacent_square.adjacent_mines() == 0:
                        squares.append(adjacent_square)

            # check if game is won (no unrevealed squares without mine)
            if not grid.square_set.filter(has_mine=False, is_revealed=False):
                grid.game.status = 'W'
                grid.game.save()

            data = {
                'revealed': revealed,
                'game_state': grid.game.state,
            }

        return JsonResponse({
            'result': result,
            'data': data,
        })
