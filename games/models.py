"""
Models needed for a game of minesweeper
"""

from django.db import models
from django.db.models import Q

class Grid(models.Model):
    """
    A grid of squares, each of which may or may not have a mine
    """
    width = models.PositiveIntegerField(default=20)
    height = models.PositiveIntegerField(default=20)

    def get_squares_adjacent_to(self, square, **kwargs):
        """
        Get all squares adjacent to the one given
        """
        return self.square_set.filter(
            (Q( # horizontally adjacent
                x__in=(square.x+1, square.x-1),
                y=square.y,
            ) | Q( # vertically adjacent
                y__in=(square.y+1, square.y-1),
                x=square.x,
            ) | Q( # diagonally adjacent
                x__in=(square.x+1, square.x-1),
                y__in=(square.y+1, square.y-1),
            )) & Q(**kwargs)
        )

    def get_all_2d(self):
        """
        Get all square in the grid as a 2D array
        """
        squares = self.square_set.all()
        grid = [[None for x in range(self.width)] for y in range(self.height)]
        for square in squares:
            x = square.x
            y = square.y
            grid[y][x] = square
        return grid

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        return {
            'id': self.id,
            'width': self.width,
            'height': self.height,
            'squares': [s.public_data() for s in self.square_set.all()],
        }

class Square(models.Model):
    """
    A single square in a grid, which may or may not have a mine
    """
    x = models.PositiveIntegerField()
    y = models.PositiveIntegerField()
    has_mine = models.BooleanField()
    has_flag = models.BooleanField(default=False)
    is_revealed = models.BooleanField(default=False)
    adjacent_mines = models.SmallIntegerField(default=0)

    grid = models.ForeignKey(Grid, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('x', 'y', 'grid'),)

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        data = {
            'id': self.id,
            'x': self.x,
            'y': self.y,
            'is_revealed': self.is_revealed,
        }

        # add adjacent_mines/has_flag only if relevant
        if self.is_revealed:
            data['has_mine'] = self.has_mine
            data['adjacent_mines'] = self.adjacent_mines
        else:
            data['has_flag'] = self.has_flag
        return data

class Game(models.Model):
    """
    The root Game object, containing the current status, the selected
    difficulty, and the minefield
    """
    STATUSES = (
        ('W', 'Won'),
        ('L', 'Lost'),
        ('O', 'Ongoing'),
    )

    status = models.CharField(max_length=1, choices=STATUSES)
    difficulty = models.FloatField(help_text='Chance of each square to be a mine')
    grid = models.OneToOneField(Grid, on_delete=models.CASCADE)

    def update_status(self, new_status):
        """
        Change the status to the given value and save it
        """
        self.status = new_status
        self.save()

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        return {
            'id': self.id,
            'status': self.status,
            'difficulty': self.difficulty,
            'grid': self.grid.public_data(),
        }
