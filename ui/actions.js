/*
 * Collapsing constants and actions into the same file
 * for the sake of expediency.
 */
export const WS_CONNECT = 'WS_CONNECT';
export const WS_DISCONNECT = 'WS_DISCONNECT';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';

export const WS_CONNECTED = 'WS_CONNECTED';
export const WS_DISCONNECTED = 'WS_DISCONNECTED';
export const WS_RECEIVED_MESSAGE = 'WS_RECEIVE_MESSAGE';

export const ALL_TICKERS_CHANNEL = 'all';
export const BTC_TICKER_CHANNEL = 'btc';
export const ETH_TICKER_CHANNEL = 'eth';

// export const UPDATE_TICKER_DATA = 'UPDATE_TICKER_DATA';

export default {
  /* Private methods here mean should only be called from within middlewares */
  _wsConnected(payload, error) {
    return {
      type: WS_CONNECTED,
      payload,
      error
    };
  },

  _wsDisconnected(payload, error) {
    return {
      type: WS_DISCONNECTED,
      payload,
      error
    };
  },

  // naive implementation - updates ticker store
  _wsMessageReceived(payload, error) {
    return {
      type: WS_RECEIVED_MESSAGE,
      payload,
      error
    };
  },

  connectToWS(payload) {
    return {
      type: WS_CONNECT,
      payload
    };
  },

  disconnectFromWS(payload) {
    return {
      type: WS_DISCONNECT,
      payload
    };
  },

  sendMessage(payload, error) {
    return {
      type: WS_SEND_MESSAGE,
      payload
    };
  }
};
