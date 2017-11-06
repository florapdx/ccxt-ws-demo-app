const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');
const url = require('url');
const uws = require('uws');

const graphQLHTTP = require('express-graphql');
const schema = require('./schema').schema;
const resolvers = require('./resolvers').rootResolvers;

const createSubscriptionServer = require('subscription-server-ws').createSubscriptionServer;

const getTicker = require('./api').getTicker;
const getTickers = require('./api').getTickers;

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
const graphQLWS = createSubscriptionServer(wsServer, exchangeMap);

/* Create Redis PubSub for GraphQL Subscriptions */
const { pub, sub } = initRedisPubSub();

app.use(cors());
app.use(express.static('build'));

// Mount graphQL HTTP server on '/graphql' route
// Added extension to return the graphQL request execution time.
app.use('/graphql', graphQLHTTP(request => {
  const startTime = Date.now();
  return {
    schema,
    rootValue: resolvers,
    graphiql: true,
    context: { pub, sub },
    extensions({ document, variables, operationName, result }) {
      return ${Date.now() - startTime};
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
          pub.publish(`${exchangeMap[exchange]}_TOPIC`, resp);
        }
      });
  });
}, 1000);

/* Start up our server and start pulling data */
let subscriptionServer = null;

server.listen(PORT, () => {
  pullData();

  subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe
  }, {
    server: wsServer,
    path: '/graphql'
  });

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
