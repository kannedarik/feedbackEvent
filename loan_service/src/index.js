const { port, env } = require('./config/vars');
// eslint-disable-next-line global-require
if (env === 'production') require('newrelic');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

const app = require('./config/express');

// listen to requests
// eslint-disable-next-line no-console
app.listen(port, () => console.info(`server started on port ${port} (${env})`));

/**
* Exports express
* @public
*/
module.exports = app;
