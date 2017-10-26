import { createStore, applyMiddleware, compose } from 'redux';
import { logger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import { wsMiddleware } from './middleware';

import rootReducer from './reducers';

export default function configureStore(history) {
  return createStore(
    rootReducer,
    applyMiddleware(
      routerMiddleware(history),
      wsMiddleware,
      logger
    )
  );
}
