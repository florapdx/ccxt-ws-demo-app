import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import tickers from './tickers';

export default combineReducers({
  routerReducer,
  tickers
});
