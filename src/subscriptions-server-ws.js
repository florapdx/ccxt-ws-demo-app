const $$asyncIterator = require('iterall').$$asyncIterator;
const execute = require('graphql').execute;
const subscribe = require('graphql').subscribe;

// BYO ws-compliant server (ws or uws)

// Event system --> WS Subscription server --> GraphQL server -->
// WS Subscription server --> client


// connectionContext.isLegacy = false;
// connectionContext.socket = socket;
// connectionContext.operations = {};

const SUBSCRIBE_OPERATION = 'SUBSCRIBE';
const UNSUBSCRIBE_OPERATION = 'UNSUBSCRIBE';
const UPDATE_OPERATION = 'UPDATE';



const socketOnMessage = (socket, message) => {
  /* Set up subscribe/unsubscribe to Redis subscription server */
  const { data } = message;
  const { operation } = data;

  switch (operation) {
    case SUBSCRIBE_OPERATION:
      // is this going to add multiple subscriptions for same socket?
      // or send a message for each subscription to a single topic?
      data.split(',').forEach(topic => {
        sub.subscribe(topic);
        if (socket.topics.indexOf(topic) === -1) {
          socket.topics.push(topic);
        }
      });
      break;
    case UNSUBSCRIBE_OPERATION:
      data.split(',').forEach(topic => {
        sub.unsubscribe(topic);
        socket.topics = socket.topics.filter(t => t !== topic);
      });
      break;
    case UPDATE_OPERATION:
      // do graphQL stuff here
      break;
    default:
      throw new Error('You must provide a valid operation in your message.');
  }
}

module.exports.createSubscriptionServer = (wsServer, topicMap) => {

  /* Set up connections to websocket server */
  wsServer.on('connection', (socket, req) => {
    socket.topics = [];
    console.log("NEW SOCKET CONNECTION");
    wsServer.on('message', message => socketOnMessage(socket, message));
  });

  wsServer.on('disconnect', (socket) => {
    console.log("SOCKET DISCONNECTION");
    socket.topics = null;
    socket.close();
  });

  const topics = Object.keys(topicMap).map(k => topicMap[k]);

  sub.on('message', (topic, msg) => {
    const isValidTopic = topics.indexOf(topic) !== -1;
    if (isValidTopic) {
      if (!msg) {
        break;
      } else {
        // call out to graphQL here, returns promise
        if (wsServer.clients) {
          wsServer.clients.forEach(client => {
            if (client.readyState === ws.OPEN && client.channel === channel) {
              client.send(msg);
            }
          });
        }
      }
    } else {
      throw new Error('Topic is not valid.');
    }
  });
}
