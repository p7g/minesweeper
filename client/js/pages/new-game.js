import React, { useState } from 'react';
import styled from 'styled-components';

import { getCookie } from '../utilities';

const Button = styled.button`
  width: 100%;
  margin-bottom: 1rem;
`;

// Preset difficulty levels
const Difficulty = {
  EASY: 0.6,
  MEDIUM: 0.8,
  HARD: 1,
};

/**
 * A page that allows the user to start a new game
 */
export default function NewGame({ history }) {
  const [loading, setLoading] = useState('');

  /**
   * Make a new game
   *
   * Requests the server to make a new game, and gets back the ID of it
   *
   * @param {string} name The value to set loading to (for individual button
   * loading states)
   * @param {number} difficulty The difficulty of the game to make. This should
   * be a decimal that represents the chance of each square containing a mine
   * @return {Promise} A promise of nothing
   */
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

  /**
   * Display either "Loading..." or the given text, depending on if the loading
   * state is equal to the given text
   *
   * @param {string} text The value to compare against the loading state, and
   * also to display if the loading state is not equal to it
   * @returns {string}
   */
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
