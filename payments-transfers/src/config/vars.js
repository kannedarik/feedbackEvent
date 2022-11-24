const path = require('path');
const { name, version } = require('../../package.json');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  appName: name,
  newRelicKey: process.env.NEW_RELIC,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  loggerPath: process.env.LOGGER_PATH,
  pkgConfig: {
    name,
    version,
  },
  pg: {
    uri: process.env.DEV_DATABASE_URL,
  },
  queue_delay: 10000,//in milli-second
  eventQueue: process.env.EVENT_QUEUE,
  sqs: {
    region: process.env.AWS_APAC_MUM_REGION,
    apiVersion: process.env.AWS_API_VERSION
  },
  ses: {
    email_endpoint: process.env.SEND_EMAIL_URL,
    email_endpoint_token: process.env.SEND_EMAIL_TOKEN,
    send_email: true,
    email_list: process.env.SEND_EMAIL_TOKEN.FAILED_TRANSFERS_MAILING_LIST
  },
  aws: {
    AWSAccess: process.env.AWS_ACCESS_KEY_ID,
    AWSSecret: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_APAC_MUM_REGION
  },
  paymentsServiceEndpoints: {
    fetch_attribute_url: process.env.FETCH_ATTRIBUTE_URL,
    orderid_lookup_url: process.env.ORDER_ID_LOOKUP_URL,
    fetch_customer_details_url: process.env.FETCH_CUSTOMER_DETAILS_URL,
    payments_host: process.env.PAYMENT_HOST,
    jwt_token: process.env.VAN_ATTRIBUTION_TOKEN
  },
  accountServiceVars: {
    capture_payment_url: process.env.ACCOUNT_SERVICE_CAPTURE_URL,
    jwt_token: process.env.ACCOUNT_SERVICE_TOKEN,
    account_service_host: process.env.ACCOUNT_SERVICE_HOST
  },
  razorpay: {
    url: 'https://api.razorpay.com',
    payment_uri: '/v1/payments',
    transfer_uri: '/transfers',
    PUBLIC_KEY: process.env.RZPAY_PUBLIC_KEY,
    PRIVATE_KEY: process.env.RZPAY_PRIVATE_KEY,
  },
  redisconf: {
    url: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
  },
  paymentsQueue: process.env.PAYMENTS_QUEUE,
  paymentsQueueListen: process.env.PAYMENTS_QUEUE_LISTEN,
  delayBeforeRequeue: 600,
};
