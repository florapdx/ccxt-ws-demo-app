const $$asyncIterator = require('iterall').$$asyncIterator;
const execute = require('graphql').execute;
const subscribe = require('graphql').subscribe;

// BYO ws-compliant server (ws or uws)

// Event system --> WS Subscription server --> GraphQL server -->
// WS Subscription server --> client

// export interface PubSubEngine {
//   publish(triggerName: string, payload: any): boolean; // EE emits payload
//   subscribe(triggerName: string, onMessage: Function, options: Object): Promise<number>; // EE adds listener(eventName, onMessage)
//   unsubscribe(subId: number); // EE removes listener
//   asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>; // EE and asyncIterator : push and pull queues which hold promises. IDGI
// }
// connectionContext.isLegacy = false;
// connectionContext.socket = socket;
// connectionContext.operations = {};

const SUBSCRIBE_MSG = 'SUBSCRIBE';
const UNSUBSCRIBE_MSG = 'UNSUBSCRIBE';

// Make Redis subscriber client
const sub = redis.createClient();

const socketOnMessage = (socket, message) => {
  /* Set up subscribe/unsubscribe to Redis subscription server */
  const subscribe = message.data.subscribe;
  const unsubscribe = message.data.unsubscribe;

  if (subscribe) {
    const subscribeArray = subscribe.split(',');
    // is this going to add multiple subscriptions for same socket?
    // or send a message for each subscription to a single topic?
    subscribeArray.forEach(topic => {
      sub.subscribe(topic);
      if (socket.topics.indexOf(topic) === -1) {
        socket.topics.push(topic);
      }
    });
  } else if (unsubscribe) {
    const unsubscribeArray = unsubscribe.split(',');
    unsubscribeArray.forEach(topic => {
      sub.unsubscribe(topic);
      socket.topics = socket.topics.filter(t => t !== topic);
    });
  } else {
    // FYI: Just for this little test case we're restricting
    // client --> server communication to sub/unsub
    throw new Error('Socket connection only accepts subscribe and unsubscribe messages.');
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