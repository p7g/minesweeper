/* eslint-disable camelcase */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';

import Square from '../components/square';
import { to2D, getCookie } from '../utilities';

// headers needed to make a post request with a JSON payload
const csrfJsonHeaders = {
  'X-CSRFToken': getCookie('csrftoken'),
  'Content-Type': 'appication/json',
};

/**
 * The Game component, which generates the board and handles input
 */
export default function Game({ match }) {
  const { id } = match.params;
  const [loading, setLoading] = useState(true);
  const [{ width, height }, setGrid] = useState({});
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

    const response = await fetch(`/api/games/${gameId}`);
    // FIXME: error handling
    const {
      status: gameStatus,
      grid: { squares: gridSquares, ...dimensions },
    } = await response.json();

    setSquares(to2D(gridSquares, dimensions.width, dimensions.height));
    setGrid(dimensions);

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
    const response = await fetch(`/api/squares/${squareId}/reveal`, {
      method: 'POST',
      headers: csrfJsonHeaders,
    });
    // FIXME: error handling

    const { result, data } = await response.json();

    if (result === 'success') {
      const { revealed, game_status } = data;
      // reveal all squares
      setSquares((sqs) => {
        const newSquares = Array.from(sqs);
        revealed.forEach(({ x, y, adjacent_mines }) => {
          newSquares[y][x].adjacent_mines = adjacent_mines;
          newSquares[y][x].is_revealed = true;
        });
        return newSquares;
      });

      setStatus(game_status);
    } else {
      const { x, y } = data;
      setStatus('L');
      setSquares((sqs) => {
        const newSquares = Array.from(sqs);
        newSquares[y][x] = data;
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

    const response = await fetch(`/api/squares/${squareId}/flag`, {
      method: has_flag ? 'DELETE' : 'POST',
      headers: csrfJsonHeaders,
    });
    // FIXME: error handling

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
      <h1>{loading && 'loading...'}</h1>
      {loading || (
        <Fragment>
          {status !== 'O' && (
            <h1>
              You
              {status === 'W' ? ' win!' : ' lose!'}
              <small>
                {' '}
                <Link to="/">
                  Play again?
                </Link>
              </small>
            </h1>
          )}
          <div style={{
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
