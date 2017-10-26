import actions, {
  WS_CONNECT,
  WS_DISCONNECT,
  WS_SEND_MESSAGE,
} from './actions';

const SOCKET_URL = `ws://${window.location.host}`;

const sockets = {};

export const wsMiddleware = store => next => action => {
  const { dispatch } = store;
  const { payload } = action;
  const { channel, message } = payload;

  switch (action.type) {
    case WS_CONNECT:
      if (!sockets[channel]) {
        sockets[channel] = new WebSocket(`${SOCKET_URL}/${channel}`);

        sockets[channel].addEventListener('open', () => dispatch(actions._wsConnected({ channel })))
        sockets[channel].addEventListener('close', () => dispatch(actions._wsDisconnected({ channel })))
        sockets[channel].addEventListener('message', (message) => dispatch(actions._wsMessageReceived({ channel, message })))
        sockets[channel].addEventListener('error', (err) => console.log("WEBSOCKET ERROR: ", err));
      }
      break;
    case WS_DISCONNECT:
      if (sockets[channel]) {
        sockets[channel].close();
        sockets[channel] = null;
      }
      break;
    case WS_SEND_MESSAGE:
      if (sockets[channel]) {
        sockets[channel].send(JSON.stringify(message));
      } else {
        throw new Error("You are not connected to this channel yet.")
      }
      break;
    default:
      break;
  }

  return next(action);
}

