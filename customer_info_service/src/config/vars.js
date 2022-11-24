const path = require('path');
const appPackage = require('../../package');
// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  appName: appPackage.name,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  pg: {
    uri: process.env.PG_URI,
  },
  urls: {
    identity: {
      endpoint: process.env.IDENTITY_URI,
      jwtvalidate: '/api/account/jwtvalidate',
      lenderinfo: '/api/public/getlenderinfo',
    },
    core: {
      endpoint: process.env.CORE_URI,
      userfromlploanid: '/api/v3/repledge/getuserfromlploanid',
    },
    lendingmds: {
      endpoint: process.env.LENDINGMDS_URI,
      lenderinfo: '/api/v1/lendingPartners',
    },
  },
  lendingMDS: {
    basic_auth: process.env.LENDINGMDS_AUTH,
  },
  sqs: {
    mis: process.env.MIS_QUEUE,
  },
  secretid: process.env.SECRET_ID,
  secretkey: process.env.SECRET_KEY,
  newRelicKey: process.env.NEW_RELIC,
};
