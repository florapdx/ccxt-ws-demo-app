import fastStringify from 'fast-json-stringify';
import ccxt from 'ccxt';

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

/*
 * There is a perf benefit to avoiding return await, but if you want
 * to return a thenable, then return await is necessary.
 */
export const getTicker = async function getTicker(exchange, symbol) {
  exchange = exchange.toLowerCase();
  const exchangeBroker = new ccxt[exchange]();

  try {
    const tickerJSON = await exchangeBroker.fetchTicker(symbol);
    const tickerData = await stringify(tickerJSON);

    return tickerData;
  } catch (err) {
    console.log(`An error occurred during ${exchange} ticker fetch: ${err}.`);
  }
}

export const getTickers = async function getTickers(exchange) {
  exchange = exchange.toLowerCase();
  const exchangeBroker = new ccxt[exchange]();

  try {
    const tickers = exchangeBroker.fetchTickers();
    return tickers;
  } catch(err) {
    console.log(`An error occurred during ${exchange} tickers fetch: ${err}.`)
  }
}

