"""
Views relating to the game
"""
import json

from django.views import View
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404

from .models import Game, Grid, Square
from .utilities import (
    chance,
    init_2d_list,
    matrix_adjacent_iter,
    matrix_iter,
    matrix_view,
)

DEFAULT_SIZE = 15

def new_game(difficulty):
    """
    Generate a new Game object with a grid of the given difficulty
    """
    grid = Grid.objects.create(width=DEFAULT_SIZE, height=DEFAULT_SIZE)

    # make a grid of squares with random mines
    squares = init_2d_list(
        width=grid.width,
        height=grid.height,
        initializer=lambda x, y: Square(
            x=x,
            y=y,
            has_mine=chance(difficulty),
            grid=grid,
        ),
    )

    for square in matrix_iter(squares): # sum the mines in each direction
        x = square.x
        y = square.y
        total = 0

        for adjacent_square in matrix_adjacent_iter(squares, x, y):
            if adjacent_square == square:
                continue
            if adjacent_square.has_mine:
                total += 1
        square.adjacent_mines = total

    # flatten grid of squares into bulk create
    grid.square_set.bulk_create(square for row in squares for square in row)

    return Game.objects.create(difficulty=difficulty, status='O', grid=grid)

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

    def post(self, request, square_id):
        """
        Reveal a square. Returns a result object, which is either success with
        the revealed squares and game status, or failure (from a mine)
        """
        square = get_object_or_404(Square, pk=square_id)

        result = ''
        data = None
        square.is_revealed = True
        square.save()

        if square.has_mine:
            result = 'fail'

            # end the game
            square.grid.game.update_status('L')

            mines = square.grid.square_set.filter(has_mine=True)
            mines.update(is_revealed=True)
            data = {
                'square': square.public_data(),
                'mines': [mine.public_data() for mine in mines],
            }
        else:
            result = 'success'
            grid = square.grid.get_all_2d()
            revealed = [square.public_data()] # store public data for sending to client
            to_reveal = [] # store IDs of squares to reveal in bulk at the end
            seen_squares = [] # maintain list of seen squares to prevent infinite recursion

            # maintain a queue of blocks to avoid actual recursion
            queue = [square]
            while queue:
                # get the next square from the list
                current = queue.pop()

                if current.adjacent_mines != 0:
                    continue

                # for each of the squares which are adjacent,
                # reveal if there is no mine, and recurse if no adjacent mines
                y = current.y
                x = current.x
                for adjacent_square in matrix_adjacent_iter(grid, x, y):
                    seen = adjacent_square in seen_squares
                    if not adjacent_square.has_mine and not seen:
                        adjacent_square.is_revealed = True
                        revealed.append(adjacent_square.public_data())
                        to_reveal.append(adjacent_square.id)

                    if adjacent_square.adjacent_mines == 0:
                        if not seen:
                            seen_squares.append(adjacent_square)
                            queue.append(adjacent_square)

            # modify the database in one query
            Square.objects.filter(pk__in=to_reveal).update(is_revealed=True)

            # check if game is won (no unrevealed squares without mine)
            if not square.grid.square_set.filter(has_mine=False, is_revealed=False).exists():
                square.grid.game.update_status('W')

            data = {
                'revealed': revealed,
                'game_status': square.grid.game.status,
            }

        return JsonResponse({
            'result': result,
            'data': data,
        })
