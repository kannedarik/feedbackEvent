/* eslint-disable max-len */
const {
  add,
  remove,
  orderBy,
  reduce,
  values,
  omit,
} = require('lodash');
const moment = require('moment');
const paymentService = require('../services/payments');
const { paymentTransaction } = require('../../config/vars');

/*
    calls the payments list transaction api for transactions
    filter softRecovery transactions and sort them based on payment time
    transforms the response to secured, unsecured and blended
  */
exports.fetchPaymentTransactions = async (token, loanids) => {
  const params = {
    loanIds: loanids.join(','),
    rtlmfields: paymentTransaction.rtlmFields.join(','),
    requestfields: paymentTransaction.requestFields.join(','),
  };
  const transactionsData = await paymentService.listPaymentTransactions(token, params);
  // filtering out the softrecovery transactions
  remove(transactionsData,
    transaction => (transaction.request && transaction.request.type === 'softrecovery'));
  const filteredTransactions = orderBy(transactionsData, [transaction => moment(transaction.request.recordedon)], ['desc']);
  const transactionResponse = transformTransactionResponse(filteredTransactions);
  return transactionResponse;
};

/*
  seggregate the transactions to secure, unsecure and blended objects
  In case of blended, it will be th sum of secure and unsecure components.
*/
const transformTransactionResponse = (filteredTransactions) => {
  const transactionResponse = reduce(filteredTransactions, (responseObject, transaction) => {
    const { request, loan } = transaction;
    responseObject[(loan && loan.netweight) ? 'secured' : 'unsecured'].push(secureUnsecureResponse(transaction));
    if (request && request.requestid) blendedResponse(responseObject.blended, transaction);
    return responseObject;
  }, { secured: [], unsecured: [], blended: {} });
  transactionResponse.blended = values(transactionResponse.blended);
  return transactionResponse;
};

/*
reponse format for secure and unsecure transactions
*/
const secureUnsecureResponse = (transaction) => {
  const { request, loan } = transaction;
  // incase of a transaction which doesn't have a pgresponse, when payment is in pending state
  const method = (request.pgresponse && request.pgresponse.method) ? `- ${request.pgresponse.method}` : '';
  const errorDescription = (request.pgresponse && request.pgresponse.error_description) ? request.pgresponse.error_description : undefined;
  const trasformedResponse = {
    ...(request && {
      payment_time: (request.recordedon) ? moment(request.recordedon).utc() : undefined,
      pg_mode: request.provider + method,
      error_description: errorDescription,
      status: request.status,
      type: request.type,
      request_id: request.requestid,

    }),
    utr: transaction.utrnumber,
    customer_amount: transaction.paidamount,
    total_amount: add(transaction.paidamount, transaction.cashback),
    cashback: transaction.cashback,
    secure_loanid: (loan && loan.netweight) ? loan.loanid : undefined,
    unsecure_loanid: (loan && !loan.netweight) ? loan.loanid : undefined,
  };
  return trasformedResponse;
};


/*
reponse format for blended transactions
*/
const blendedResponse = (blendedTransactions, transaction) => {
  const { request } = transaction;
  const blendedTransaction = blendedTransactions[request.requestid];
  if (blendedTransaction) {
    blendedTransaction.customer_amount += transaction.paidamount;
    blendedTransaction.total_amount += add(transaction.paidamount, transaction.cashback);
    blendedTransaction.cashback += transaction.cashback;
    return;
  }
  // utr is displayed only for secure and unsecure level
  // eslint-disable-next-line no-param-reassign
  blendedTransactions[request.requestid] = omit(secureUnsecureResponse(transaction), 'utr');
};
