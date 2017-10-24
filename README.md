# Minimal app for testing realtime messaging and rendering options

Small test app providing a minimal server implementation for serving a couple of html pages and some ticker data (at a 1s pull rate) over WebSocket connections.

Base server implementation:

* Express
* Redis (pubsub to mimic some type of backend/realtime platform)
* uWebSockets
* fast-json-stringify for fast JSON stringification of data we get from ccxt _which come to us as decoded JSON objects_. [Note: There is a test file for running JSON encoding/decoding benchmarks in `/cli`.]

Addons:
* GraphQL + Relay
* maybe RxJS or MobX, Vue, etc.