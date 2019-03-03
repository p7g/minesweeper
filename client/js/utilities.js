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

const severity = {
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'purple',
  5: 'maroon',
  6: 'turquoise',
  7: 'black',
  8: 'gray',
};

/* eslint-disable camelcase */

/**
 * Get the character to display in the square based on its properties
 *
 * @param {Object} square
 * @param {boolean} [square.is_revealed]
 * @param {boolean} [square.is_incorrect]
 * @param {boolean} [square.has_flag]
 * @param {boolean} [square.has_mine]
 * @param {number} [square.adjacent_mines]
 * @returns {string}
 */
export function getSquareContents({
  is_revealed,
  is_incorrect,
  has_flag,
  has_mine,
  adjacent_mines,
}) {
  let contents = '\u00A0';

  if (is_revealed) {
    if (has_mine) {
      // if the square is visible and has a mine, show an 'M'
      contents = 'M';
    } else if (adjacent_mines > 0) {
      // otherwise show how many mines are adjacent
      contents = adjacent_mines;
    }
  } else if (has_flag) {
    // if the mine has a flag, show an 'F' or an 'X' if it's incorrect
    // is_incorrect is only set when the game is over
    if (is_incorrect) {
      contents = 'X';
    } else {
      contents = 'F';
    }
  }
  return contents;
}

/**
 * Get the character to display in the square based on its properties
 *
 * @param {Object} square
 * @param {boolean} [square.is_revealed]
 * @param {boolean} [square.has_mine]
 * @param {number} [square.adjacent_mines]
 * @returns {string}
 */
export function getSquareStyles({
  is_revealed,
  has_mine,
  adjacent_mines,
}) {
  // when the square has been revealed and doesn't have a mine, make it
  // look like it has been pressed, and remove the pointer cursor
  if (is_revealed && !has_mine) {
    return {
      color: severity[adjacent_mines],
      opacity: '1',
      cursor: 'inherit',
    };
  }
  return {};
}

/**
 * Get the class for the square based on its properties
 *
 * @param {Object} square
 * @param {boolean} [square.is_revealed]
 * @param {boolean} [square.has_flag]
 * @param {boolean} [square.has_mine]
 * @returns {string}
 */
export function getSquareClass({
  is_revealed,
  has_flag,
  has_mine,
}) {
  return `
    nes-btn \
    ${has_mine ? 'is-error' : ''} \
    ${is_revealed && !has_mine ? 'is-disabled' : ''} \
    ${has_flag && !is_revealed ? 'is-warning' : ''} \
  `;
}
/* eslint-enable camelcase */

/**
 * Retry a function with exponential backoff
 *
 * @param {Function} fn The function to retry on failure
 * @param {number} [delay=250] The number of milliseconds of delay the first time
 * @param {number} [attempts=3] The number of times to retry
 * @returns {Promise}
 */
export async function retry(fn, delay = 250, attempts = 3) {
  try {
    return await fn();
  } catch (error) {
    if (attempts === 0) {
      throw error;
    }
    return new Promise((resolve, reject) => setTimeout(
      () => retry(fn, delay * 2, attempts - 1)
        .then(resolve)
        .catch(reject),
      delay,
    ));
  }
}
