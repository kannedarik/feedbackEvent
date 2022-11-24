/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const mongoose = require('./config/mongoose');
const zbc = require('./config/zeebe');
const OrderItem = require('./api/models/orderitem.model'); // eslint-disable-line no-unused-vars
const OrderType = require('./api/models/ordertype.model'); // eslint-disable-line no-unused-vars
const OrderPayment = require('./api/models/orderpayment.model'); // eslint-disable-line no-unused-vars
const UtilityHelper = require('./api/utils/helper');
const AxiosConfig = require('./config/axios');
const { logger } = require('./config/logger');
const { isNewrelicEnabled } = require('./config/vars');

if (isNewrelicEnabled) require('newrelic');

// open mongoose connection
mongoose.connect();

AxiosConfig.addRequestLogInterceptor();
AxiosConfig.addResponseLogInterceptor();

// Find all workers
UtilityHelper.getFilePaths(path.join(__dirname, './api', 'workers')).forEach((file) => {
  logger.info(`Creating worker ${file}`);
  zbc.createWorker(require(file)());
});
