const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');
const url = require('url');
const ws = require('uws');
const redis = require('redis');

const getTicker = require('./api').getTicker;
const getTickers = require('./api').getTickers;

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';

const TICKERS_CHANNEL = '/tickers';
const subscribers = {
  [TICKERS_CHANNEL]: 0
};

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

app.use(cors());
app.use(express.static('build'));

app.get('/*', (req, res) => {
  res.sendFile('index.html', {root: 'src'});
});


/* Create servers */
const server = env === 'development' ? http.createServer(app) :
  https.createServer(app);
const wsServer = new ws.Server({ server });
const sub = redis.createClient();
const pub = redis.createClient();

/* Set up Redis pubsub */
[pub, sub].forEach(rs => {
  rs.on('error', (err) => {
    console.log('Redis server error: ', err);
  });
});

sub.on('message', (channel, msg) => {
  // This is definitely not as nice as socketio.sockets.emit(); :(
  if (wsServer.clients) {
    wsServer.clients.forEach(client => {
      if (client.readyState === ws.OPEN && client.channel === channel) {
        client.send(msg);
      }
    });
  }
});
sub.subscribe(TICKERS_CHANNEL);

const pullData = () => setInterval(() => {
  Object.keys(exchangeMap).forEach(exchange => {
    getTicker(exchange, exchangeMap[exchange])
      .then(resp => {
        if (resp) {
          pub.publish(TICKERS_CHANNEL, resp);
        }
      });
  });
}, 1000);


/* Log connections to websocket server */
wsServer.on('connection', (socket, req) => {
  /* uWS doesn't give us the request obj, so I modified file to pass it in */
  const { path } = url.parse(req.url, true);
  socket.channel = path;
  subscribers[path] += 1;
  console.log("SUBSCRIBERS: ", subscribers[path]);
});

wsServer.on('disconnect', (socket) => {
  subscribers[socket.channel] -= 1;
  console.log("SUBSCRIBERS: ", subscribers[socket.channel]);
});


/* Start up our server and start pulling data */
server.listen(3000, () => {
  pullData();
  // console.log('TICKERS', getTickers('gdax'));

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
