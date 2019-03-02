import React, { useState, useEffect, Fragment } from 'react';

export default function Game({ match }) {
  const { id } = match.params;
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);

  useEffect(() => {
    getGame(id);
  }, []);

  async function getGame(id) {
    setLoading(true);

    const response = await fetch(`/api/games/${id}`);
    setGame(await response.json());

    setLoading(false);
  }

  return (
    <div>
      <h1>{loading && 'loading...'}</h1>
      {game && (
        <Fragment>
          <h1>{game.status}</h1>
          <div>
            {Array(game.grid.height).fill().map((_, y) => (
              <Fragment>
                {Array(game.grid.width).fill().map((_, x) => (
                  <td>
                    <button className="nes-btn">{Math.floor(Math.random() * 3)}</button>
                  </td>
                ))}
                <br />
              </Fragment>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
}
