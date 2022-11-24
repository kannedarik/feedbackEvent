const httpStatus = require('http-status');
const paymentService = require('../../services/payments');
const coreService = require('../../services/core');
const loansUtils = require('../../utils/loans.util');
const paymentsUtils = require('../../utils/payments.util');

// fetch all customer loans details
exports.customerLoans = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { searchId } = req.params;
    const paymentsData = await paymentService.customerloans(token, searchId);
    // eslint-disable-next-line max-len
    const maploansData = await coreService.supportMapLoansVersion5(paymentsData.user.refid, token, true, true);
    await loansUtils.updateLoansWithAccountService(token, maploansData, paymentsData.user);
    const customerLoansResponse = await loansUtils.transformPaymentsData(paymentsData.user);
    return res.json({
      status: httpStatus.OK,
      message: 'customer loans fetched successfully',
      loans: customerLoansResponse,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch all payment transaction details for given loanids
exports.paymentTransactions = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { secureloanId, unsecureloanId } = req.query;
    const loanids = [secureloanId, unsecureloanId];
    const transactionsData = await paymentsUtils.fetchPaymentTransactions(token, loanids);
    return res.json({
      status: httpStatus.OK,
      message: 'loan payment transactions fetched successfully',
      data: transactionsData,
    });
  } catch (error) {
    return next(error);
  }
};
