import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter as Router, push } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';

import configureStore from './store';

import Index from './components/Index';
import Tickers from './components/tickers';
import Ticker from './components/ticker';
import './css';

import Promise from 'promise-polyfill';

if (!window.Promise) {
  window.Promise = Promise;
}

const history = createHistory();
const store = configureStore(history);

const routes = [
  {
    path: '/',
    component: Index
  },
  {
    path: '/tickers/:symbol',
    component: Ticker
  },
  {
    path: '/tickers',
    component: Tickers
  }
];

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Index>
        <Route exact path="/tickers" component={Tickers} />
        <Route path="/tickers/:symbol" component={Ticker} />
      </Index>
    </Router>
  </Provider>, document.getElementById('app')
);
