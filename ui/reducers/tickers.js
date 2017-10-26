import { WS_RECEIVED_MESSAGE } from '../actions';

const initialState = {};

function updateTicker(state, action) {
  const data = JSON.parse(action.payload.message.data);
  return {
    ...state,
    [data.symbol]: data
  };
}

const actionsToHandlers = {
  [WS_RECEIVED_MESSAGE]: updateTicker
};

export default function tickers(state=initialState, action) {
  return actionsToHandlers[action.type] ? actionsToHandlers[action.type](state, action) || state : state;
}
