"""
Models needed for a game of minesweeper
"""

from django.db import models

from .utilities import (
    chance,
    init_2d_list,
    matrix_adjacent_iter,
    matrix_iter,
)

class Grid(models.Model):
    """
    A grid of squares, each of which may or may not have a mine
    """
    width = models.PositiveIntegerField(default=20)
    height = models.PositiveIntegerField(default=20)

    def get_all_2d(self):
        """
        Get all square in the grid as a 2D array
        """
        squares = self.square_set.all()
        grid = [[None for x in range(self.width)] for y in range(self.height)]
        for square in squares:
            grid[square.y][square.x] = square
        return grid

    def reveal_squares(self, clicked_square):
        """
        Reveal the given square, and recursively any blank squares
        """
        all_squares = self.get_all_2d()
        revealed = [clicked_square]
        seen_squares = [] # maintain list of seen squares to prevent infinite recursion

        # maintain a queue of blocks to avoid actual recursion
        queue = [clicked_square]
        while queue:
            current = queue.pop() # get the next square from the list

            # if this isn't a blank tile, we shouldn't reveal its neighbours
            if current.adjacent_mines != 0:
                continue

            # for each of the squares which are adjacent,
            # reveal if there is no mine, and recurse if no adjacent mines
            for adjacent_square in matrix_adjacent_iter(all_squares, current.x, current.y):
                # don't process a square more than once
                if adjacent_square in seen_squares:
                    continue

                if not adjacent_square.has_mine:
                    adjacent_square.is_revealed = True
                    revealed.append(adjacent_square)

                if adjacent_square.adjacent_mines == 0:
                    seen_squares.append(adjacent_square)
                    queue.append(adjacent_square)

        # update all of the revealed squares at once
        revealed_ids = [square.id for square in revealed]
        self.square_set.filter(pk__in=revealed_ids).update(is_revealed=True)
        return revealed

    def mine_count(self):
        """
        Get the apparent number of mines still on the playing field
        """
        num_mines = self.square_set.filter(has_mine=True).count()
        num_flags = self.square_set.filter(has_flag=True).count()
        return max(num_mines - num_flags, 0)

    def public_data(self):
        """
        Get the fields that should be sent to the client
        """
        return {
            'id': self.id,
            'width': self.width,
            'height': self.height,
            'squares': [s.public_data() for s in self.square_set.all()],
            'mine_count': self.mine_count(),
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

    def reveal(self):
        """
        Reveal the current square and save
        """
        self.is_revealed = True
        self.save()

    def reveal_neighbours(self):
        """
        Reveal any neighbouring squares if they should be revealed
        """
        return self.grid.reveal_squares(self)

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
    DEFAULT_SIZE = 15

    STATUSES = (
        ('W', 'Won'),
        ('L', 'Lost'),
        ('O', 'Ongoing'),
    )

    status = models.CharField(max_length=1, choices=STATUSES)
    difficulty = models.FloatField(help_text='Chance of each square to be a mine')
    grid = models.OneToOneField(Grid, on_delete=models.CASCADE)

    def is_won(self):
        """
        Check if this game has been won (all squares without mines have been revealed)
        """
        return not self.grid.square_set.filter(has_mine=False, is_revealed=False).exists()

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

    @classmethod
    def new(cls, difficulty):
        """
        Generate a new Game object with a grid of the given difficulty
        """
        grid = Grid.objects.create(width=cls.DEFAULT_SIZE, height=cls.DEFAULT_SIZE)

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

        # calculate the number of adjacent mines for each square
        for square in matrix_iter(squares):
            total = 0

            for adjacent_square in matrix_adjacent_iter(squares, square.x, square.y):
                if adjacent_square == square:
                    continue
                if adjacent_square.has_mine:
                    total += 1
            square.adjacent_mines = total

        # flatten grid of squares into bulk create
        grid.square_set.bulk_create(square for row in squares for square in row)

        return Game.objects.create(difficulty=difficulty, status='O', grid=grid)
