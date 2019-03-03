"""
Views relating to the game
"""
import json

from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from .models import Game, Square


class GameIndexView(View):
    """
    Class for views on /api/games/ for HTTP method dispatching
    """

    def post(self, request):
        """
        Make a new game object and send back the ID
        """
        data = json.loads(request.body)
        game = Game.new(data['difficulty'])
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
        return JsonResponse({
            'mine_count': square.grid.mine_count(),
        })

    def delete(self, request, square_id):
        """
        Remove the flag from a square
        """
        square = get_object_or_404(Square, pk=square_id)
        square.has_flag = False
        square.save()
        return JsonResponse({
            'mine_count': square.grid.mine_count(),
        })

class SquareRevealView(View):
    """
    Class for views on /api/squares/<id>/reveal
    """

    def post(self, request, square_id):
        """
        Reveal a square. Returns a result object, which is either success with
        the revealed squares and game status, or failure (from a mine)
        """
        clicked_square = get_object_or_404(Square, pk=square_id)
        grid = clicked_square.grid
        game = grid.game

        clicked_square.reveal()

        data = None
        if clicked_square.has_mine:
            # end the game
            game.update_status('L')

            incorrect_flags = grid.square_set.filter(has_mine=False, has_flag=True)
            unflagged_mines = grid.square_set.filter(has_mine=True, has_flag=False)
            unflagged_mines.update(is_revealed=True)

            data = {
                'incorrect_flags': [flag.public_data() for flag in incorrect_flags],
                'unflagged_mines': [mine.public_data() for mine in unflagged_mines],
                'mine_count': grid.mine_count(),
            }
        else:
            revealed = clicked_square.reveal_neighbours()

            # check if game is won (no unrevealed squares without mine)
            if game.is_won():
                game.update_status('W')

            data = {
                'revealed': [square.public_data() for square in revealed],
                'game_status': game.status,
                'mine_count': grid.mine_count(),
            }

        return JsonResponse({
            'result': 'fail' if clicked_square.has_mine else 'success',
            'data': data,
        })
