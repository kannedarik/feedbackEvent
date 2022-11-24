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
  omit,
  remove,
  isEmpty,
  find,
  split,
  keys,
  sumBy,
  isBoolean,
} = require('lodash');
const moment = require('moment');
const httpStatus = require('http-status');
const paymentService = require('../../services/payments');
const coreService = require('../../services/core');
const accountService = require('../../services/accounts');
const lendingMDS = require('../../services/lendingmds');
const cisService = require('../../services/cis');
const loansUtils = require('../../utils/loans.util');
const {
  groupColors, repledgeMessage, loanFilterActions, redisInfo, lenders, discrepancyInfo, rupeekLenderId,
} = require('../../../config/vars');
const redisUtils = require('../../utils/redis.util');
const { logger } = require('../../../config/logger');
const { producttype, accounts, lendersList } = require('../../utils/constants');

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
    const groupedtotalamounts = loansUtils.updateGroupedTotalAmounts(loanGroup.loans);
    if (loans.length > 0) {
      filteredLoanGroups.push({ ...loanGroup, loans, groupedtotalamounts });
    }
    return filteredLoanGroups;
  }, [],
);

/**
 * version 5 for customer list
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
    const [paymentsdata, maploansdata] = await Promise.all([
      paymentService.userloans(token),
      coreService.mapLoansVersion5(req.user.id, token),
    ]);
    updateAuction(maploansdata);
    removedigitalpartreleaseloans(maploansdata);
    await loansUtils.updateLoansWithAccountService(token, maploansdata, paymentsdata);
    await loansUtils.updateLoansWithSchemeDetailsAndDueDates(token, maploansdata, paymentsdata);
    let loans = list(paymentsdata, maploansdata, '', [], true, true);
    // removing unused details from loan object
    loans = enhanceLoanObject(loans);
    hideLoan(loans.mappedloans);
    loans = {
      ...loans,
      code: httpStatus.OK,
    };
    const mappedLoans = map(loans.mappedloans, checkMinimumTenorAndClosingAmount);
    loans.mappedloans = loanFilters(mappedLoans, {
      repaymentType, loanIdsArray, version, useragent,
    });
    // check whether to unblock the release for any loans with medium/high discrepancy
    loans.mappedloans = await unblockRelease(loans);
    if (repaymentType === loanFilterActions.PART_PAYMENT) loans.mappedloans = filterLoansByClosingAmt(loans.mappedloans); // removing loans having secure + unsecure closing amount less than 600
    loans.mappedloans = filterMIPLoans(loans.mappedloans);
    return res.json(loans);
  } catch (error) {
    return next(error);
  }
};

/**
 * version 5 of customer support list API
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.supportcustomerloans = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { phone } = req.query;
    const cisData = await cisService.customerDetailsByPhone(phone);
    if (isEmpty(cisData)) {
      logger.error('Response not received from CIS service');
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
    const customerId = cisData.user._id;
    const [paymentsdata, maploansdata, lendingPartnerData] = await Promise.all([
      paymentService.customerloans(token, phone),
      coreService.supportMapLoansVersion5(customerId, token, true, true),
      lendingMDS.getLenders(),
    ]);
    addAuction(maploansdata, paymentsdata);
    await loansUtils.updateLoansWithAccountService(token, maploansdata, paymentsdata.user);
    await loansUtils.updateLoansWithSchemeDetailsAndDueDates(token, maploansdata, paymentsdata.user);
    addLendingPartnerName(paymentsdata, maploansdata, lendingPartnerData.data);
    const federalLoanIds = flattenDeep(paymentsdata.user.loans).filter(loan => loan.lenderid === lenders.federal).map(obj => obj.loanid);
    let totalChargesCalculated = [];
    if (federalLoanIds.length > 0) {
      const charges = await accountService.accountsCharges(federalLoanIds, token);
      const chargesWithoutPenal = charges.filter(charge => charge.type !== 'PENAL');
      totalChargesCalculated = map(groupBy(chargesWithoutPenal, 'lmsId'), (keyVal, lmsId) => ({ lmsId, totalCharges: sumBy(keyVal, 'value') }));
    }
    mergeChargesWithLoansData(paymentsdata, totalChargesCalculated);
    return res.json(paymentsdata);
  } catch (error) {
    return next(error);
  }
};


exports.customerloans = async (req, res, next) => {
  try {
    const { token } = req.user;
    const { phone } = req.query;
    const paymentsData = await paymentService.loans(token, phone);
    const paymentLoans = paymentsData.user.loans;
    const maploansdata = await coreService.supportMapLoansVersion5(paymentsData.user.refid, token, true, true);

    // Get lenderBranchDetails
    const loanidToLenderBranchMapping = loansUtils.getLenderMapping(maploansdata);

    // Filter the loans for which ipc values needs to be fetched from account-service
    const filteredLoans = await loansUtils.filterAccountLoans(paymentLoans, loanidToLenderBranchMapping);
    if (isEmpty(filteredLoans)) { return res.json(paymentsData); }

    // Fetch ipc values for the filtered loans
    const accountLoansViews = await accountService.accountsLoansViews(keys(filteredLoans), true, token);
    if (isEmpty(accountLoansViews) || isEmpty(accountLoansViews.data)) return res.json(paymentsData);

    // Update the ipc values for the fetched loans
    const gbAccountLoansByLmsId = groupBy(accountLoansViews.data, 'customerRupeekView.lmsId');
    await paymentLoans.forEach((loan) => {
      if (!isEmpty(gbAccountLoansByLmsId[loan.loanid])
        && !isEmpty(gbAccountLoansByLmsId[loan.loanid][0].customerRupeekView)) {
        loansUtils.mergeLoansValues({
          paymentsLoan: loan,
          excessFunding: true,
          customerRupeekViewLoan: gbAccountLoansByLmsId[loan.loanid][0].customerRupeekView,
          discrepancyPresent: gbAccountLoansByLmsId[loan.loanid][0].discrepancyPresent,
          discrepancyView: gbAccountLoansByLmsId[loan.loanid][0].discrepancyView,
          lenderViewLoan: gbAccountLoansByLmsId[loan.loanid][0].lenderView,
          gbLoanid: null,
          nwdAccounts: gbAccountLoansByLmsId[loan.loanid][0].currentWorkingDayInterestDTO,
          schemeData: gbAccountLoansByLmsId[loan.loanid][0].schemeData,
          loanStatus: gbAccountLoansByLmsId[loan.loanid][0].loanStatus,
          loanAmount: gbAccountLoansByLmsId[loan.loanid][0].loanAmount,
          startedOn: gbAccountLoansByLmsId[loan.loanid][0].sanctionDate,
        });
      }
    });

    return res.json(paymentsData);
  } catch (error) {
    return next(error);
  }
};

exports.listAllCustomerLoans = async (req, res, next) => {
  try {
    const { token } = req.user;
    const searchId = req.user.id;
    const paymentsData = await paymentService.customerloans(token, searchId);
    // eslint-disable-next-line max-len
    const maploansData = await coreService.mapLoansVersion5(paymentsData.user.refid, token);
    await loansUtils.updateLoansWithAccountService(token, maploansData, paymentsData.user);
    const customerLoansResponse = await loansUtils.transformPaymentsData(paymentsData.user);
    const loansResponse = map(customerLoansResponse, (loan) => {
      const lenderArray = [loan.lender];
      if (loan.secure_loanid && loan.unsecure_loanid) {
        lenderArray.push(lendersList.rupeek);
      }
      return {
        ...loan,
        lender: lenderArray,
      };
    });
    return res.json({
      status: httpStatus.OK,
      message: 'customer loans fetched successfully',
      response: loansResponse,
    });
  } catch (error) {
    return next(error);
  }
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

const loanFilterActionMapping = {
  [loanFilterActions.REPLEDGE]: isComponentRepledgeAllowed,
  [loanFilterActions.PAY_INTEREST]: isComponentInterestPayable,
  [loanFilterActions.CLOSE_LOAN]: isComponentClosable,
  [loanFilterActions.PART_PAYMENT]: isComponentPartPayable,
  [loanFilterActions.PART_RELEASE]: alwaysAcceptLoanComponent,
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
    let productType;
    const grouploans = compact(map(group, (g) => {
      // Populate data for secure loans
      grouptype = g.type;
      ({ productType } = g);
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
            ...(g.productType === producttype.CLM && {
              clmSupportedLender: ['rupeek'],
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
      groupedtotalamounts: loansUtils.updateGroupedTotalAmounts(grouploanstransformed),
      color: colors.pop(),
      type: grouptype,
      productType,
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
      'fetchedon', 'razorpayvan', 'repledged', 'loan_count', 'recoverytype', 'repledgeverifytype', 'expirydate', 'masterschemeid', 'currentslab', 'oldlploanid',
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
        const auctionActionMapper = {
          auctionAction: group.auctionAction,
          lploanid: group.ulploanid,
        };
        if (auctionActionMapper.auctionAction && !isBoolean(auctionActionMapper.auctionAction.enable)) {
          auctionActionMapper.auctionAction.enable = true;
        }
        mappedobjects.push(auctionActionMapper);
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
        if (auctionActionMapper.auctionAction && !isBoolean(auctionActionMapper.auctionAction.enable)) {
          auctionActionMapper.auctionAction.enable = true;
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

const updateAuction = (maploansdata) => {
  map(maploansdata, (mappedloan) => {
    map(mappedloan, (group) => {
      if (group.auctionAction && !isBoolean(group.auctionAction.enable)) {
        group.auctionAction.enable = true;
      }
      map(group.loans, (loan) => {
        if (loan.auctionAction && !isBoolean(loan.auctionAction.enable)) {
          loan.auctionAction.enable = true;
        }
      });
    });
  });
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

const mergeChargesWithLoansData = (paymentsdata, charges) => {
  paymentsdata.user.loans.map((loan) => {
    loan.map((item) => {
      const loanObj = item;
      const chargeFound = charges.find(chargeObj => chargeObj.lmsId === loanObj.loanid);
      loanObj.totalCharges = chargeFound ? chargeFound.totalCharges : 0; // totalCharges will come as 0 for lenders other than federal
      return loanObj;
    });
    return loan;
  });
};

// to toggle the release
exports.supportToggleRelease = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { blockRelease, releaseBlockDate } = req.query;
    if (!blockRelease) {
      await redisUtils.setToCache(`${redisInfo.keys.unblockRelease}:${loanId}`, 'NOSLAB'); // setting custom flag 'NOSLAB' to change existing priority slab
      redisUtils.expireCache(`${redisInfo.keys.unblockRelease}:${loanId}`, releaseBlockDate); // to auto block the release after the given time
      return res.json({ code: httpStatus.OK, message: `Release unblocked successfully for loan id ${loanId}` });
    }
    const cachedValue = await redisUtils.getFromCache(`${redisInfo.keys.unblockRelease}:${loanId}`); // to check whether value is already removed from cache, if not then delete
    if (isEmpty(cachedValue)) return res.json({ code: httpStatus.OK, message: `Release already blocked for loan id ${loanId}` });
    await redisUtils.deleteFromCache(`${redisInfo.keys.unblockRelease}:${loanId}`); // deleting the custom flag to reset to original priority slab
    return res.json({ code: httpStatus.OK, message: `Release blocked successfully for loan id ${loanId}` });
  } catch (err) {
    return next(err);
  }
};

const toggleReleaseforLenders = [lenders.federal, lenders.kvb];

// mapping over the loans to check which loanid is present in cache for unblocking the release
const unblockRelease = async (loans) => {
  const loansData = await Promise.map(loans.mappedloans, async (mappedloan) => {
    mappedloan.loans = await Promise.map(mappedloan.loans, async (loan) => {
      loan = await Promise.map(loan, async (loanObj) => {
        const cachedValue = await redisUtils.getFromCache(`${redisInfo.keys.unblockRelease}:${loanObj.loanid}`);
        if (!isEmpty(cachedValue) && toggleReleaseforLenders.includes(loanObj.lenderid) && !isEmpty(loanObj.discrepancy) && loanObj.discrepancy.prioritySlab === discrepancyInfo.slabParser.LEVEL2) {
          loanObj.discrepancy.prioritySlab = cachedValue;
        }
        return loanObj;
      });
      return loan;
    });
    return mappedloan;
  });
  return loansData;
};

const addLendingPartnerName = (paymentsdata, maploansdata, lendingPartnerData) => {
  const groupedLendingPartnerData = groupBy(lendingPartnerData, 'coreId');
  const loanidToLenderBranchMapping = loansUtils.getLenderMapping(maploansdata);
  paymentsdata.user.loans.map((loans) => {
    loans.map((loan) => {
      const loanObj = loan;
      let lendingPartnerId;
      if (loanidToLenderBranchMapping[loanObj.loanid] && loanidToLenderBranchMapping[loanObj.loanid][0].lender) {
        lendingPartnerId = loanidToLenderBranchMapping[loanObj.loanid][0].lender;
      } else if (loanObj.lenderid === lenders.rupeek) { // comparing unsecure using lender id because rupeek lender id is not provided by core
        lendingPartnerId = rupeekLenderId;
        const mappedSecureLoanId = loanObj.secureschemeloan && loanObj.secureschemeloan.loanid;
        const mappedSecuredLenderId = loanidToLenderBranchMapping[mappedSecureLoanId] && loanidToLenderBranchMapping[mappedSecureLoanId][0].lender;
        if (loanObj.secureschemeloan) loanObj.secureschemeloan.lendingPartnerName = groupedLendingPartnerData[mappedSecuredLenderId] ? groupedLendingPartnerData[mappedSecuredLenderId][0].lenderName : null;
      } else {
        lendingPartnerId = null;
      }
      loanObj.lendingPartnerName = lendingPartnerId && groupedLendingPartnerData[lendingPartnerId] ? groupedLendingPartnerData[lendingPartnerId][0].lenderName : null;
      return loanObj;
    });
    return loans;
  });
};

const filterLoansByClosingAmt = (mappedloans) => {
  mappedloans.map((loanReq) => {
    loanReq.loans = loanReq.loans.filter(loan => sumBy(loan, e => e.closingamount) >= 600);
    return loanReq;
  });
  return mappedloans.filter(loanReq => loanReq.loans.length > 0);
};

const filterMIPLoans = (mappedloans) => {
  mappedloans.map((loanReq) => {
    loanReq.loans.map(loansArr => remove(loansArr, loanObj => loanObj.loanType === accounts.loanType.MIP && (isEmpty(loanObj.lenderView) || !moment().isSame(moment(loanObj.lenderView.valueRecordedDate), 'day'))));
    loanReq.loans = loanReq.loans.filter(loansArr => loansArr.length);
    return loanReq;
  });
  return mappedloans.filter(loanReq => !isEmpty(loanReq.loans));
};
