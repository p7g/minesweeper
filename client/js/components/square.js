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
    className="nes-btn"
    onClick={onClick}
    onContextMenu={onContextMenu}
  >
    {(is_revealed && adjacent_mines) || (
      has_flag && (console.log('f'), 'f')
    )}
  </button>
);
/* eslint-enable camelcase, react/prop-types */
