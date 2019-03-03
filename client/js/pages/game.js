/* eslint-disable camelcase */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';

import Square from '../components/square';
import {
  to2D,
  getCookie,
  retry,
  request,
} from '../utilities';

// headers needed to make a post request with a JSON payload
const csrfJsonHeaders = {
  'X-CSRFToken': getCookie('csrftoken'),
  'Content-Type': 'appication/json',
};

/**
 * The Game component, which generates the board and handles input
 */
export default function Game({ match }) { // eslint-disable-line react/prop-types
  const { id } = match.params;
  const [loading, setLoading] = useState(true);
  const [{ width }, setGrid] = useState({});
  const [mineCount, setMineCount] = useState(0);
  const [status, setStatus] = useState('');
  const [squares, setSquares] = useState([]);

  /**
   * Get the gamestate from the server, setting loading around it
   *
   * @param {number} gameId The ID of the game to get (match.params.id)
   * @returns {Promise} A promise of nothing
   */
  async function getGame(gameId) {
    setLoading(true);

    const response = await retry(() => request(`/api/games/${gameId}`));

    const {
      status: gameStatus,
      grid: {
        squares: gridSquares,
        mine_count,
        ...dimensions
      },
    } = await response.json();

    setSquares(to2D(gridSquares, dimensions.width, dimensions.height));
    setGrid(dimensions);
    setMineCount(mine_count);

    setStatus(gameStatus);
    setLoading(false);
  }

  /**
   * Reveal a square by its ID, recursively revealing any neighbouring squares
   * with no adjacent mines
   *
   * @param {number} squareId The ID of the square to reveal
   * @returns {Promise} A promise of nothing
   */
  async function reveal(squareId) {
    const response = await retry(() => request(
      `/api/squares/${squareId}/reveal`, {
        method: 'POST',
        headers: csrfJsonHeaders,
      },
    ));

    const { result, data } = await response.json();

    if (result === 'success') {
      const { revealed, game_status, mine_count } = data;
      // reveal all squares
      setSquares((sqs) => {
        const newSquares = Array.from(sqs);
        revealed.forEach(({ x, y, adjacent_mines }) => {
          newSquares[y][x].adjacent_mines = adjacent_mines;
          newSquares[y][x].is_revealed = true;
        });
        return newSquares;
      });

      setMineCount(mine_count);
      setStatus(game_status);
    } else {
      const { unflagged_mines, incorrect_flags } = data;
      setStatus('L');
      setSquares((sqs) => {
        const newSquares = Array.from(sqs);

        unflagged_mines.forEach((mine) => {
          newSquares[mine.y][mine.x].is_revealed = true;
          newSquares[mine.y][mine.x].has_mine = true;
        });

        incorrect_flags.forEach(({ x, y }) => {
          newSquares[y][x].is_incorrect = true;
        });
        return newSquares;
      });
    }
  }

  /**
   * Add or remove the flag from a square
   *
   * @param {number} squareId The ID of the square to toggle the flag on
   * @param {Object} square The square object itself
   * @param {number} square.x The position of the square in the x axis
   * @param {number} square.y The position of the square in the y axis
   * @param {boolean} square.has_flag Whether the square already has a flag
   * @returns {Promise} A promise of nothing
   */
  async function flag(squareId, square) {
    const { x, y, has_flag } = square;

    const response = await retry(() => request(
      `/api/squares/${squareId}/flag`, {
        method: has_flag ? 'DELETE' : 'POST',
        headers: csrfJsonHeaders,
      },
    ));

    const { mine_count } = await response.json();

    setMineCount(mine_count);
    setSquares((sqs) => {
      const newSquares = Array.from(sqs);
      newSquares[y][x].has_flag = !has_flag;
      return newSquares;
    });
  }

  // When the component renders for the first time, get the gamestate from the
  // server
  useEffect(() => {
    getGame(id);
  }, []);

  return (
    <div>
      <h1>
        {(loading && 'loading...') || (
          <Fragment>
            {status !== 'O' && (
              <Fragment>
                You
                {status === 'W' ? ' win!' : ' lose!'}
                <small>
                  {' '}
                  <Link to="/">
                    Play again?
                  </Link>
                </small>
              </Fragment>
            )}
            <small
              style={{
                float: 'right',
              }}
            >
              {mineCount}
            </small>
          </Fragment>
        )}
      </h1>
      {loading || (
        <Fragment>
          <div style={{
            clear: 'both',
            display: 'grid',
            gridTemplateColumns: `repeat(${width}, 1fr)`,
            gridGap: '0',
          }}
          >
            {squares.map(row => (
              row.map(square => (
                <Square
                  key={square.id}
                  square={square}
                  disabled={status === 'L' || status === 'W'}
                  onClick={() => reveal(square.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    flag(square.id, square);
                  }}
                />
              ))
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
}
