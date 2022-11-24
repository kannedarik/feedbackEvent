/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const {
  flattenDeep,
  groupBy,
  map,
  has,
  compact,
  concat,
  filter,
  cloneDeep,
  includes,
  omit,
} = require('lodash');

const httpStatus = require('http-status');
const paymentService = require('../../services/payments');
const coreService = require('../../services/core');
const { groupColors, repledgeMessage } = require('../../../config/vars');

/**
 * version 3 for customer list
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Promise<any>>}
 */
exports.customerList = async (req, res, next) => {
  try {
    const { token } = req.user;
    // Get user loans data from payments
    const paymentsdata = await paymentService.userloans(token);
    const maploansdata = await coreService.mapLoansVersion4(paymentsdata.refid, token);
    let loans = list(paymentsdata, maploansdata, '', [], true);
    loans = enhanceLoanObject(loans);
    loans = {
      ...loans,
      code: httpStatus.OK,
    };
    return res.json(loans);
  } catch (error) {
    return next(error);
  }
};

/**
 * version 3 of support list API
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.supportList = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { userid } = req.query;
    // Get user loans data from payments
    const paymentsdata = await paymentService.supportuserloans(token, userid);
    const maploansdata = await coreService.supportMapLoansVersion4(paymentsdata.refid, token);
    let loans = list(paymentsdata, maploansdata, '', ['kvb', 'federal', 'icici']);
    loans = {
      ...loans,
      code: httpStatus.OK,
    };
    return res.json(loans);
  } catch (error) {
    return next(error);
  }
};

/**
 * Filtering loans for display based on tenure extension changes
 * @private
 */
const isVisibleLoan = (loans, id) => {
  if (has(loans, id)) {
    const loandata = loans[id][0]; // Need to take this as above object is groupby
    if (!loandata.repledged) return [true, loandata];
    return [false, null];
  }
  return [false, null];
};

/**
 * Get all active loans per customer
 * @private
 */
const list = (paymentsdata, maploansdata, filterType, lenderFilter, isTakeOver) => {
  let colors = cloneDeep(groupColors);
  const takeoverLoansGroup = isTakeOver ? groupBy(paymentsdata.takeoverLoans, 'ref_no') : [];
  // Need to merge all loans from payments considering tenure extension
  const paymentloans = flattenDeep(paymentsdata.loans);
  const repledgedloans = flattenDeep(paymentsdata.repledgedLoans);
  const allloans = groupBy(concat(paymentloans, repledgedloans), 'coreid');
  // Get mapped loans data from core
  const groupedloanstotal = compact(map(maploansdata, (group) => {
    let grouptype;
    const grouploans = compact(map(group, (g) => {
      // Populate data for secure loans
      grouptype = g.type;
      const secloans = compact(map(g.loans, (loan) => {
        const [isVisible, loandata] = isVisibleLoan(allloans, loan.loanid);
        if (isVisible && loan) {
          if (lenderFilter.length > 0) {
            const loandetails = loandata;
            if (includes(lenderFilter, loandetails.lenderid)) {
              return {
                ...loandetails,
                eligibleweight: loan.eligibleweight,
                type: grouptype,
              };
            }
            return null;
          }
          const loandetails = loandata;
          return {
            ...loandetails,
            eligibleweight: loan.eligibleweight,
            type: grouptype,
          };
        }
        return null;
      }));
      if (g.uloanid) {
        const [isVisible, loandata] = isVisibleLoan(allloans, g.uloanid);
        if (isVisible) {
          const secloanids = map(secloans, secloan => secloan.coreid);
          const unsecloan = {
            ...loandata,
            secloanids,
            type: grouptype,
            showmessage: g.showmessage,
          };
          return concat(secloans, [unsecloan]);
        }
      }
      return secloans;
    }));
    const grouploanstransformed = filter(grouploans, array => array.length);
    // eslint-disable-next-line max-len
    // getting the first secured loan from 1:1 loan, if the secured loan ref_no corresponds to takeover loan then ...
    if (grouploanstransformed.length > 0 && grouploanstransformed[0].length > 0) {
      const firstSecLoan = grouploanstransformed[0][0];
      if (has(takeoverLoansGroup, firstSecLoan.ref_no)) {
        grouploanstransformed.push([takeoverLoansGroup[firstSecLoan.ref_no][0]]);
      }
    }
    if (colors && !colors.length) colors = cloneDeep(groupColors);
    return {
      loans: grouploanstransformed,
      color: colors.pop(),
      type: grouptype,
    };
  }));
  // eslint-disable-next-line max-len
  const groupedloanstotaltransformed = filter(groupedloanstotal, grouploans => grouploans.loans.length);
  // eslint-disable-next-line consistent-return,max-len
  const filteredloans = filter(groupedloanstotaltransformed, (loan) => { if (loan.type !== filterType) return true; });
  const { hasPending } = paymentsdata;
  const pendingMesg = has(paymentsdata, 'pendingMesg') ? paymentsdata.pendingMesg : 'No pending message';
  return {
    message: 'Mapped loan categories successfully',
    mappedloans: filteredloans,
    hasPending,
    pendingMesg,
    repledgeMessage,
  };
};


const enhanceLoanObject = (loans) => {
  const filteredLoanObjects = loans;
  filteredLoanObjects.mappedloans = map(filteredLoanObjects.mappedloans, (data) => {
    data.loans = map(data.loans, loan => map(loan, l => omit(l, ['createdAt', 'updatedAt', 'referencenumber', 'isurecode', 'dayselapsed', 'preclosurecharges', 'preclosure',
      'fetchedon', 'razorpayvan', 'repledged', 'loan_count', 'ltv', 'recoverytype', 'repledgeverifytype', 'expirydate', 'masterschemeid', 'currentslab', 'oldlploanid',
      'loanof', 'payment', 'allowRepledge'])));
    data.loans = map(data.loans, loan => map(loan, (l) => {
      if (l.secureschemeloan) {
        l.secureschemeloan = omit(l.secureschemeloan, 'loanof');
      }
      return l;
    }));
    return data;
  });
  return filteredLoanObjects;
};
