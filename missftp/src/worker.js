// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

const sequelize = require('./config/sequelize');
// Init sequelize
sequelize.init();

const mongoose = require('./config/mongoose');
const agenda = require('./config/agenda');

// open mongoose connection
mongoose.connect();

// Start Agenda Process
agenda.on('ready', () => {
  agenda.start();
  console.info('Worker started');
});
