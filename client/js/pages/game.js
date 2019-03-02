/* eslint-disable camelcase */
import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';

import Square from '../components/square';
import { to2D, getCookie } from '../utilities';

const csrfJsonHeaders = {
  'X-CSRFToken': getCookie('csrftoken'),
  'Content-Type': 'appication/json',
};

export default function Game({ match }) {
  const { id } = match.params;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [squares, setSquares] = useState([]);

  async function getGame(gameId) {
    setLoading(true);

    const response = await fetch(`/api/games/${gameId}`);
    const {
      status: gameStatus,
      grid: { squares: gridSquares, ...dimensions },
    } = await response.json();

    setSquares(to2D(gridSquares, dimensions.width, dimensions.height));

    setStatus(gameStatus);
    setLoading(false);
  }

  async function reveal(squareId) {
    const response = await fetch(`/api/squares/${squareId}/reveal`, {
      method: 'POST',
      headers: csrfJsonHeaders,
    });

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
      // FIXME: check data.game_status for 'W'
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

  async function flag(squareId, square) {
    const { x, y, has_flag } = square;

    const response = await fetch(`/api/squares/${squareId}/flag`, {
      method: has_flag ? 'DELETE' : 'POST',
      headers: csrfJsonHeaders,
    });

    setSquares((sqs) => {
      const newSquares = Array.from(sqs);
      newSquares[y][x].has_flag = !has_flag;
      return newSquares;
    });
  }

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
          <div>
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
