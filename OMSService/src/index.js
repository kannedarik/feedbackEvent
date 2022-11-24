const { port, env, isNewrelicEnabled } = require('./config/vars');
// eslint-disable-next-line global-require
if (isNewrelicEnabled) require('newrelic');

const app = require('./config/express');
const mongoose = require('./config/mongoose');
const cache = require('./api/utils/cache');
const { logger } = require('./config/logger');
const AxiosConfig = require('./config/axios');

// open mongoose connection
mongoose.connect();

AxiosConfig.addRequestLogInterceptor();
AxiosConfig.addResponseLogInterceptor();

// listen to requests
app.listen(port, async () => {
  // Cache Data
  try {
    await cache.copyData();
  } catch (err) {
    logger.error('Failed to cache data', err);
    process.exit(-1);
  }
  console.info(`API Server started on port ${port} (${env})`); // eslint-disable-line no-console
});

/**
* Exports express
* @public
*/
module.exports = app;
