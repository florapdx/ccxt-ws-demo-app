// @TODO: Protobuf?

const notepack = require('notepack');
const msgpackLite = require('msgpack-lite');
const fastStringify = require('fast-json-stringify')
// var protobufJS = require('protobufjs');
const Benchtable = require('benchtable');

const smData = require('./data').small;
const lgData = require('./data').large;

// Start fast-json-stringify schema definitions
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
  info: { type: 'object' }
};

const stringifySm = fastStringify({
  title: 'Ticker',
  type: 'object',
  properties: tickerProperties
});

var stringifyLg = fastStringify({
  title: 'Tickers',
  type: 'array',
  items: {
    type: 'object',
    properties: tickerProperties
  }
});
// end fast-json-stringify schema definitions

var suite = new Benchtable('Encoders');

suite
.addFunction('notepack', data => notepack.encode(data))
.addFunction('msgpack-lite', data => msgpackLite.encode(data))
//.addFunction('protobuf-js', data => protobufJS.encode(data))
.addFunction('JSON.stringify', data => JSON.stringify(data))
.addFunction('JSON.stringify to Buffer', (data) => Buffer.from(JSON.stringify(data)))
.addFunction('fast-json-stringify', data => Array.isArray(data) ? stringifyLg(data) : stringifySm(data))
.addInput('small', [smData])
.addInput('large', [lgData])
.on('complete', function () {
  console.log(this.table.toString());
})
.run({ async: true });
