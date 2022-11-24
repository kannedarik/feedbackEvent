const apm = require('elastic-apm-node');

apm.start({
  active: process.env.NODE_ENV === 'production',
});

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const AWS = require('aws-sdk');

// eslint-disable-next-line camelcase
const consumer = require('./consumer');
const { port, env } = require('./config/vars');


const app = require('./config/express');
const mongoose = require('./config/mongoose');
// aws.json contains credentials for S3 access
AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
mongoose.connect();

consumer.on('error', (err) => {
  console.error(err.message);
});

consumer.on('processing_error', (err) => {
  console.error(err.message);
});

consumer.on('timeout_error', (err) => {
  console.error(err.message);
});

consumer.start();

app.listen(port, () => console.info(`API server started on port ${port} (${env})`));

/**
* Exports express
* @public
*/
module.exports = app;
