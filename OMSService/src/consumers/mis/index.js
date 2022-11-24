const { Consumer } = require('sqs-consumer');
const configVars = require('../../config/vars'); // We need to require this before the handler so that the config is initialized before the Zeebe client
const misHandler = require('./handler');
const { logger } = require('../../config/logger');
const mongoose = require('../../config/mongoose');

if (configVars.isNewrelicEnabled) require('newrelic');

// open mongoose connection
mongoose.connect();

logger.info(`Consumer being created for ${configVars.sqs.misRecords}`);

const consumer = Consumer.create({
  queueUrl: configVars.sqs.misRecords,
  handleMessage: misHandler.handleMessage,
});

consumer.on('error', (err) => {
  logger.error('Error in the MIS record consumer: ', err);
});

consumer.on('processing_error', (err) => {
  logger.error('Processing error in the MIS record consumer: ', err);
});

consumer.on('timeout_error', (err) => {
  logger.error('Timeout error in the MIS record consumer: ', err);
});

logger.info('Starting the MIS record consumer');
consumer.start();
