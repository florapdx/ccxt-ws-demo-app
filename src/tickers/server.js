var express = require('express');

const router = express.Router();

router.get('/*', (req, res) => {
  res.sendFile('index.html', { root: 'src/tickers' });
});

module.exports = router;
