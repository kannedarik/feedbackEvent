const path = require('path');
const appPackage = require('../../package');

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  appName: appPackage.name,
  newRelicKey: process.env.NEW_RELIC,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  secretkey: process.env.SECRET_KEY,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  urls: {
    webhook: {
      endpoint: process.env.WEBHOOK_URI,
      leegality: '/api/v1/leegality',
    },
    identity: {
      endpoint: process.env.IDENTITY_URI,
      jwtvalidate: '/api/account/jwtvalidate',
    },
    leegality: {
      request: '/sign/request',
    },
  },
  esign: {
    storage: {
      bucket: process.env.ESIGN_BUCKET,
      region: 'us-east-1',
    },
    provider: 'AADHAAR',
    modes: [
      'OTP',
    ],
    document: {
      extension: 'pdf',
      contentType: 'application/pdf',
    },
  },
  digital: {
    attempts: 3,
    length: 4,
  },
  sqs: {
    webhook: process.env.WEBHOOK_QUEUE,
  },
};
