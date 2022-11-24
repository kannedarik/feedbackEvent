const logger = require('./config/logger').logger;
Promise = require('bluebird'); // eslint-disable-line no-global-assign

const { port, env, paymentsQueueListen } = require('./config/vars');

if (env === 'production') require('newrelic');

const app = require('./config/express');

// listen to requests
app.listen(port, () => logger.info(`Server started on port ${port} (${env})`));

//Initialsie SQS listener
const sqsListener = require('./api/listeners/sqs.listener')(app);
sqsListener.initialize();

//Initialise payments queue
if(paymentsQueueListen === 'true') {
  const paymentsListener = require('./api/listeners/payments.listener')(app);
  paymentsListener.initialize();
}

// Init sequelize
const db = require('./api/models');
global.sequelize = db;

const cache = require('./api/services/cache.service');
cache.intitialize();

module.exports = app;
