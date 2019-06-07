# CCXT WebSocket app: Demo app demonstrating real time messaging and rendering options

Small demo app providing a minimal server implementation that pulls crypto ticker data via the CCXT API over WebSocket at 1s resolution. Additionally provides facility for benchmarking various messaging protocols and their encoding/decoding rates using representative ticker data.

Base server implementation:

* Express
* Redis (pubsub to mimic some type of backend/realtime platform)
* uWebSockets
* fast-json-stringify for fast JSON stringification of data we get from ccxt _which come to us as decoded JSON objects_. [Note: There is a test file for running JSON encoding/decoding benchmarks in `/cli`.]
* The CCXT project can be found [here](https://github.com/ccxt/ccxt)

@TODO
* Protobuf benchmark test case
