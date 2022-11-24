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
  get,
  cloneDeep,
  includes,
  isEmpty,
  keys,
  omit,
  split,
  remove,
  find,
} = require('lodash');
const moment = require('moment');
const httpStatus = require('http-status');
const paymentService = require('../../services/payments');
const coreService = require('../../services/core');
const accountService = require('../../services/accounts');
const loansUtils = require('../../utils/loans.util');
const { groupColors, repledgeMessage, loanFilterActions } = require('../../../config/vars');

const isComponentSecure = loanComponent => loanComponent.netweight > 0;
const isComponentInterestPayable = loanComponent => loanComponent.interest > 0;
const isComponentPartPayable = loanComponent => loanComponent.closingamount > 0;
const isComponentClosable = loanComponent => loanComponent.closingamount > 0;
const isComponentRepledgeAllowed = loanComponent => isComponentSecure(loanComponent)
  && loanComponent.allowRepledgeV2;
/**
 * In some cases such as part release we want to always return
 * all the loans. For such actions we can always return true.
 */
const alwaysAcceptLoanComponent = () => true;

/**
 *
 * @param {LoanGroup[]} loanGroups List of loan groups
 * @param {Function} predicate A function that accepts a loan component and returns a boolean
 * @returns {LoanGroup[]} List of loan groups which have at least on loan in loans object
 * after applying `predicate` on the loan component
 */
const loanFilter = (loanGroups, predicate) => loanGroups.reduce(
  (filteredLoanGroups, loanGroup) => {
    const loans = loanGroup.loans.filter(loan => loan.find(predicate));
    if (loans.length > 0) {
      filteredLoanGroups.push({ ...loanGroup, loans });
    }
    return filteredLoanGroups;
  }, [],
);

const loanFilterActionMapping = {
  [loanFilterActions.REPLEDGE]: isComponentRepledgeAllowed,
  [loanFilterActions.PAY_INTEREST]: isComponentInterestPayable,
  [loanFilterActions.CLOSE_LOAN]: isComponentClosable,
  [loanFilterActions.PART_PAYMENT]: isComponentPartPayable,
  [loanFilterActions.PART_RELEASE]: alwaysAcceptLoanComponent,
};

const DEFAULT_MINIMUM_TENOR = 30;
const DEFAULT_MINIMUM_CLOSING_AMOUNT = 25000;

const minimumTenorPerLender = {
  icici: 180,
};
const minimumClosingAmountPerLender = {};

const checkMinimumTenor = (loan) => {
  const lender = loan.lenderid;
  const minimumTenorInDays = get(minimumTenorPerLender, lender, DEFAULT_MINIMUM_TENOR);

  return !loan.repledged && moment().diff(moment(loan.loanstartedon), 'days') > minimumTenorInDays;
};

const checkMinimumClosingAmount = (loan) => {
  const lender = loan.lenderid;
  const minimumClosingAmount = get(
    minimumClosingAmountPerLender, lender, DEFAULT_MINIMUM_CLOSING_AMOUNT,
  );

  return loan.closingamount > minimumClosingAmount;
};

const checkMinimumTenorAndClosingAmount = (mappedLoans) => {
  const results = mappedLoans;
  results.loans = map(mappedLoans.loans, loan => map(loan, (loandata) => {
    if (loandata.netweight <= 0) {
      return loandata;
    }

    const checkedLoan = loandata;
    checkedLoan.allowRepledgeV2 = loandata.allowRepledgeV2
        && checkMinimumTenor(loandata)
        && checkMinimumClosingAmount(loandata);

    return checkedLoan;
  }));

  return results;
};

const loanFilters = (loanGroups, filterParams) => {
  const { repaymentType, loanIdsArray } = filterParams;
  loansUtils.filterIciciLoansForOlderAppVersion(loanGroups, filterParams);
  const filteredLoanGroups = isEmpty(loanIdsArray) ? loanGroups
    : compact(loansUtils.filterLoanGroupsbasedOnLoanIDs(loanGroups, loanIdsArray));
  if (!repaymentType) return filteredLoanGroups;

  const loanFilterPredicate = loanFilterActionMapping[repaymentType];
  if (!loanFilterPredicate) {
    throw new Error(`Filter of type [${repaymentType}] cannot be applied`);
  }
  return loanFilter(filteredLoanGroups, loanFilterPredicate);
};

exports.loanFilters = loanFilters;

/**
 * version 4 for customer list
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Promise<any>>}
 */
exports.customerList = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { repayment_type: repaymentType, loanids } = req.query;
    const version = get(req.headers, 'app-version-code');
    const useragent = get(req.headers, 'user-agent');
    const loanIdsArray = compact(split(loanids, ','));
    // Get user loans data from payments
    const paymentsdata = await paymentService.userloans(token);
    const maploansdata = await coreService.mapLoansVersion5(paymentsdata.refid, token);
    removedigitalpartreleaseloans(maploansdata);
    await loansUtils.updateLoansWithAccountService(token, maploansdata, paymentsdata);
    let loans = list(paymentsdata, maploansdata, '', [], true, true);
    // removing unused details from loan object
    loans = enhanceLoanObject(loans);
    hideLoan(loans.mappedloans);
    removeAuctionDisableLoans(loans.mappedloans);
    loans = {
      ...loans,
      code: httpStatus.OK,
    };
    const mappedLoans = map(loans.mappedloans, checkMinimumTenorAndClosingAmount);
    loans.mappedloans = loanFilters(mappedLoans, {
      repaymentType, loanIdsArray, version, useragent,
    });
    return res.json(loans);
  } catch (error) {
    return next(error);
  }
};

/**
 * version 4 of support list API
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.supportList = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { userid } = req.query;
    const paymentsdata = await paymentService.supportuserloans(token, userid);
    // eslint-disable-next-line max-len
    const maploansdata = await coreService.supportMapLoansVersion5(paymentsdata.refid, token, true, true);
    await loansUtils.updateLoansWithAccountService(token, maploansdata, paymentsdata);
    let loans = list(paymentsdata, maploansdata, '', ['kvb', 'federal', 'icici'], false, true);
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
 * version 4 of customer support list API
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.supportcustomerloans = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { phone } = req.query;
    const paymentsdata = await paymentService.customerloans(token, phone);
    // eslint-disable-next-line max-len
    const maploansdata = await coreService.supportMapLoansVersion5(paymentsdata.user.refid, token, true, true);
    addAuction(maploansdata, paymentsdata);
    await loansUtils.updateLoansWithAccountService(token, maploansdata, paymentsdata.user);
    return res.json(paymentsdata);
  } catch (error) {
    return next(error);
  }
};

/**
 * version 4 of support aggregate loans jewels
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.supportaggregateloansjewels = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { id } = req.query;
    const paymentsdata = await paymentService.aggregateloanjewels(token, id);
    // eslint-disable-next-line max-len
    const maploansdata = await coreService.supportMapLoansVersion5(paymentsdata.user.refid, token, true, true);
    await loansUtils.updateLoansWithAccountService(token, maploansdata, paymentsdata.user, true);
    return res.json(paymentsdata);
  } catch (error) {
    return next(error);
  }
};

/**
 * version 4 of updating loans ipc values w.r.t account-service
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.updatePaymentLoansWithAccountService = async (req, res, next) => {
  try {
    const { loansData } = req.body;
    const { token } = req.user;
    const groupByLoanid = groupBy(loansData, 'loanid');
    const paymentsData = await paymentService.paymentsLoanData(token, keys(groupByLoanid));
    // all loans for which ipc values needs to fetch from account-service
    const filteredLoans = await loansUtils.filterAccountLoans(paymentsData, groupByLoanid);
    // flag will be set to false if loans will be fetched from accountservice else default true
    let payments = true;
    if (!isEmpty(filteredLoans)) {
      // get loansobject based on lender and customer views for filteredloans from account-service
      const accountLoansViews = await accountService
        .accountsLoansViews(keys(filteredLoans), true, token);
      const gbAccountsLoanByLoanids = groupBy(accountLoansViews.data, 'customerRupeekView.lmsId');
      payments = loansUtils.mergeLoans(gbAccountsLoanByLoanids, paymentsData, false, groupByLoanid);
      if (!payments) {
        return res.status(httpStatus.OK)
          .json({ payments, loans: paymentsData });
      }
    }
    return res.status(httpStatus.OK)
      .json({ payments, loans: [] });
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
// eslint-disable-next-line max-len
const list = (paymentsdata, maploansdata, filterType, lenderFilter, isTakeOver, charges = false) => {
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
                ...(charges && loan.coreDetails && {
                  coreDetails: loan.coreDetails,
                }),
                eligibleweight: loan.eligibleweight,
                ...(loan.auctionAction && {
                  auctionAction: loan.auctionAction,
                }),
                ...(loan.hideLoan && {
                  hideLoan: loan.hideLoan,
                }),
                type: grouptype,
              };
            }
            return null;
          }
          const loandetails = loandata;
          return {
            ...loandetails,
            ...(charges && loan.coreDetails && {
              coreDetails: loan.coreDetails,
            }),
            eligibleweight: loan.eligibleweight,
            ...(loan.auctionAction && {
              auctionAction: loan.auctionAction,
            }),
            ...(loan.hideLoan && {
              hideLoan: loan.hideLoan,
            }),
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
            ...(charges && g.uloanCoreDetails && {
              coreDetails: g.uloanCoreDetails,
            }),
            ...(g.auctionAction && {
              auctionAction: g.auctionAction,
            }),
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
  const filteredloans = filter(groupedloanstotaltransformed, (loan) => {
    if (loan.type !== filterType) return true;
  });
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

/**
 * enhancing response payload for api/v4/loans api by removing unused info from loans object
 * @private
 */
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

const removedigitalpartreleaseloans = (maploansdata) => {
  Object.values(maploansdata).forEach((loanRequestLoans) => {
    remove(
      loanRequestLoans, loanRequestLoan => (
        (loanRequestLoan.loans.length === 1)
        && (loanRequestLoan.loans[0].digitalpartreleaseinitiated ? loanRequestLoan.loans[0].digitalpartreleaseinitiated : false)),
    );
    remove(maploansdata, loanRequestLoansArray => (loanRequestLoansArray.length === 0));
  });
};

const addAuction = (maploansdata, paymentsdata) => {
  const mappedobjects = [];
  map(maploansdata, (mappedloan) => {
    map(mappedloan, (group) => {
      let mappedLoanIdAndLploanid;
      if (group.repledgehistory && !isEmpty(group.repledgehistory)) {
        // eslint-disable-next-line consistent-return
        mappedLoanIdAndLploanid = map(group.repledgehistory, (repledgedLoan) => {
          if (repledgedLoan.loanid && repledgedLoan.oldlploanid) {
            return {
              loanid: repledgedLoan.loanid,
              lploanid: repledgedLoan.oldlploanid,
            };
          }
        });
      }
      if (group.auctionAction) {
        mappedobjects.push({
          auctionAction: group.auctionAction,
          lploanid: group.ulploanid,
        });
      }
      map(group.loans, (loan) => {
        const auctionActionMapper = {};
        if (loan.lploanid && loan.auctionAction) {
          auctionActionMapper.lploanid = loan.lploanid.toString();
          auctionActionMapper.auctionAction = loan.auctionAction;
        } else if (isEmpty(loan.lploanid) && loan.auctionAction) {
          const mapvalue = find(mappedLoanIdAndLploanid, { loanid: loan.loanid });
          if (!isEmpty(mapvalue)) {
            auctionActionMapper.lploanid = mapvalue.lploanid;
            auctionActionMapper.auctionAction = loan.auctionAction;
          }
        }
        mappedobjects.push(auctionActionMapper);
      });
    });
  });

  map(paymentsdata.user.loans, (group) => {
    map(group, (loan) => {
      const result = find(mappedobjects, { lploanid: loan.loanid });
      if (result) {
        // eslint-disable-next-line no-param-reassign
        loan.auctionAction = result.auctionAction;
      }
    });
  });
};

const removeAuctionDisableLoans = (mappedloans) => {
  map(mappedloans, (mappedloan) => {
    let isDisable;
    map(mappedloan.loans, (group) => {
      map(group, ((loan) => {
        if (loan.auctionAction && loan.auctionAction.enable !== undefined) {
          isDisable = !loan.auctionAction.enable;
        }
      }));
    });
    if (isDisable) {
      // eslint-disable-next-line no-param-reassign
      mappedloan.disable = true;
    }
  });
  remove(mappedloans, mappedloan => mappedloan.disable);
};

/**
   * removing the loans which have hideloan key value
   * currently it is for part release automation.LOS Service will update the core db for it
   * In future any service can use this flag to remove the loan
   * @private
   */
const hideLoan = (mappedloans) => {
  map(mappedloans, (mappedloan) => {
    const loanGroup = [];
    map(mappedloan.loans, (group) => {
      let isDisable = false;
      map(group, ((loan) => {
        if (loan.hideLoan) {
          isDisable = loan.hideLoan.enable;
        }
      }));
      if (!isDisable) {
        loanGroup.push(group);
      }
    });
    mappedloan.loans = loanGroup;
  });
  remove(mappedloans, mappedloan => isEmpty(mappedloan.loans));
};
