const { Consumer } = require('sqs-consumer');
const configVars = require('../../config/vars');
const lnvTicketHandler = require('./handler');
const { logger } = require('../../config/logger');
const mongoose = require('../../config/mongoose');
const axiosConfig = require('../../config/axios');

if (configVars.isNewrelicEnabled) require('newrelic');

axiosConfig.addRequestLogInterceptor();
axiosConfig.addResponseLogInterceptor();

// open mongoose connection
mongoose.connect();

const consumer = Consumer.create({
  queueUrl: configVars.sqs.loanevent,
  handleMessage: lnvTicketHandler.handleMessage,
});

consumer.on('error', (err) => {
  logger.error('Error in the Loanrequest record consumer: ', err);
});

consumer.on('processing_error', (err) => {
  logger.error('Processing error in the loanrequest record consumer: ', err);
});

consumer.on('timeout_error', (err) => {
  logger.error('Timeout error in the loanrequest record consumer: ', err);
});

logger.info('Starting the loanrequest record consumer');
consumer.start();