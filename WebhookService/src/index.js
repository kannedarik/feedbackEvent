require('newrelic');

const apm = require('elastic-apm-node');

apm.start({
  active: process.env.NODE_ENV === 'production',
});

const { port, env } = require('./config/vars');

const app = require('./config/express');

// listen to requests
app.listen(port, () => console.info(`API Server started on port ${port} (${env})`)); // eslint-disable-line no-console

/**
* Exports express
* @public
*/
module.exports = app;
