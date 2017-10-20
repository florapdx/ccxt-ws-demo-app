// @TODO: Protobuf?

var notepack = require('notepack');
var msgpackLite = require('msgpack-lite');
// var protobufJS = require('protobufjs');
var Benchtable = require('benchtable');

var smData = require('./data').small;
var lgData = require('./data').large;

var notepackEncodedSm = notepack.encode(smData);
var msgpackLiteEncodedSm = msgpackLite.encode(smData);
// var protobufJSEncodedSm = protobufJS.encode(smData);
var jsonStringEncodedSm = JSON.stringify(smData);
var jsonBufferEncodedSm = Buffer.from(JSON.stringify(smData));

var notepackEncodedLg = notepack.encode(lgData);
var msgpackLiteEncodedLg = msgpackLite.encode(lgData);
// var protobufJSEncodedLg = protobufJS.encode(lgData);
var jsonStringEncodedLg = JSON.stringify(lgData);
var jsonBufferEncodedLg = Buffer.from(JSON.stringify(lgData));

var suite = new Benchtable('Decoders');

suite
.addFunction('notepack', (nb, mpl, /*pb,*/ jsonStr, jsonBuffer) => notepack.decode(nb))
.addFunction('msgpack-lite', (nb, mpl, /*pb,*/ jsonStr, jsonBuffer) => msgpackLite.decode(mpl))
//.addFunction('protobuf-js', (nb, mpl, /*pb,*/ jsonStr, jsonBuffer) => protobufJS.decode(pb))
.addFunction('JSON.parse (from string)', (nb, mpl, /*pb,*/ jsonStr, jsonBuffer) => JSON.parse(jsonStr))
.addFunction('JSON.parse (from Buffer)', (nb, mpl, /*pb,*/ jsonStr, jsonBuffer) => JSON.parse(jsonBuffer.toString()))
.addInput('small', [notepackEncodedSm, msgpackLiteEncodedSm, /*protobufJSEncodedSm,*/ jsonStringEncodedSm, jsonBufferEncodedSm])
.addInput('large', [notepackEncodedLg, msgpackLiteEncodedLg, /*protobufJSEncodedLg,*/ jsonStringEncodedLg, jsonBufferEncodedLg])
.on('complete', function () {
  console.log(this.table.toString());
})
.run({ async: true });
