const { keyBy, isEmpty } = require('lodash');
const httpStatus = require('http-status');
const coreService = require('../../services/core');
const cisService = require('../../services/cis');
const accountService = require('../../services/accounts');
const lendingMDS = require('../../services/lendingmds');
const { logger } = require('../../../config/logger');

exports.loans = async (req, res, next) => {
  try {
    const { token } = req.user;
    const response = await accountService.accountsLoans(req.query, token);
    return res.json(response);
  } catch (err) {
    return next(err);
  }
};

exports.loandetails = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { lmsId } = req.query;
    const coreResponse = await coreService.loanMapUser({ lmsids: lmsId });
    if (isEmpty(coreResponse[0])) {
      logger.error('Response not received from core');
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!coreResponse[0].customer || !coreResponse[0].customer.id) {
      return res.status(httpStatus.BAD_REQUEST).send(`Customer not found for lms id ${lmsId}`);
    }
    if (isEmpty(coreResponse[0].securedLoan)) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Secured loan not present');
    }
    const securedLmsId = coreResponse[0].securedLoan.lploanid;
    // eslint-disable-next-line max-len
    const unsecuredLmsId = !isEmpty(coreResponse[0].unsecuredLoan) ? coreResponse[0].unsecuredLoan.lploanid : null;
    const custId = coreResponse[0].customer.id;
    const [cisData, accountsData, lendingMdsData] = await Promise.all([
      cisService.customerDetails(custId),
      // eslint-disable-next-line max-len
      accountService.accountsLoansViews([securedLmsId, ...(!isEmpty(unsecuredLmsId) ? [unsecuredLmsId] : [])], true, token),
      lendingMDS.getLenders(),
    ]);
    if (isEmpty(cisData) || isEmpty(accountsData) || isEmpty(lendingMdsData)) {
      return res.sendStatus(httpStatus.BAD_GATEWAY);
    }
    const groupedLendingMdsData = keyBy(lendingMdsData.data, 'coreId');
    if (isEmpty(accountsData.data)) {
      logger.error('Loan not found in accounts service');
      return res.status(httpStatus.BAD_REQUEST).send('Loan not found');
    }
    const goupedAccountsLoan = keyBy(accountsData.data, 'customerRupeekView.lmsId');
    const securedLoan = goupedAccountsLoan[securedLmsId];
    const unsecuredLoan = !isEmpty(unsecuredLmsId) ? goupedAccountsLoan[unsecuredLmsId] : {};
    const data = {
      customerInfo: {
        customerFirstName: cisData.user.firstname,
        customerLastName: cisData.user.lastname,
        phoneNumbers: cisData.user.phone,
        customerId: cisData.user._id,
      },
      loanMap: {
        securedLmsId,
        ...(!isEmpty(unsecuredLmsId) && { unsecuredLmsId }),
        securedLenderSlug: groupedLendingMdsData[securedLoan.customerRupeekView.lenderId].slug,
      },
      loanDetails: {
        lenderId: securedLoan.customerRupeekView.lenderId,
        loanStatus: securedLoan.loanStatus,
        // eslint-disable-next-line max-len
        loanAmount: securedLoan.loanAmount + (unsecuredLoan.loanAmount ? unsecuredLoan.loanAmount : 0),
        // eslint-disable-next-line max-len
        closingAmount: securedLoan.customerRupeekView.closingAmount + (unsecuredLoan.customerRupeekView ? unsecuredLoan.customerRupeekView.closingAmount : 0),
        schemeName: securedLoan.schemeData.appschemename,
        securedBaseScheme: securedLoan.schemeData.name,
        securedClosingAmount: securedLoan.customerRupeekView.closingAmount,
        securedLoanAmount: securedLoan.loanAmount,
        securedLoanStartDate: securedLoan.sanctionDate,
        securedLosId: coreResponse[0].securedLoan.loanid,
        ...(!isEmpty(unsecuredLoan) && {
          unsecuredBaseScheme: unsecuredLoan.schemeData.name,
          unsecuredClosingAmount: unsecuredLoan.customerRupeekView.closingAmount,
          unsecuredLoanAmount: unsecuredLoan.loanAmount,
          unsecuredLoanStartDate: unsecuredLoan.sanctionDate,
          unsecuredLosId: coreResponse[0].unsecuredLoan.loanid,
        }),
      },
    };
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};
