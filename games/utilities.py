"""
Some useful things that don't belong anywhere in particular
"""
import random

def chance(percent):
    """
    Get either True or False with an approximate likelihood of `percent`
    """
    return bool(round(random.random() * percent))

def init_2d_list(width, height, **kwargs):
    """
    Make a new 2D of the given dimensions
    """
    list2d = []
    initializer = kwargs.get('initializer', lambda x, y: None)
    for y in range(height):
        row = []
        for x in range(width):
            row.append(initializer(x, y))
        list2d.append(row)
    return list2d

def matrix_view(matrix, min_x, min_y, max_x, max_y):
    """
    get the items that are within (min_x, min_y) and (max_x, max_y) coordinates
    """
    view = []
    for adjacent_row in matrix[min_y : max_y]:
        row = []
        for item in adjacent_row[min_x : max_x]:
            row.append(item)
        view.append(row)
    return view

def matrix_adjacent_view(matrix, x, y, min_x=0, min_y=0):
    """
    Get a view of the matrix from (x-1, y-1) to (x+1, y+1)
    """
    return matrix_view(
        matrix,
        min_x=max(x-1, min_x),
        min_y=max(y-1, min_y),
        # 2 rather than 1 since slice is not inclusive on upper bound
        max_x=x+2,
        max_y=y+2,
    )

def matrix_iter(matrix):
    """
    Iterate through a 2d list
    """
    for row in matrix:
        for item in row:
            yield item

def matrix_adjacent_iter(*args, **kwargs):
    """
    Passes an view from `matrix_adjacent_view` to `matrix_iter`
    """
    return matrix_iter(matrix_adjacent_view(*args, **kwargs))
