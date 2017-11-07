import {
  $$asyncIterator,
  createAsyncIterator,
  isAsyncIterable
} from 'iterall';
import fastStringify from 'fast-json-stringify';
import {
  parse,
  validate,
  execute,
  subscribe
} from 'graphql';

// BYO ws-compliant server (ws or uws)

const SUBSCRIBE_OPERATION = 'SUBSCRIBE';
const UNSUBSCRIBE_OPERATION = 'UNSUBSCRIBE';


const socketOnMessage = (schema, socket, message) => {
  /* Set up subscribe/unsubscribe to Redis subscription server */
  const data = JSON.parse(message.data);
  const { operation, topic } = data;

  switch (operation) {
    case SUBSCRIBE_OPERATION:
      // is this going to add multiple subscriptions for same socket?
      // or send a message for each subscription to a single topic?
      const {
        query,
        variables
      } = data;
      query = typeof query === 'string' ? query : parse(query);
      const validationErrors = validate(schema, query);

      let executionIterable = null;

      if (validationErrors.length) {
        executionIterable = Promise.resolve(createAsyncIterator({ errors: validationErrors }));
      } else {
        executionIterable = Promise.resolve(
          subscribe(
            schema,
            query,
            {}, // rootValue: don't know if we need
            {}, // context: don't know if we need
            variables,
            operation
          )
        );
      }

      if (socket.topics.indexOf(topic) === -1) {
        socket.topics.push(topic);
      }

      return executionIterable.then(iterable => ({
        executionIterable: isAsyncIterable(iterable) ? iterable :
          createAsyncIterator([iterable]),
        params: data
      })).then(({ executionIterable, params }) => {
        forAwaitEach(
          createAsyncIterator(executionIterable),
          (value) => {
            if (socket.topics.indexOf(topic) !== -1 && socket.readyState === WebSocket.OPEN) {
              socket.send(fastStringify({
                operation,
                topic,
                data: value
              }));
            }
          }
        )
      })
      break;
    case UNSUBSCRIBE_OPERATION:
      socket.topics = socket.topics.filter(t => t !== topic);
      break;
    default:
      throw new Error('You must provide a valid operation in your message.');
  }
}

export default createSubscriptionServer = (wsServer, schema) => {

  /* Set up connections to websocket server */
  wsServer.on('connection', (socket, req) => {
    socket.topics = [];
    console.log("NEW SOCKET CONNECTION: ", console.log(req));

    wsServer.on('message', message => socketOnMessage(schema, socket, message));
    wsServer.on('error', error => console.log('Socket error: ', error));
    wsServer.on('close', () => console.log('Socket closed'));
  });

  wsServer.on('disconnect', (socket) => {
    console.log("SOCKET DISCONNECTION");
    socket.topics = null;
    socket.close();
  });
}
