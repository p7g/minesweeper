import React from 'react';

/* eslint-disable camelcase, react/prop-types */
export default ({
  square: {
    has_mine,
    has_flag,
    is_revealed,
    adjacent_mines,
  },
  onClick,
  onContextMenu,
}) => (
  <button
    type="button"
    className={`
      nes-btn
      ${has_mine ? 'is-error' : ''}
      ${is_revealed && !has_mine ? 'is-primary' : ''}
      ${has_flag && !is_revealed ? 'is-warning' : ''}
    `}
    onClick={onClick}
    onContextMenu={onContextMenu}
  >
    {(is_revealed && ((has_mine && 'M') || `${adjacent_mines}`)) || (
      has_flag && 'F'
    ) || 'H'}
  </button>
);
/* eslint-enable camelcase, react/prop-types */
