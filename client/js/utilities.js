let cookies = null;
/**
 * Get a cookie
 *
 * @param {string} name The name of the cookie to get
 * @returns {string} The value of the cookie
 */
export function getCookie(name) { // eslint-disable-line import/prefer-default-export
  // lazily get cookies
  if (cookies === null) {
    cookies = {};
    document.cookie
      .split(/;\s*/)
      .map(s => s.split('=').map(decodeURIComponent))
      .forEach(([key, value]) => { cookies[key] = value; });
  }
  return cookies[name];
}

/**
 * Convert a 1D array of squares into a 2D grid
 *
 * @param {Object[]} squares A 1D array of square objects
 * @param {number} width The width of the board
 * @param {number} height The height of the board
 * @returns {Object[][]}
 */
export function to2D(squares, width, height) {
  const grid = Array.from({ length: height }, () => Array.from({ length: width }));

  squares.forEach((square) => {
    const { x, y } = square;

    grid[y][x] = square;
  });

  return grid;
}
