import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Layout from './layout';
import Game from './pages/game.js';
import NewGame from './pages/new-game';

export default () => (
  <Layout>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={NewGame} />
        <Route path="/games/:id" component={Game} />
        <Route render={() => <p className="nes-text is-error">Not found</p>} />
      </Switch>
    </BrowserRouter>
  </Layout>
);
