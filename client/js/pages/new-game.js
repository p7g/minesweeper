import React, { useState } from 'react';
import styled from 'styled-components';

import { getCookie } from '../utilities';

const Button = styled.button`
  width: 100%;
  margin-bottom: 1rem;
`;

const Difficulty = {
  EASY: 0.5,
  MEDIUM: 0.8,
  HARD: 1,
};

export default function NewGame({ history }) {
  const [loading, setLoading] = useState('');

  async function makeGame(name, difficulty) {
    setLoading(name);

    const token = getCookie('csrftoken');
    const response = await fetch('/api/games', {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
      headers: {
        'X-CSRFToken': token,
        'Content-Type': 'application/json',
      },
    });

    const { id } = await response.json();
    setLoading('');
    history.push(`/games/${id}/`); // go to the page for the new game
  }

  const loadingOr = text => (loading === text ? 'Loading...' : text);

  return (
    <div>
      <h1>Choose difficulty:</h1>
      <Button
        className="nes-btn"
        onClick={() => makeGame('Easy', Difficulty.EASY)}
      >
        {loadingOr('Easy')}
      </Button>
      <Button
        className="nes-btn is-warning"
        onClick={() => makeGame('Medium', Difficulty.MEDIUM)}
      >
        {loadingOr('Medium')}
      </Button>
      <Button
        className="nes-btn is-error"
        onClick={() => makeGame('Hard', Difficulty.HARD)}
      >
        {loadingOr('Hard')}
      </Button>
    </div>
  );
}
