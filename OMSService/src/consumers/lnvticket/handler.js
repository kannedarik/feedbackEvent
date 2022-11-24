/* eslint-disable no-unused-vars */
const _ = require('lodash');
const Agenda = require('agenda');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const NotificationCache = require('../../api/utils/cache/notification');
const configVars = require('../../config/vars');
const { logger } = require('../../config/logger');

const agenda = new Agenda({
  db: {
    address: configVars.mongo.uri,
  },
});

const handleMessage = async (message) => {
  try {
    const body = JSON.parse(message.Body);
    const loan = JSON.parse(body.Message);

    if (loan.statuscode !== 3.5 || loan.parentpartreleasetransaction) {
      return;
    }
    const checkoutTime = loan.timestamps.checkout;
    logger.info(`checkout time: ${checkoutTime}`);
    if (!moment(moment().startOf('day')).isSame(moment(checkoutTime).startOf('day'))) {
      return;
    }
    logger.info(`loan message received: ${JSON.stringify(loan.loans)}`);
    logger.info(`loan customer message received: ${JSON.stringify(loan.requester)}`);
    const coreIds = _.map(loan.loans, (ln) => ln.loanid).join();
    const jobs = await agenda.jobs({ name: 'FreshLoanLNVTicket', 'data.custom.coreIds': coreIds });
    if (!_.isEmpty(jobs)) {
      logger.info(`job already scheduled: ${jobs}`);
      return;
    }
    const [category, provider, type] = await Promise.all([
      NotificationCache.getCategories('transactional'),
      NotificationCache.getProviders('salesforce'),
      NotificationCache.getTypes('ticket'),
    ]);
    const data = {
      customer:
        {
          id: loan.requester.id,
          phone: loan.requester.phone,
        },
      category,
      type,
      provider,
      correlationid: uuidv4(),
      custom: {
        processType: 'loanNotVisible',
        type: 'fresh',
        customerId: loan.requester.id,
        customerPhone: loan.requester.phone,
        customerName: loan.requester.firstname + loan.requester.lastname,
        description: 'Loan Not Visible | FreshLoan',
        priority: 'high',
        lenderName: loan.lendingpartner.name,
        lenderBranch: loan.lendingpartner.branch.branchname,
        loanIds: '',
        coreIds: _.map(loan.loans, (ln) => ln.loanid).join(),
      },
    };
    logger.info(`scheduling job data: ${JSON.stringify(data)}`);
    await agenda.schedule('in 4 days', 'FreshLoanLNVTicket', data);
  } catch (error) {
    logger.error('Error while processing an new loan record', error);
  }
};

module.exports = { handleMessage };
