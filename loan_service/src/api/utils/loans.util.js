/* eslint-disable max-len */
const {
  flattenDeep,
  groupBy,
  map,
  concat,
  isEmpty,
  keys,
  compact,
  includes,
  values,
  difference,
  remove,
  findIndex,
  get,
  isEqual,
  sumBy,
  isArray,
  find,
  forEach,
  uniq,
  orderBy,
  isNumber,
  reduce,
  omit,
} = require('lodash');
const moment = require('moment');
const accountService = require('../services/accounts');
const redisUtils = require('./redis.util');
const lmsService = require('../services/accounts');
const omsService = require('../services/oms');
const coreService = require('../services/core');
const schemeEngineService = require('../services/schemeengine');
const losService = require('../services/los');
const lendingMDSUtil = require('./lendingmds.util');
const {
  redisInfo, discrepancyInfo, lenders, loanFilterActions, schemetypes,
} = require('../../config/vars');
const constantUtils = require('./constants');
const { los } = require('./constants');

const isJumping = schemeType => isEqual(schemeType, schemetypes.jumping);
const isValidSchemeInterestRate = interestRate => interestRate > 0;
const isValidBlendedInterestRate = interestRate => interestRate > 0;
const isWithinTat = (date, loanType, turnAroundTime) => date && loanType && moment().diff(moment(date), 'hours', true) <= turnAroundTime * 24;
const isDigitalRenewal = loan => (loan
&& ((isEqual(loan.signingstatus, 'success') && !loan.hasLoanEnhancementLoans)
|| (isEqual(loan.signingstatus, 'success') && loan.hasLoanEnhancementLoans && isEqual(loan.otpconsentstatus, 'success'))));
const isManualRenewal = loan => loan && ((loan.lockbankverification) || (loan.locksign && !isEqual(loan.signingstatus, 'success')));
const getPaymentCaptured = payments => find(payments, payment => payment.status === 'SUCCESS');
const hasNewLoanDetails = newLoanRequestDetails => newLoanRequestDetails && !isEmpty(newLoanRequestDetails.loans);
const isFreshLoan = (loans, partReleasecoreIds) => !isEmpty(loans) && !loans[0].lploanid && !loans[0].orderId && !includes(partReleasecoreIds, loans[0].loanid);

const getLenderMapping = (mapLoansData) => {
  const loanidToLenderBranchMapping = {};
  map(flattenDeep(mapLoansData), (data) => {
    map(data.loans, (l) => {
      loanidToLenderBranchMapping[l.lploanid] = [{
        lender: data.lenderid,
        lenderbranch: data.branchid,
      }];
    });
  });
  return loanidToLenderBranchMapping;
};

// update ipc values of payments-user loans wrt account-service api's
// 1.get the mapping of loanid with its lender& branch id
// 2.filterloans based on if cache values of that lender&branch is account or not
// 3.get the respective loan-data from accounts for the filteredloans
// 4. update ipc values of payments loan which are in filteredloans
exports.updateLoansWithAccountService = async (token, mapLoansData, paymentsData, aggregateloansjewels = false) => {
  try {
    // all loans grouped based on loanid for which ipc values needs to fetch from account-service
    const filteredAccountLoans = await getAccountLoans(mapLoansData, paymentsData);
    // no loans data will be fetched from accounts service
    if (isEmpty(filteredAccountLoans)) return;
    // get loansobject based on lender and customer views for filteredloans from account-service
    const accountLoansViews = await accountService.accountsLoansViews(keys(filteredAccountLoans), true, token);
    if (isEmpty(accountLoansViews) || isEmpty(accountLoansViews.data)) return;
    const gbAccountsLoanByLoanids = groupBy(accountLoansViews.data, 'customerRupeekView.lmsId');
    // update payments loan data with accounts loan ipc-values for specified loanids
    if (aggregateloansjewels) {
      mergeLoans(gbAccountsLoanByLoanids, paymentsData.loans, true);
    } else {
      map(paymentsData.loans, (data) => {
        mergeLoans(gbAccountsLoanByLoanids, data, true);
      });
      map(paymentsData.repledgedLoans, (data) => {
        mergeLoans(gbAccountsLoanByLoanids, data, true);
      });
    }
  } catch (e) {
    throw new Error(`some unexpected error while updating user loans with accountservice loans: ${e}`);
  }
};

const getAccountLoans = async (mapLoansData, paymentsData) => {
  // mapping for loanid with its branchid & lenderid
  const loanidsLenderBranchMapping = getLenderMapping(mapLoansData);

  const allLoans = compact(flattenDeep(concat(paymentsData.loans, paymentsData.repledgedLoans)));

  // all loans grouped based on loanid for which ipc values needs to fetch from account-service
  return filterAccountLoans(allLoans, loanidsLenderBranchMapping);
};

const mergeLoans = (gbAccountsLoanByLoanids, loans, excessFunding, gbLoanid) => {
  let payments = true;
  map(loans, (loan) => {
    if (!isEmpty(gbAccountsLoanByLoanids[loan.loanid])
    && !isEmpty(gbAccountsLoanByLoanids[loan.loanid][0].customerRupeekView)) {
      payments = false;
      const securedPaymentLoan = loan.lenderid === lenders.rupeek ? loan.secureschemeloan : loan;
      const securedAccountLoan = securedPaymentLoan ? gbAccountsLoanByLoanids[securedPaymentLoan.loanid] : undefined;
      mergeLoansValues({
        paymentsLoan: loan,
        excessFunding,
        customerRupeekViewLoan: gbAccountsLoanByLoanids[loan.loanid][0].customerRupeekView,
        discrepancyPresent: gbAccountsLoanByLoanids[loan.loanid][0].discrepancyPresent,
        discrepancyView: gbAccountsLoanByLoanids[loan.loanid][0].discrepancyView,
        lenderViewLoan: gbAccountsLoanByLoanids[loan.loanid][0].lenderView,
        gbLoanid,
        nwdAccounts: gbAccountsLoanByLoanids[loan.loanid][0].currentWorkingDayInterestDTO,
        schemeData: gbAccountsLoanByLoanids[loan.loanid][0].schemeData,
        loanStatus: gbAccountsLoanByLoanids[loan.loanid][0].loanStatus,
        sanctionDate: securedAccountLoan ? securedAccountLoan[0].sanctionDate : gbAccountsLoanByLoanids[loan.loanid][0].sanctionDate,
        discrepancyRcaDetails: gbAccountsLoanByLoanids[loan.loanid][0].discrepancyDetailsDTO,
        loanType: gbAccountsLoanByLoanids[loan.loanid][0].loanType,
        repoRateDTO: gbAccountsLoanByLoanids[loan.loanid][0].repoRateDTO,
        loanAmount: gbAccountsLoanByLoanids[loan.loanid][0].loanAmount,
        startedOn: gbAccountsLoanByLoanids[loan.loanid][0].sanctionDate,
      });
    } else {
      // eslint-disable-next-line no-param-reassign
      loan.accounts = false;
    }
  });
  return payments;
};

const migratedLenders = [lenders.kvb, lenders.axis, lenders.federal, lenders.indianbank]; // Lenders having IPC values from account service

// filter all loans for which lender & branch cache-value is account
// 1.if loan is secure then decision to filter it or not will be based on its cache value
// 2.if loan is unsecure then decision to filter it or not will be based on its secure part
const filterAccountLoans = async (loans, loanidsLenderBranchMapping) => {
  try {
    const filteredLoans = {};
    const groupAllLoansByCoreID = groupBy(loans, 'coreid');
    await Promise.map(loans, async (loan) => {
      let lenderSlugToCheck = getLenderSlugForBranchFiltering(loan, groupAllLoansByCoreID);
      if (lenderSlugToCheck === lenders.rupeek && loans.length === 1
        && !isEmpty(loanidsLenderBranchMapping[loan.loanid])
        && !isEmpty(loanidsLenderBranchMapping[loan.loanid][0].securelender)) {
        lenderSlugToCheck = await lendingMDSUtil.getLenderIdToSlugMap(loanidsLenderBranchMapping[loan.loanid][0].securelender);
      }
      if (loan && loan.netweight === 0 && !isEmpty(loanidsLenderBranchMapping[loan.loanid])
        && !isEmpty(loanidsLenderBranchMapping[loan.loanid][0].securelender)) {
        const { securelender, securelenderbranch } = loanidsLenderBranchMapping[loan.loanid][0];
        const loangateway = migratedLenders.includes(lenderSlugToCheck) ? redisInfo.loanGatewayRoutingKeys.account : await redisUtils.getFromCache(`${redisInfo.keys.lenderBranches}:${securelender}:${securelenderbranch}`);
        if (loangateway === redisInfo.loanGatewayRoutingKeys.account) {
          filteredLoans[loan.loanid] = loan;
        }
      } else if (loan && loan.netweight === 0 && !isEmpty(loan.ref_no)) {
        const coreids = loan.ref_no.split(',');
        await Promise.map(coreids, async (cid) => {
          if (!isEmpty(groupAllLoansByCoreID[cid])) {
            const secureLoan = groupAllLoansByCoreID[cid][0];
            if (secureLoan && !isEmpty(loanidsLenderBranchMapping[secureLoan.loanid]) && isEmpty(filteredLoans[secureLoan.loanid])) {
              const { lender, lenderbranch } = loanidsLenderBranchMapping[secureLoan.loanid][0];
              const loangateway = migratedLenders.includes(lenderSlugToCheck) ? redisInfo.loanGatewayRoutingKeys.account : await redisUtils.getFromCache(`${redisInfo.keys.lenderBranches}:${lender}:${lenderbranch}`);
              if (loangateway === redisInfo.loanGatewayRoutingKeys.account) {
                filteredLoans[secureLoan.loanid] = secureLoan;
                filteredLoans[loan.loanid] = loan;
              }
            } else if (secureLoan && !isEmpty(loanidsLenderBranchMapping[secureLoan.loanid]) && !isEmpty(filteredLoans[secureLoan.loanid])) {
              filteredLoans[loan.loanid] = loan;
            }
          }
        });
      } else if (loan && !isEmpty(loanidsLenderBranchMapping[loan.loanid]) && isEmpty(filteredLoans[loan.loanid])) {
        const { lender, lenderbranch } = loanidsLenderBranchMapping[loan.loanid][0];
        const loangateway = migratedLenders.includes(lenderSlugToCheck) ? redisInfo.loanGatewayRoutingKeys.account : await redisUtils.getFromCache(`${redisInfo.keys.lenderBranches}:${lender}:${lenderbranch}`);
        if (loangateway === redisInfo.loanGatewayRoutingKeys.account || loan.ignorecalc) {
          filteredLoans[loan.loanid] = loan;
        }
      }
    });
    return filteredLoans;
  } catch (e) {
    throw new Error(`some unexpected error while filtering loans from loan-gateway cache values with error:${e}`);
  }
};

const getLenderSlugForBranchFiltering = (loan, groupAllLoansByCoreID) => {
  const secureLoan = loan.lenderid.toLowerCase() === lenders.rupeek ? loan.secureschemeloan : loan;
  if (secureLoan) {
    return secureLoan.lenderid.toLowerCase();
  }
  if (isEmpty(loan.ref_no)) {
    return loan.lenderid.toLowerCase();
  }
  const coreids = loan.ref_no.split(',');
  const securedcoreid = find(coreids, coreid => !isEmpty(groupAllLoansByCoreID[coreid]) && groupAllLoansByCoreID[coreid][0]);
  if (securedcoreid) {
    const secureLoanByCoreId = groupAllLoansByCoreID[securedcoreid][0];
    return secureLoanByCoreId.lenderid.toLowerCase();
  }
  return loan.lenderid.toLowerCase();
};

// update ipc, cashback, nwdi, nwdc vlaues of payments loan object wrt to accounts loan object
const mergeLoansValues = (data) => {
  const {
    paymentsLoan,
    excessFunding,
    customerRupeekViewLoan,
    discrepancyPresent,
    discrepancyView,
    lenderViewLoan,
    gbLoanid,
    nwdAccounts,
    schemeData,
    loanStatus,
    sanctionDate,
    discrepancyRcaDetails,
    loanType,
    repoRateDTO,
    loanAmount,
    startedOn,
  } = data;
  const loan = paymentsLoan;
  loan.discrepancy = discrepancyView;
  loan.discrepancyPresent = discrepancyPresent;
  loan.lenderView = lenderViewLoan;
  loan.schemedata = schemeData; // overwriting schemedata coming from payments with account service schemeData
  loan.loanStatus = loanStatus;
  loan.discrepancyRcaDetails = discrepancyRcaDetails;
  loan.dayselapsed = getDuration(sanctionDate);
  loan.loanType = loanType;
  loan.scheme = customerRupeekViewLoan.interestRate; // updating existing interest rate coming from payments
  if (repoRateDTO) {
    loan.prevRepoSlabRate = repoRateDTO.prevRepoSlabRate;
    loan.repoRateChanges = repoRateDTO.repoRateChanges;
  }
  if (loan.secureschemeloan) {
    loan.secureschemeloan.dayselapsed = loan.dayselapsed;
  }
  if (discrepancyPresent && !isEmpty(discrepancyView) && includes(values(discrepancyInfo.level), discrepancyView.prioritySlab)) {
    loan.closures = {
      // if client is app then in case of release and low priority  discrepancies closing amount will be as per lendervalues
      release: ((discrepancyView.prioritySlab === discrepancyInfo.level.low) && !isEmpty(lenderViewLoan) && (lenderViewLoan.closingAmount > 0))
        ? lenderViewLoan.closingAmount : customerRupeekViewLoan.closingAmount,
    };
    loan.discrepancy = updateDiscrepancyLevelFormat(loan.discrepancy);
  } else {
    loan.discrepancy = null;
    loan.closures = {
      release: customerRupeekViewLoan.closingAmount,
    };
  }
  loan.preclosurecharges = 0;
  loan.othercharges = 0;
  loan.loanstartedon = moment.utc(startedOn, 'YYYY-MM-DD');
  loan.loanamount = loanAmount;
  loan.closingamount = customerRupeekViewLoan.closingAmount;
  loan.balanceamount = (loan.ignorecalc && loanType === constantUtils.accounts.loanType.MIP) ? customerRupeekViewLoan.outstandingAmount : customerRupeekViewLoan.principalAmount;
  // in case of excessfunding reconrecovery is being added to closingamount & balanceamount as per getuserloans calculation
  if (excessFunding) {
    map(loan.closures, (closingamount, type) => {
      loan.closures[type] = closingamount + loan.reconrecovery;
    });
    loan.closingamount += loan.reconrecovery;
    loan.balanceamount += loan.reconrecovery;
  }
  if (loanType === constantUtils.producttype.CLM && loan.lenderid !== lenders.rupeek) {
    loan.cashbackamount = Math.max(0, customerRupeekViewLoan.unpostedCashback - customerRupeekViewLoan.transitCashbackRepaymentAccrued);
    loan.interest = Math.max(0, customerRupeekViewLoan.minAmountDue + loan.cashbackamount);
  } else {
    loan.interest = customerRupeekViewLoan.interestAccrued;
    loan.cashbackamount = customerRupeekViewLoan.cashbackAccrued;
  }
  // adding account flag as true for updating ipc values with account-service data;
  loan.accounts = true;
  const loanView = !isEmpty(lenderViewLoan) ? lenderViewLoan : customerRupeekViewLoan;
  // TO DO nwdAccounts objects will be set when nwd calculation will be taken from account-service api
  if (!isEmpty(nwdAccounts) && gbLoanid && !isEmpty(gbLoanid[loan.loanid]) && gbLoanid[loan.loanid][0].nwd) {
    const { nextWorkingDay } = paymentsLoan.workingDayResult;
    const currenttime = moment().add(5.5, 'hours').startOf('day');
    const daysToNextWorkingDay = moment(nextWorkingDay).diff(currenttime, 'days');
    loan.nwdi = Math.round(nwdAccounts.todayInterestAmount * daysToNextWorkingDay);
    loan.nwdc = Math.max(0, Math.round(nwdAccounts.todayCashBackAmount * daysToNextWorkingDay));
  } else if (gbLoanid && !isEmpty(gbLoanid[loan.loanid]) && gbLoanid[loan.loanid][0].nwd) {
    const { nextWorkingDay } = paymentsLoan.workingDayResult;
    const currenttime = moment().add(5.5, 'hours').startOf('day');
    const daysToNextWorkingDay = moment(nextWorkingDay).diff(currenttime, 'days');
    loan.nwdi = Math.round(daysToNextWorkingDay * parseFloat(loanView.interestRate) * loanView.principalAmount / 36500);
    loan.nwdc = Math.max(0, loan.nwdi - Math.round(daysToNextWorkingDay * parseFloat(customerRupeekViewLoan.slabRate) * customerRupeekViewLoan.principalAmount / 36500));
  }

  if (loan.ignorecalc) {
    loan.mipLoanStatus = customerRupeekViewLoan.mipLoanStatus;
    loan.nextInterestDueDate = customerRupeekViewLoan.nextDueDate;
  }

  if (loan.repoRateChanges && isArray(loan.repoRateChanges) && loan.repoRateChanges.length) {
    const orderedRepoRateChanges = loan.repoRateChanges.sort((a, b) => new Date(a.repoRateChangeDate) - new Date(b.repoRateChangeDate));
    const lastRepoRateChangeObj = orderedRepoRateChanges[orderedRepoRateChanges.length - 1];
    loan.lastRepoRateChangeDate = lastRepoRateChangeObj.repoRateChangeDate;
  }

  if (loanType === constantUtils.accounts.loanType.MIP) {
    loan.amountPayable = customerRupeekViewLoan.amountPayable;
    loan.lmsDueDate = customerRupeekViewLoan.nextDueDate;
  }
  return loan;
};

const getDuration = (sanctionDate) => {
  const currentDateTime = moment.utc().utcOffset(constantUtils.timezone.istoffset, true);
  return Math.floor(currentDateTime.diff(moment.utc(sanctionDate, 'YYYY-MM-DD'), 'days'));
};

const updateDiscrepancyLevelFormat = (discrepancy) => {
  // eslint-disable-next-line no-param-reassign
  discrepancy.prioritySlab = discrepancyInfo.slabParser[discrepancy.prioritySlab];
  return discrepancy;
};

const filterLoanGroupsbasedOnLoanIDs = (loanGroups, loanids) => {
  const filteredLoanGroups = compact(map(loanGroups, (loanGroup) => {
    const updatedLoanGroup = loanGroup;
    const loanGroupLoanIds = map(flattenDeep(loanGroup.loans), loan => loan.loanid);
    const loanstoBeFiltered = difference(loanGroupLoanIds, loanids);
    if (isEmpty(loanstoBeFiltered)) {
      // eslint-disable-next-line no-param-reassign
      loanGroup.groupedtotalamounts = updateGroupedTotalAmounts(updatedLoanGroup.loans);
      return loanGroup;
    }
    updatedLoanGroup.loans = compact(map(loanGroup.loans, (loans) => {
      const updatedLoans = compact(map(loans, (loan) => { if (!includes(loanstoBeFiltered, loan.loanid)) return loan; return null; }));
      if (isEmpty(updatedLoans)) return null;
      return updatedLoans;
    }));
    updatedLoanGroup.groupedtotalamounts = updateGroupedTotalAmounts(updatedLoanGroup.loans);
    return !isEmpty(updatedLoanGroup.loans) ? updatedLoanGroup : null;
  }));
  return filteredLoanGroups;
};

exports.filterIciciLoansForOlderAppVersion = (loanGroups, filterParams) => {
  const version = constantUtils.app.useragent === filterParams.useragent ? filterParams.version : null;
  if ((version && version >= constantUtils.app.version)
    || (filterParams.repaymentType !== loanFilterActions.REPLEDGE)) {
    return loanGroups;
  }
  remove(loanGroups, (loanGroup) => {
    const lenderids = map(flattenDeep(loanGroup.loans), loan => loan.lenderid);
    return includes(lenderids, constantUtils.lendersList.icici);
  });
  return loanGroups;
};

// add duedate, reminder and scheme details values for payments-user loans wrt account-service apis
// 1.get the mapping of loanid with its lender& branch id
// 2.filterloans based on if cache values of that lender&branch is account or not
// 3.get the respective duedate, reminder and scheme details from accounts for the filteredloans
// 4. add the values for payments loan which are in filteredloans

exports.updateLoansWithSchemeDetailsAndDueDates = async (token, mapLoansData, paymentsData) => {
  try {
    // get all the loans present in account services
    const accountFilteredLoans = await getAccountLoans(mapLoansData, paymentsData);
    const lmsIds = keys(accountFilteredLoans);
    // fetch the interest duedate, graceperiod, stage and scheme details for the filtered loans ids
    const interestReminders = await lmsService
      .reminders(lmsIds, constantUtils.accounts.interestremindertype, token, [], true);
    const gbinterestRemindersByLoanid = groupBy(interestReminders, 'lmsId');

    // eslint-disable-next-line no-param-reassign
    paymentsData.loans = mergeinterestRemindersinLoans(gbinterestRemindersByLoanid, paymentsData.loans);
    // eslint-disable-next-line no-param-reassign
    paymentsData.repledgedLoans = mergeinterestRemindersinLoans(gbinterestRemindersByLoanid, paymentsData.repledgedLoans);
  } catch (e) {
    throw new Error(`some unexpected error while updating user loans with due dates: ${e}`);
  }
};

const paymentFrequencyPerSchemeType = {
  monthly: 30,
};

const mergeinterestRemindersinLoans = (gbinterestRemindersByLoanid, paymentsLoans) => {
  const updatedPaymentsLoans = map(paymentsLoans, loans => map(loans, (loan) => {
    if (!loan.coreid || !loan.masterschemeid) return loan;
    const interestReminder = gbinterestRemindersByLoanid[loan.loanid];
    const updatedLoan = loan;
    let interestSlabIndex = 0;
    // const { remindertype } = constantUtils.reminder;
    if (interestReminder) {
      const schemeSlabs = interestReminder[0].blendedSchemeSlabs ? interestReminder[0].blendedSchemeSlabs : interestReminder[0].schemeSlabs;
      interestSlabIndex = isNumber(interestReminder[0].slabIndex) ? interestReminder[0].slabIndex : getCurrentInterestSlabIndex(interestReminder[0]);
      const dueDate = interestReminder[0].dueDate ? moment(interestReminder[0].dueDate, 'YYYY-MM-DD').endOf('day') : undefined;
      const expiryDate = interestReminder[0].expiryDate ? moment(interestReminder[0].expiryDate, 'YYYY-MM-DD').endOf('day') : undefined;
      // if (dueDate && expiryDate && dueDate > expiryDate) {
      //   interestReminder[0].dueDate = interestReminder[0].expiryDate;
      //   interestReminder[0].gracePeriodDueDate = interestReminder[0].expiryDate;
      //   interestReminder[0].dueDays = expiryDate.diff(moment().endOf('days'), 'days');
      //   interestReminder[0].stage = interestReminder[0].dueDays >= 0 ? remindertype.interestdue
      //     : remindertype.interestoverdue;
      // }
      if (!interestReminder[0].interestAmount
          || (expiryDate && moment().diff(expiryDate, 'days', true) > 0)
          || (dueDate && expiryDate && dueDate > expiryDate)) {
        interestReminder[0] = omit(interestReminder[0], ['stage']);
      }
      updatedLoan.slabindex = interestSlabIndex;
      updatedLoan.duedate = moment(interestReminder[0].dueDate, 'YYYY-MM-DD').startOf('day').toISOString();
      updatedLoan.duedays = Math.abs(interestReminder[0].dueDays);
      updatedLoan.stage = (interestReminder[0].stage) ? getReminderType(interestReminder[0].stage, interestReminder[0].loanType, interestReminder[0].dueDays) : undefined;
      updatedLoan.graceperiodduedate = moment(interestReminder[0].gracePeriodDueDate, 'YYYY-MM-DD').endOf('day').toISOString();
      updatedLoan.jumpingstructure = schemeSlabs;
      updatedLoan.previousinterestrate = (schemeSlabs && interestSlabIndex) ? get(schemeSlabs[interestSlabIndex - 1], 'interestRate') : undefined;
      updatedLoan.penalinterestrate = isNumber(interestReminder[0].penalInterestRate) ? interestReminder[0].penalInterestRate
        : getPenalInterestRate(interestReminder, interestSlabIndex, loan.schemedata);
    }
    if (loan.schemedata) {
      updatedLoan.currentinterestrate = getCurrentInterestRate(interestReminder, interestSlabIndex, loan.schemedata) + (updatedLoan.penalinterestrate ? updatedLoan.penalinterestrate : 0);
      updatedLoan.currentinterestrateV2 = getCurrentInterestRate(interestReminder, interestSlabIndex, loan.schemedata);
      updatedLoan.paymentfreq = getPaymentFrequency(interestReminder, interestSlabIndex, loan.schemedata);
      updatedLoan.startingroi = getStartingROI(interestReminder, loan.schemedata);
    }
    return updatedLoan;
  }));
  return updatedPaymentsLoans;
};

const getCurrentInterestSlabIndex = (interestReminder) => {
  if (isJumping(interestReminder.schemeType)) {
    return findIndex(interestReminder.schemeSlabs, { interestRate: interestReminder.currentSlabRate });
  }
  return 0;
};

const getReminderType = (reminderType, loanType, dueDays) => {
  const { reminder, accounts } = constantUtils;
  if (isEqual(reminderType.toLowerCase(), reminder.remindertype.interestoverdue)
  && isEqual(loanType, accounts.loanType.MIP)) {
    return reminder.remindertype.interestoverduemip;
  }
  if (isEqual(reminderType.toLowerCase(), reminder.remindertype.interestdue) && (dueDays > reminder.reminderdays.interestdue)) {
    return reminder.remindertype.nextinterestdue;
  }
  if (isEqual(reminderType.toLowerCase(), reminder.remindertype.interestoverdue) && ((-1 * dueDays) > reminder.reminderdays.interestoverdue)) {
    return reminder.remindertype.interestoverduejumping;
  }
  return reminderType.toLowerCase();
};

const getPaymentFrequency = (interestReminder, interestSlabIndex, schemeData) => {
  if (isJumping(schemeData.type) && interestReminder && interestReminder[0].schemeSlabs) {
    const { schemeSlabs } = interestReminder[0];
    return get(schemeSlabs[interestSlabIndex], 'toDay') - ((interestSlabIndex > 0) ? get(schemeSlabs[interestSlabIndex - 1], 'toDay') : 0);
  }
  if (isEqual(schemeData.type, schemetypes.mip)) {
    return paymentFrequencyPerSchemeType[schemetypes.mip];
  }
  return null;
};

const getStartingROI = (interestReminder, schemeData) => {
  if (isJumping(schemeData.type) && interestReminder && interestReminder[0].blendedSchemeSlabs) {
    return get(interestReminder[0].blendedSchemeSlabs[0], 'interestRate');
  }

  if (isJumping(schemeData.type) && interestReminder && interestReminder[0].schemeSlabs) {
    return get(interestReminder[0].schemeSlabs[0], 'interestRate');
  }

  if (includes([schemetypes.mip, schemetypes.flat], schemeData.type) && interestReminder && isValidBlendedInterestRate(interestReminder[0].blendedInterestRate)) {
    return interestReminder[0].blendedInterestRate;
  }
  if (isEqual(schemetypes.flat, schemeData.type) && interestReminder && isValidSchemeInterestRate(interestReminder[0].schemeInterestRate)) {
    return interestReminder[0].schemeInterestRate;
  }
  return null;
};

const getCurrentInterestRate = (interestReminder, interestSlabIndex, schemeData) => {
  if (isJumping(schemeData.type) && interestReminder && interestReminder[0].blendedSchemeSlabs && interestSlabIndex !== -1) {
    return get(interestReminder[0].blendedSchemeSlabs[interestSlabIndex], 'interestRate');
  }
  if (isJumping(schemeData.type) && interestReminder && interestReminder[0].schemeSlabs && interestSlabIndex !== -1) {
    return get(interestReminder[0].schemeSlabs[interestSlabIndex], 'interestRate');
  }
  if (includes([schemetypes.mip, schemetypes.flat], schemeData.type) && interestReminder && isValidBlendedInterestRate(interestReminder[0].blendedInterestRate)) {
    return (interestReminder[0].blendedInterestRate);
  }
  if (isEqual(schemeData.type, schemetypes.flat) && interestReminder && isValidSchemeInterestRate(interestReminder[0].schemeInterestRate)) {
    return (interestReminder[0].schemeInterestRate);
  }

  return schemeData.interestrate;
};

const penalInterestRate = 2;

const getPenalInterestRate = (interestReminder, interestSlabIndex, schemeData) => {
  if (schemeData && isJumping(schemeData.type) && interestReminder[0].schemeSlabs && interestSlabIndex !== -1) {
    return interestReminder[0].currentSlabRate - get(interestReminder[0].schemeSlabs[interestSlabIndex], 'interestRate');
  }
  if (schemeData && isEqual(schemeData.type, schemetypes.flat) && isValidSchemeInterestRate(interestReminder[0].schemeInterestRate)) {
    return interestReminder[0].currentSlabRate - interestReminder[0].schemeInterestRate;
  }
  if (moment(interestReminder[0].expiryDate, 'YYYY-MM-DD').endOf('day').diff(moment().startOf('day'), 'days') < 0) {
    return penalInterestRate;
  }
  return 0;
};
/*
calculates cumilative loan amounts for grouped loans
*/
const updateGroupedTotalAmounts = (groupedLoans) => {
  const loans = flattenDeep(groupedLoans);
  const groupedtotalinterestamount = sumBy(loans, loan => (loan.interest - loan.cashbackamount));
  const groupedTotalAmounts = {
    groupedtotalloanamount: sumBy(loans, 'loanamount'),
    groupedtotalclosureamount: sumBy(loans, loan => (loan.closingamount - loan.cashbackamount)),
    groupedtotalinterestamount: (groupedtotalinterestamount > 0) ? groupedtotalinterestamount : 0,
  };
  return groupedTotalAmounts;
};

/*
transforming into required response object
*/
const transformPaymentsData = (paymentsData) => {
  const responseObject = compact(map(paymentsData.loans, (loanArray) => {
    // In case of closed loans, not returning the unsecured component.
    if (loanArray[0].netweight === 0) return null;
    const secureLoan = find(loanArray, loan => loan.netweight !== 0);
    const unsecureLoan = find(loanArray, loan => loan.netweight === 0);
    const loanObject = {
      lender: secureLoan.lenderid,
      loan_date: moment(secureLoan.loanstartedon).utc().add(5.5, 'hours').format('YYYY-MM-DD'),
      amount: sumBy(loanArray, 'loanamount'),
      status: constantUtils.statuscode[secureLoan.statuscode],
      los_id: secureLoan.coreid ? secureLoan.coreid : undefined,
      secure_loanid: secureLoan.loanid ? secureLoan.loanid : undefined,
      unsecure_loanid: (unsecureLoan && unsecureLoan.loanid) ? unsecureLoan.loanid : undefined,
    };
    return loanObject;
  }));
  return responseObject;
};
/*
fetches all types of in progress loans
*/
const fetchInProgressLoans = async (id, token, filters) => {
  let inProgressLoans = [];
  const { loanTypes } = constantUtils;
  const mapLoansData = await coreService.mapLoansVersion5(id, token, true);
  if (includes(filters.type, loanTypes.renewal)) {
    const orderIds = filters.orderIds ? filters.orderIds : fetchOrderIds(mapLoansData).join(',');
    if (!isEmpty(orderIds)) {
      const params = {
        orderIds,
      };
      const activeRenewalLoans = await fetchActiveRenewalLoans(token, params);
      inProgressLoans = [...inProgressLoans, ...activeRenewalLoans];
    }
  }
  const freshAndPartReleaseLoans = await freshLoanAndPartReleaseLoans(filters, mapLoansData, id, token);
  inProgressLoans = [...inProgressLoans, ...freshAndPartReleaseLoans];
  return inProgressLoans;
};

// fetch orderIds for the loans whose lploanid in empty

const fetchOrderIds = (mapLoansData) => {
  const orderIds = [];
  forEach(mapLoansData, (loanGroup) => {
    forEach(loanGroup, (g) => {
      forEach(g.loans, (loan) => {
        if (!loan.lploanid && loan.orderId) {
          orderIds.push(loan.orderId);
        }
      });
    });
  });

  return compact(uniq(orderIds));
};

/* fetch schemeids for the loans whose lploanid in empty
   fetch schemeid from part release orders whosenew loan request is not
   created.
*/


const fetchMasterSchemeIds = (mapLoansData, coreIds, orders) => {
  // for fresh loans
  let masterSchemeIds = [];
  forEach(mapLoansData, (group) => {
    forEach(group, (g) => {
      forEach(g.loans, (loan) => {
        if (!loan.lploanid && !loan.orderId && ((!isEmpty(coreIds)
          && includes(coreIds, loan.loanid.toString())) || isEmpty(coreIds))) {
          masterSchemeIds.push(loan.masterschemeId);
        }
      });
    });
  });
  // for part release
  map(orders, (order) => {
    const schemeIds = compact(map(order.orderItems, (orderItem) => {
      if (!hasNewLoanDetails(orderItem.newLoanRequestDetails)) return orderItem.newMasterSchemeId;
      return null;
    }));
    masterSchemeIds = [...schemeIds, ...masterSchemeIds];
  });
  return compact(uniq(masterSchemeIds));
};
// fetch all the active orders from oms whose renewal is pending
const fetchActiveRenewalLoans = async (token, params) => {
  const activeRenewalOrders = await omsService.getRenewalOrderDetails(token, params);
  const inProgressLoans = updateLoansWithInProgressLoanDetails(activeRenewalOrders, constantUtils.inProgress.types.renewal);
  return inProgressLoans;
};

// add reason for disabling the loan and discalimer based on the loan type and inside or outside of the tat
const updateLoansWithInProgressLoanDetails = (inProgressLoans, loanType) => {
  const loans = map(inProgressLoans, (loan) => {
    const loanDate = isEqual(loan.type, constantUtils.inProgress.types.renewal) ? loan.appliedForRenewalAt : loan.loans[0].loandate;
    const {
      message, disclaimer, turnAroundTimes, loanDisabledTip,
    } = constantUtils.inProgress[loanType];
    let updatedLoanObject = {};
    if (loanDate) {
      const statusDetails = fetchRenewalStatusDetails(loan);
      const turnAroundTime = getTurnAroundTime(statusDetails, turnAroundTimes, loan);
      const insideTat = isWithinTat(loanDate, loanType, turnAroundTime);
      updatedLoanObject = {
        message: !insideTat ? message.outsideTat : '',
        disclaimer,
        estimatedcompletiondate: moment(loanDate).add(turnAroundTime, 'days'),
        totalloanamount: sumBy(loan.loans, eachLoan => eachLoan.totalnewloanamount),
        statusdetails: statusDetails,
        loans: orderBy(loan.loans, [eachLoan => eachLoan.startingroi], ['asc']),
        lenders: loan.lenders,
        type: loan.type,
        insideTat,
        loanDisabledTip: loan.loans.length > 1 ? loanDisabledTip.multipleLoans : loanDisabledTip.singleLoan,
      };
    }
    return updatedLoanObject;
  });
  return loans;
};

// update the status details
const fetchRenewalStatusDetails = (loan) => {
  const statusDetails = {};
  statusDetails.paymentstatus = isEqual(loan.paymentstatus, 'success');
  statusDetails.appliedfordigitalrenewal = isDigitalRenewal(loan);
  statusDetails.appliedformanualrenewal = isManualRenewal(loan);
  return statusDetails;
};

// get turn around time based on process type for renewal
const getTurnAroundTime = (statusDetails, turnAroundTimes, loan) => {
  if (statusDetails.appliedfordigitalrenewal) return turnAroundTimes.digital;

  if (loan.lockbankverification) return turnAroundTimes.manualBankVerification;

  return turnAroundTimes.manualSigning;
};

/*
fetch part release orders from release service
- fetch master scheme details for all inrprogress fresh loans and part release orders
- if master schemeids are not empty then get part release reminders and fresh loan reminder
- and filter them based on coreId if passed or partReleaseorderId
- then return the rerminder based on type of the loan passed.
*/

const freshLoanAndPartReleaseLoans = async (filters, mapLoansData, customerId, token) => {
  const {
    coreIds,
    type,
    partReleaseOrderIds,

  } = filters;
  let allLoans = [];
  let schemeDetails = [];
  const { loanTypes } = constantUtils;
  const orders = await fetchPartReleaseOrders(partReleaseOrderIds, token, customerId);
  const masterSchemeIds = fetchMasterSchemeIds(mapLoansData, filters.coreIds, orders);
  if (isEmpty(masterSchemeIds)) return [];
  schemeDetails = await fetchSchemeDetails(masterSchemeIds);
  const { partReleaseLoans, partReleaseCoreIds } = await getPartReleaseOrderDetails(orders, schemeDetails);
  const freshLoanDetails = map(mapLoansData, group => getFreshLoanDetails(group, schemeDetails, coreIds, partReleaseCoreIds));
  if (includes(type, loanTypes.partRelease)) {
    allLoans = [...flattenDeep(partReleaseLoans), ...allLoans];
  }
  if (includes(type, loanTypes.freshLoan)) {
    allLoans = [...freshLoanDetails, ...allLoans];
  }

  return compact(allLoans);
};

// fetch part release orders from release service
const fetchPartReleaseOrders = async (partReleaseOrderIds, token, customerId) => {
  const params = {
    process: los.orders.partRelease,
    customerId,
    newLoanRequestRequired: true,
    ...(partReleaseOrderIds && {
      orderId: partReleaseOrderIds,
    }),
    orderStatus: los.orderStatus.inProgress,
  };
  const orders = await losService.orders(token, params);
  return orders;
};

// get scheme Details from scheme engine
const fetchSchemeDetails = async (masterSchemeIds) => {
  const params = {
    masterSchemeId: masterSchemeIds.join(','),
  };
  const schemeInfo = await schemeEngineService.getSchemeDetails(params);
  const schemeDetails = map(schemeInfo, scheme => ({
    masterSchemeId: scheme.masterSchemeId,
    tenure: scheme.tenure,
    interestRate: scheme.interestCalculation.interestRate,
  }));
  return schemeDetails;
};

// add reason for disabling the loan and discalimer based on the loan type and inside or outside of the tat
const getFreshLoanDetails = (inProgressLoans, schemeDetails, coreIds, partReleasecoreIds) => {
  const { inProgress } = constantUtils;
  let freshLoanObject = {};
  const {
    message, disclaimer, turnAroundTime, loanDisabledTip,
  } = constantUtils.inProgress[inProgress.types.freshLoan];
  const insideTat = isWithinTat(inProgressLoans[0].checkoutTime, inProgress.types.freshLoan, turnAroundTime);
  freshLoanObject.loans = compact(map(inProgressLoans, (loanGroup) => {
    if (isFreshLoan(loanGroup.loans, partReleasecoreIds)
      && ((!isEmpty(coreIds) && includes(coreIds, loanGroup.loans[0].loanid.toString())) || isEmpty(coreIds))) {
      const scheme = find(schemeDetails, ['masterSchemeId', loanGroup.loans[0].masterschemeId]);
      return {
        loandate: inProgressLoans[0].checkoutTime,
        secureloanid: loanGroup.loans[0].loanid,
        tenure: scheme ? scheme.tenure : undefined,
        startingroi: scheme ? scheme.interestRate : undefined,
        totalnewloanamount: sumBy(loanGroup.loans, eachLoan => eachLoan.sloanamount) + ((loanGroup.uloanamount) ? loanGroup.uloanamount : 0),
      };
    }
    return null;
  }));
  if (!isEmpty(freshLoanObject.loans)) {
    freshLoanObject = {
      ...freshLoanObject,
      lenders: (inProgressLoans[0].uloanid || isEqual(inProgressLoans[0].productType, constantUtils.producttype.CLM)) ? [inProgressLoans[0].lender, lenders.rupeek] : [inProgressLoans[0].lender],
      type: inProgress.types.freshLoan,
      totalloanamount: sumBy(freshLoanObject.loans, eachLoan => eachLoan.totalnewloanamount),
      insideTat,
      statusdetails: {
        appliedForLoan: true,
        goldRecievedByRupeek: true,
      },
      message: !insideTat ? message.outsideTat : '',
      disclaimer,
      estimatedcompletiondate: moment(inProgressLoans[0].checkoutTime).add(turnAroundTime, 'days'),
      loanDisabledTip: freshLoanObject.loans.length > 1 ? loanDisabledTip.multipleLoans : loanDisabledTip.singleLoan,

    };
    return freshLoanObject;
  }
  return null;
};

/*
get part release order details
if new loan request exist use the details for the same
else use estimated new loan request details
*/
const getPartReleaseOrderDetails = async (orders, schemeDetails) => {
  let partReleaseCoreIds = [];
  const partReleaseLoans = map(orders, (eachOrder) => {
    const paymentCaptured = getPaymentCaptured(eachOrder.payments);
    const partReleaseLoanRequests = compact(map(eachOrder.orderItems, orderItem => ({
      newLoanRequestDetails: orderItem.newLoanDetails,
      id: orderItem.id,
      newLoanRequest: false,
      paymentCaptured: paymentCaptured ? moment(paymentCaptured.capturedAt) : moment(eachOrder.orderDate, 'DD-MM-YYYY'),
      turnAroundTime: eachOrder.turnAroundTime,
      lender: get(find(orderItem.loanDetails, eachLoan => eachLoan.type === 'secure'), 'lender'),
      mode: eachOrder.mode,
      estimatedCompletionDate: eachOrder.expectedCompletionDate,
      ...(hasNewLoanDetails(orderItem.newLoanRequestDetails) && {
        newLoanRequestDetails: orderItem.newLoanRequestDetails,
        id: orderItem.newLoanRequestId,
        newLoanRequest: true,
      }),
    })));
    const partReleaseOrders = reduce(partReleaseLoanRequests, (response, eachRequest) => {
      if (!response[eachRequest.id]) response[eachRequest.id] = transformPartReleaseResponse(eachRequest, schemeDetails);
      partReleaseCoreIds = (response[eachRequest.id]) ? [...compact(map(response[eachRequest.id].loans, loan => loan.secureloanid)), ...partReleaseCoreIds] : [...partReleaseCoreIds];
      return response;
    }, {});
    return values(partReleaseOrders);
  });

  return { partReleaseLoans, partReleaseCoreIds };
};

/*
transform to required part release inprogress response
fetch the new loan request details if exists
else fetch the estimated new loan details
and create part release response
*/
const transformPartReleaseResponse = (request, schemeDetails) => {
  const { inProgress } = constantUtils;
  const {
    message, disclaimer, turnAroundTimes, loanDisabledTip,
  } = inProgress[inProgress.types.partRelease];
  const {
    newLoanRequestDetails, lender, turnAroundTime, paymentCaptured, newLoanRequest, mode, estimatedCompletionDate,
  } = request;
  const insideTat = estimatedCompletionDate ? (moment(estimatedCompletionDate).diff(moment(), 'hours', true) >= 0)
    : isWithinTat(paymentCaptured, inProgress.types.partRelease, turnAroundTime || turnAroundTimes[mode]);
  const partReleaseLoans = newLoanRequest ? newRequestDetails(newLoanRequestDetails, schemeDetails)
    : estimatedNewRequestDetails(newLoanRequestDetails, schemeDetails);
  const lenderIds = getLenders(newLoanRequest, lender, newLoanRequestDetails);
  if (!isEmpty(partReleaseLoans)) {
    const partReleaseLoanObject = {
      lenders: lenderIds,
      type: inProgress.types.partRelease,
      totalloanamount: sumBy(partReleaseLoans, eachLoan => eachLoan.totalnewloanamount),
      insideTat,
      statusdetails: {
        paymentStatus: true,
        goldDelivery: true,
      },
      message: !insideTat ? message.outsideTat : '',
      disclaimer,
      estimatedcompletiondate: estimatedCompletionDate ? moment(estimatedCompletionDate) : moment(paymentCaptured).add(turnAroundTime, 'days'),
      loanDisabledTip: partReleaseLoans.length > 1 ? loanDisabledTip.multipleLoans : loanDisabledTip.singleLoan,
      loans: partReleaseLoans,
    };
    return partReleaseLoanObject;
  }
  return null;
};

/*
fetch new loan request details
*/
const newRequestDetails = (newLoanRequestDetails, schemeDetails) => {
  const partReleaseLoans = compact(map(newLoanRequestDetails.loans, (eachLoan) => {
    if (!isEmpty(eachLoan.lpLoanId)) return null;
    if (eachLoan.masterSchemeId || eachLoan.loanId || eachLoan.amount) {
      const scheme = find(schemeDetails, ['masterSchemeId', eachLoan.masterSchemeId]);
      const unSecureLoan = find(newLoanRequestDetails.uloans, loan => loan.sloanid === eachLoan.loanId);
      return {
        loandate: (newLoanRequestDetails.timestamps && newLoanRequestDetails.timestamps.checkoutTimestamp)
          ? newLoanRequestDetails.timestamps.checkoutTimestamp : undefined,
        secureloanid: eachLoan.loanId,
        tenure: scheme ? scheme.tenure : undefined,
        startingroi: scheme ? scheme.interestRate : undefined,
        totalnewloanamount: eachLoan.amount + (unSecureLoan ? unSecureLoan.loanamount : 0),
      };
    }
    return null;
  }));
  return partReleaseLoans;
};

/*
fetch estimated new loan details
*/
const estimatedNewRequestDetails = (newLoanRequestDetails, schemeDetails) => {
  if (isEmpty(newLoanRequestDetails)) return [];
  const secureLoan = find(newLoanRequestDetails, loan => loan.type === 'secure');
  const scheme = find(schemeDetails, ['masterSchemeId', secureLoan.masterSchemeId]);
  return [{
    loandate: secureLoan.loanDate,
    tenure: scheme ? scheme.tenure : undefined,
    startingroi: scheme ? scheme.interestRate : undefined,
    totalnewloanamount: sumBy(newLoanRequestDetails, loan => loan.loanAmount),
  }];
};

/*
fetch lender based on new loan request
*/
const getLenders = (newLoanRequest, lender, newLoanRequestDetails) => {
  if (newLoanRequest) return (!isEmpty(newLoanRequestDetails.uloans) || !isEmpty(newLoanRequestDetails.loans[0].clmLoans)) ? [lender, lenders.rupeek] : [lender];
  return map(newLoanRequestDetails, loan => loan.lender);
};

exports.mergeLoansValues = mergeLoansValues;
exports.filterAccountLoans = filterAccountLoans;
exports.getAccountLoans = getAccountLoans;
exports.mergeLoans = mergeLoans;
exports.getLenderMapping = getLenderMapping;
exports.mergeLoansValues = mergeLoansValues;
exports.filterLoanGroupsbasedOnLoanIDs = filterLoanGroupsbasedOnLoanIDs;
exports.updateGroupedTotalAmounts = updateGroupedTotalAmounts;
exports.transformPaymentsData = transformPaymentsData;
exports.fetchInProgressLoans = fetchInProgressLoans;
exports.fetchOrderIds = fetchOrderIds;
