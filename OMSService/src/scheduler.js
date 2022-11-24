const Agenda = require('agenda');
const configVars = require('./config/vars');
const DailyLenderEmailCron = require('./api/scheduledJobs/dailyLenderEmail.cron');
const LoanNotVisibleTicketCreationCron = require('./api/scheduledJobs/loanNotVisibleTicket.cron');
const FreshLoanLNVTicketCreatioCron = require('./api/scheduledJobs/freshLoanLNVTicket.cron');
const { logger } = require('./config/logger');
const AxiosConfig = require('./config/axios');
const { isNewrelicEnabled } = require('./config/vars');

if (isNewrelicEnabled) require('newrelic');

AxiosConfig.addRequestLogInterceptor();
AxiosConfig.addResponseLogInterceptor();

const agenda = new Agenda({
  db: {
    address: configVars.mongo.uri,
  },
});

const scheduledJobs = [
  DailyLenderEmailCron,
];

const ticketCreationJob = [
  LoanNotVisibleTicketCreationCron,
  FreshLoanLNVTicketCreatioCron,
];

scheduledJobs.forEach((job) => {
  agenda.define(job.name, job.fn);
});

ticketCreationJob.forEach((job) => {
  agenda.define(job.name, job.fn);
});

const initiateAgenda = async () => {
  await agenda.start();

  scheduledJobs.forEach(async (job) => {
    await agenda.every(job.frequency, job.name);
  });
};

const shutdownAgenda = async () => {
  await agenda.stop();
  process.exit(0);
};

process.on('SIGTERM', shutdownAgenda);
process.on('SIGINT', shutdownAgenda);

logger.info('Starting up Agenda workers...');
initiateAgenda();
logger.info('Agenda started.');
