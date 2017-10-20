const url = require('url');
const ws = require('uws');
const fastStringify = require('fast-json-stringify');
const ccxt = require('ccxt');

const BTC_CHANNEL = '/btc';
const ETH_CHANNEL = '/eth';

const INTERVAL = 1000; // 1s

/* fast-json-stringify */
const tickerProperties = {
  symbol: { type: 'string' },
  timestamp: { type: 'number' },
  datetime: { type: 'string' },
  high: { type: 'number' },
  low: { type: 'number' },
  bid: { type: 'number' },
  ask: { type: 'number' },
  vwap: { type: 'number' },
  open: { type: 'number' },
  last: { type: 'number' },
  baseVolume: { type: 'number' },
  quoteVolume: { type: 'number' },
  info: {
    type: 'object',
    properties: {
      trade_id: { type: 'number' },
      price: { type: 'string' },
      size: { type: 'string' },
      bid: { type: 'string' },
      ask: { type: 'string' },
      volume: { type: 'string' },
      time: { type: 'string' },
      a: { type: 'array', items: { type: 'string' } },
      b: { type: 'array', items: { type: 'string' } },
      c: { type: 'array', items: { type: 'string' } },
      v: { type: 'array', items: { type: 'string' } },
      p: { type: 'array', items: { type: 'string' } },
      t: { type: 'array', items: { type: 'number' } },
      l: { type: 'array', items: { type: 'string' } },
      h: { type: 'array', items: { type: 'string' } },
      o: { type: 'array', items: { type: 'string' } },
    }
  }
};

const stringify = fastStringify({
  title: 'Ticker',
  type: 'object',
  properties: tickerProperties
});
/* end fast-json-stringify */

async function getBTCTicker(server) {
  const gdax = new ccxt.gdax();

  try {
    const gdaxTicker = await gdax.fetchTicker('BTC/USD');
    const tickerData = await stringify(gdaxTicker);

    server.clients.forEach(client => {
      if (client.readyState === ws.OPEN && client.channel === BTC_CHANNEL) {
        client.send(tickerData);
      }
    });
  } catch (err) {
    console.log('An error occurred during GDAX pull');
  }
}

async function getETHTicker(server) {
  const kraken = new ccxt.kraken();

  try {
    const krakenTicker = await kraken.fetchTicker('ETH/USD');
    const tickerData = await JSON.stringify(krakenTicker);

    server.clients.forEach(client => {
      if (client.readyState === ws.OPEN && client.channel === ETH_CHANNEL) {
        client.send(tickerData);
      }
    });
  } catch (err) {
    console.log('An error occurred during KRAKEN pull');
  }
}

function createSocketServer(server) {
  const wsServer = new ws.Server({ server });

  const subscribers = {
    [BTC_CHANNEL]: 0,
    [ETH_CHANNEL]: 0
  };

  wsServer.on('connection', (socket, req) => {
    /* uWS doesn't give us the request obj, so not sure how to use it here */
    const { path } = url.parse(req.url, true);
    socket.channel = path;
    subscribers[path] += 1;
  });

  wsServer.on('disconnect', (socket) => {
    subscribers[socket.channel] -= 1;
  });

  const timer = setInterval(() => {
    if (subscribers[BTC_CHANNEL] > 0) {
      getBTCTicker(wsServer);
    }

    if (subscribers[ETH_CHANNEL] > 0) {
      getETHTicker(wsServer);
    }
  }, 1000);

}

module.exports.createSocketServer = createSocketServer;
