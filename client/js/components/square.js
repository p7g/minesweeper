import React from 'react';
import styled from 'styled-components';

import { getSquareContents, getSquareClass, getSquareStyles } from '../utilities';

const Button = styled.button`
  position: relative;

  ::before {
    content: '';
    display: block;
    padding-top: 100%;
  }
`;

export default ({
  /* eslint-disable react/prop-types */
  square,
  style,
  disabled,
  onClick,
  onContextMenu,
  /* eslint-enable react/prop-types */
}) => {
  const contents = getSquareContents(square);
  const buttonClass = getSquareClass(square);
  const extraStyles = getSquareStyles(square);

  return (
    <Button
      disabled={disabled}
      type="button"
      className={buttonClass}
      style={{
        ...extraStyles,
        ...style,
      }}
      active={square.is_revealed}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {contents}
      </div>
    </Button>
  );
};
