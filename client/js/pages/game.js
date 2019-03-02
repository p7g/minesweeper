import React, { useState, useEffect, Fragment } from 'react';

import Square from '../components/square';
import { to2D, getCookie } from '../utilities';

const csrfJsonHeaders = {
  'X-CSRFToken': getCookie('csrftoken'),
  'Content-Type': 'appication/json',
};

export default function Game({ match }) {
  const { id } = match.params;
  const [loading, setLoading] = useState(true);
  const [{ width, height }, setGrid] = useState({ width: 0, height: 0 });
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

    // handle success/fail
  }

  async function flag(squareId, square) {
    const { x, y, has_flag } = square;
  
    const response = await fetch(`/api/squares/${squareId}/flag`, {
      method: has_flag ? 'DELETE' : 'POST',
      headers: csrfJsonHeaders,
    });

    squares[y][x].has_flag = !has_flag;
    setSquares(squares);
  }

  useEffect(() => {
    getGame(id);
  }, []);

  return (
    <div>
      <h1>{loading && 'loading...'}</h1>
      {loading || (
        <Fragment>
          <h1>{status}</h1>
          <div>
            {squares.map(row => (
              row.map(square => (
                <Square
                  key={square.id}
                  square={square}
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
