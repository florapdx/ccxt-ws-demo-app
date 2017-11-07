import express from 'express';
import http from 'http';
import https from 'https';
import cors from 'cors';
import url from 'url';
import uws from 'uws';

import graphQLHTTP from 'express-graphql';
import { schema } from './schema';
import { rootResolvers as resolvers } from './resolvers';

import RedisGraphQLPubSub from './subscriptions-redis';
import { createSubscriptionServer } from './subscriptions-server-ws';

import { getTicker, getTickers } from './api';

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';

const PORT = 3000;

const exchangeMap = {
  'gdax': 'BTC/USD',
  'gdax': 'LTC/USD',
  'kraken': 'ETH/USD',
  'poloniex': 'STR/BTC',
  'gemini': 'ETH/BTC',
  'coinmarketcap': 'DASH/USD',
  'cex': 'BTC/EUR',
  'allcoin': 'NEO/BTC'
};

/* Create app */
const app = express();

/* Create servers */
const server = env === 'development' ? http.createServer(app) :
  https.createServer(app);
const wsServer = new uws.Server({ server });
const graphQLWS = initSubscriptionServer(wsServer, schema);

app.use(cors());
app.use(express.static('build'));

const pubsub = new RedisGraphQLPubSub();

// Fake it till you make it
const db = {
  store: {},
  get: id => this.store[id],
  set: (id, input) => (this.store[id] = input)
};

// Mount graphQL HTTP server on '/graphql' route
// Added extension to return the graphQL request execution time.
// Passes data store and pubsub engine via `context`.
app.use('/graphql', graphQLHTTP(request => {
  const startTime = Date.now();
  return {
    schema,
    rootValue: resolvers,
    graphiql: true,
    context: { db, pubsub },
    extensions({ document, variables, operationName, result }) {
      return `${Date.now() - startTime}`;
    },
    formatError: error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack,
      path: error.path
    })
  };
}));

app.get('/*', (req, res) => {
  res.sendFile('index.html', {root: 'src'});
});

const pullData = () => setInterval(() => {
  Object.keys(exchangeMap).forEach(exchange => {
    getTicker(exchange, exchangeMap[exchange])
      .then(resp => {
        if (resp) {
          pubsub.publish(`${exchangeMap[exchange]}_TOPIC`, JSON.stringify(resp));
        }
      });
  });
}, 1000);

/* Start up our server and start pulling data */
// let subscriptionServer = null;

server.listen(PORT, () => {
  pullData();

  // subscriptionServer = SubscriptionServer.create({
  //   schema,
  //   execute,
  //   subscribe
  // }, {
  //   server: wsServer,
  //   path: '/graphql'
  // });

  const { address, port } = server.address();
  console.log(`Server running at ${address === '::' ? 'localhost' : address} on port ${port}`);
});

/* Stop pulling data */
server.on('close', () => {
  clearInterval(pullData);
  wsServer.close(() => {
    console.log('Server closing. Closing WebSocket server.');
  });
});
