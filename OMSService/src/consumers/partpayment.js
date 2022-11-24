/* eslint-disable max-len */
const AWS = require('aws-sdk');
const _ = require('lodash');
const { Consumer } = require('sqs-consumer');
const { logger } = require('../config/logger');
const { sqs, awsConfig } = require('../config/vars');
const ZeebeService = require('../api/services/zeebe.service');
const { workflowIds } = require('../api/utils/constants');

AWS.config.update({
  region: awsConfig.region,
});

logger.info(`Consumer being created for ${sqs.partpayment}`);

const getParsedMessage = (message) => JSON.parse(JSON.parse(message).Message);

const getSecuredAndUnsecuredLoans = (loansArray) => ({
  secureLoan: _.find(loansArray, (loanObject) => loanObject.loan.netweight > 0),
  unsecureLoan: _.find(loansArray, (loanObject) => loanObject.loan.netweight === 0),
});

const createPayload = (secureLoan, unsecureLoan, paymentData) => ({
  loanId: _.get(secureLoan, 'loan.coreid'),
  secureLoanAmount: _.get(secureLoan, 'loan.loanamount'),
  totalWeight: _.get(secureLoan, 'loan.netweight'),
  secureGL: _.get(secureLoan, 'loan.loanid'),
  ...(unsecureLoan && {
    unsecureLoanAmount: _.get(unsecureLoan, 'loan.loanamount'),
    unsecureGL: _.get(unsecureLoan, 'loan.loanid'),
  }),
  paymentDetails: [{
    securePartPaymentAmount: _.get(secureLoan, 'paidamount') - _.get(secureLoan, 'cashback', 0),
    unsecurePartPaymentAmount: _.get(unsecureLoan, 'paidamount') - _.get(unsecureLoan, 'cashback', 0),
    totalPartPaymentAmountPaid: _.get(paymentData, 'payment'),
    securePartPaymentAmountWithCashback: _.get(secureLoan, 'cashback'),
    unsecurePartPaymentAmountWithCashback: _.get(unsecureLoan, 'cashback'),
    totalPartPaymentCashBack: _.get(paymentData, 'payment') + _.get(paymentData, 'cashback', 0),
    rpkId: _.get(secureLoan, 'rtlm.request.requestid'),
    paidAt: _.get(secureLoan, 'rtlm.request.recordedon'),
  }],
});

const app = Consumer.create({
  queueUrl: sqs.partpayment,
  handleMessage: async (message) => {
    logger.info('Part payment queue message received', message);
    const parsedMessageBody = getParsedMessage(message.Body);
    logger.info(`event received in OMS sqs-consumer.\nMessage body:\n${JSON.stringify(parsedMessageBody)}\n`);
    if (parsedMessageBody.eventtype === 'payment-partial') {
      const { secureLoan, unsecureLoan } = getSecuredAndUnsecuredLoans(parsedMessageBody.payment.mappedloans);
      const payload = createPayload(secureLoan, unsecureLoan, parsedMessageBody.payment);
      logger.info(`Invoking oms function for part-release case creation from sqs-consumer.\nMessage body:\n${JSON.stringify(payload)}\n`);
      if (payload.loanId) await ZeebeService.createWorkflowInstance(workflowIds.partrelease.caseCreation, { ...payload });
    }
  },
  sqs: new AWS.SQS(),
});

app.on('error', (err) => {
  logger.error(err);
});

app.on('processing_error', (err) => {
  logger.error(err);
});

app.on('timeout_error', (err) => {
  logger.error(err);
});

app.start();
