/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Agenda = require('agenda');
const path = require('path');
const UtilityHelper = require('../api/utils/helper');
const { logger } = require('./logger');
const { mongo } = require('./vars');

/**
 * Agenda Setup
 */
const agenda = new Agenda({ db: { address: mongo.uri, collection: 'events' }, lockLimit: 50 });
// Find all jobs
UtilityHelper.getFilePaths(path.join(__dirname, '../api', 'events')).forEach((file) => {
  require(file)(agenda);
});

// agenda hooks for logging
agenda.on('success', (job) => {
  logger.info(job.attrs.name, { status: 'success', data: job.attrs.data });
});
agenda.on('fail', (err, job) => {
  logger.error(job.attrs.name, { status: 'fail', data: job.attrs.data, error: err });
});

module.exports = agenda;
