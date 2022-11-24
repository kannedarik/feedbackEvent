const { port, env } = require('./config/vars');
// eslint-disable-next-line global-require
if (env === 'production') require('newrelic');

const app = require('./config/express');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => console.info(`API Server started on port ${port} (${env})`)); // eslint-disable-line no-console

/**
* Exports express
* @public
*/
module.exports = app;
