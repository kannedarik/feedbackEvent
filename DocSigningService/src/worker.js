const { Consumer } = require('sqs-consumer');
const SigningDocument = require('./api/models/signingdocument.model'); // eslint-disable-line no-unused-vars
const SigningProvider = require('./api/models/signingprovider.model'); // eslint-disable-line no-unused-vars
const SigningStatus = require('./api/models/signingstatus.model');
const SigningRequest = require('./api/models/signingrequest.model');
const mongoose = require('./config/mongoose');
const { logger } = require('./config/logger');
const { sqs } = require('./config/vars');

// open mongoose connection
mongoose.connect();

const app = Consumer.create({
  queueUrl: sqs.webhook,
  handleMessage: async (message) => {
    const body = JSON.parse(message.Body);
    const msg = JSON.parse(body.Message);

    const statuses = await SigningStatus.find({
      name: { $in: ['processing', 'success', 'failure', 'created'] },
      archived: false,
    });
    const statusMap = statuses.reduce((result, item) => {
      result[item.name] = item.id; // eslint-disable-line no-param-reassign
      return result;
    }, {});

    await SigningRequest.processWebhook(msg, body.MessageAttributes.service.Value, statusMap);
  },
});

app.on('error', (err) => {
  logger.error(err);
});

app.on('processing_error', (err) => {
  logger.error(err);
});

app.on('timeout_error', (err) => {
  logger.error(err);
});

app.start();
