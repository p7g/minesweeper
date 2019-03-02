"""
Models needed for a game of minesweeper
"""

from django.db import models

# Create your models here.

class Grid(models.Model):
    """
    A grid of squares, each of which may or may not have a mine
    """
    width = models.PositiveIntegerField(default=20)
    height = models.PositiveIntegerField(default=20)

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        return {
            'width': self.width,
            'height': self.height,
            'squares': [s.public_data() for s in self.square_set],
        }

class Square(models.Model):
    """
    A single square in a grid, which may or may not have a mine
    """
    x = models.PositiveIntegerField()
    y = models.PositiveIntegerField()
    has_mine = models.BooleanField()

    grid = models.ForeignKey(Grid, on_delete=models.CASCADE)

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        return {
            'x': self.x,
            'y': self.y,
        }

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
    grid = models.ForeignKey(Grid, on_delete=models.CASCADE)

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        return {
            'status': self.status,
            'difficulty': self.difficulty,
            'grid': self.grid.public_data(),
        }
