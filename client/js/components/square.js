import React from 'react';

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

/* eslint-disable camelcase, react/prop-types */
export default ({
  square: {
    has_mine,
    has_flag,
    is_revealed,
    adjacent_mines,
  },
  disabled,
  onClick,
  onContextMenu,
}) => {
  let contents = '\u00A0';
  let extraStyles = {};

  if (is_revealed) {
    if (has_mine) {
      contents = 'M';
    } else {
      extraStyles = {
        color: severity[adjacent_mines],
        opacity: '1',
        cursor: 'inherit',
      };
      if (adjacent_mines > 0) {
        contents = adjacent_mines;
      }
    }
  } else if (has_flag) {
    contents = 'F';
  }

  return (
    <button
      disabled={disabled}
      type="button"
      className={`
        nes-btn
        ${has_mine ? 'is-error' : ''}
        ${is_revealed && !has_mine ? 'is-disabled' : ''}
        ${has_flag && !is_revealed ? 'is-warning' : ''}
      `}
      style={extraStyles}
      active={is_revealed}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {contents}
    </button>
  );
};
/* eslint-enable camelcase, react/prop-types */
