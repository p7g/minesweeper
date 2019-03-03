import React, { Fragment } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  font-family: 'Press Start 2P';
  width: 100%;
  margin: 0 auto;

  @media (min-width: 800px) {
    width: 75%;
  }

  @media (min-width: 1200px) {
    width: 50%;
  }
`;

// eslint-disable-next-line react/prop-types
export default ({ children }) => (
  <Fragment>
    <header>
      <Container>
        <h1>Minesweeper</h1>
      </Container>
    </header>
    <main>
      <Container className="nes-container">
        {children}
      </Container>
    </main>
  </Fragment>
);
