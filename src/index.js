var express = require('express');
var http = require('http');
var https = require('https');
var cors = require('cors');
var createSocketServer = require('./socket-server').createSocketServer;

var naive = require('./naive/server');
var relay = require('./relay/server');

const env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';

const app = express();

app.use(cors());
app.use(express.static('build'));

app.use('/naive', naive);
app.use('/relay', relay);

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: 'src'});
});

const server = env === 'development' ? http.createServer(app) :
  https.createServer(app);
const wsServer = createSocketServer(server);

server.listen(3000, () => {
  const { address, port } = server.address();
  console.log(`Server running at ${address === '::' ? 'localhost' : address} on port ${port}`);
});

server.on('close', () => {
  wsServer.close(() => {
    console.log('Server closing. Closing WebSocket server.');
  });
});
