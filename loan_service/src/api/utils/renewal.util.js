
const {
  find,
  isEmpty,
  map,
  sumBy,
  pick,
  flattenDeep,
  concat,
  join,
  groupBy,
  includes,
  remove,
  compact,
  keys,
  isBoolean,
  values,
  orderBy,
  every,
  isEqual,
  omit,
} = require('lodash');
const moment = require('moment');
const paymentService = require('../services/payments');
const coreService = require('../services/core');
const lmsService = require('../services/accounts');
const {
  reminder, notification, lendersList, applink, accounts, loanTypes,
} = require('../../api/utils/constants');
const notificationService = require('../../api/services/notification');
const notificationUtils = require('./notification.util');
const loanUtils = require('./loans.util');
const loancardUtils = require('./loancard.util');
const { logger } = require('../../config/logger');
const { renewalreminderstages } = require('../../config/vars');

const isCLM = loanType => loanType && isEqual(loanType.toUpperCase(), accounts.loanType.CLM);

exports.fetchLoansReminders = async (token, id, filters) => {
  const { reminderTypes, loanStatus, phone } = filters;
  const paymentsdata = reminderTypes.includes(reminder.type.interest)
    ? await getPaymentsData(phone, token) : undefined;
  const userid = phone && paymentsdata ? paymentsdata.refid : id;
  let maploansdata = await getMappedLoanData(phone, userid, token);
  maploansdata = getNonAuctionedLoans(maploansdata);

  let loanReminders = [];
  if (reminderTypes.includes(reminder.type.renewal)) {
    const loansTobeRenewed = await fetchLoansToBeRenewed(token, id, maploansdata);
    loanReminders = [...loanReminders, ...loansTobeRenewed];
  }
  if (reminderTypes.includes(reminder.type.interest) && paymentsdata) {
    const loansInterestReminders = await fetchInterestReminders(token, maploansdata, paymentsdata,
      filters.groupBy === reminder.groupby.duedate, filters.filterBy === reminder.filterby.duedays,
      loanStatus);
    loanReminders = [...loanReminders, ...loansInterestReminders];
  }
  loanReminders = orderBy(loanReminders,
    [loans => ((loans[0].remindertype === keys(reminder.renewalstages)[2]
      || loans[0].remindertype === keys(reminder.reminderdays)[1])
      ? loans[0].duedays : -1 * loans[0].duedays),
    loans => reminder.priorityorder[loans[0].remindertype],
    ], ['desc', 'asc']);
  return loanReminders;
};


exports.fetchLoanCardReminders = async (token, id, filters) => {
  const { phone, type } = filters;
  const paymentsdata = await getPaymentsData(phone, token);
  let maploansdata = await getMappedLoanData(phone, id, token, type);
  maploansdata = getNonAuctionedLoans(maploansdata);
  maploansdata = getNonHiddenLoans(maploansdata);
  let allReminders = [];
  if (includes(type, loanTypes.active)) {
  // fetching renewal reminders
    const loansTobeRenewed = await fetchLoansToBeRenewed(token, id, maploansdata);
    // fetching interest reminders
    // eslint-disable-next-line max-len
    const loansInterestReminders = await fetchInterestReminders(token, maploansdata, paymentsdata, false, false, [accounts.loanstatus.opened], true);
    const loanReminders = [...loansTobeRenewed, ...loansInterestReminders];
    /* filters the loan reminder for a loan,
    which has more than one reminders based on priority order
    */
    const priorityReminders = await loancardUtils
      .filterPriorityLoanReminders(loanReminders);
    // get the jewel details for each loan
    const jewelDetails = await loancardUtils.getJewelDetails(maploansdata, token);

    // grouping the loans and sorting them based on priority order which have reminders
    const groupedLoans = await loancardUtils
      .groupLoansBasedonReminderandDuedate(priorityReminders, jewelDetails, maploansdata);
    allReminders = [...allReminders, ...groupedLoans];
    // get the details for loans which are not there in account service
    // eslint-disable-next-line max-len
    const otherLoans = await loancardUtils.getLoanDetailsForNoReminders(priorityReminders, paymentsdata, maploansdata, jewelDetails);
    allReminders = [...allReminders, ...otherLoans];
  }
  if (includes(type, loanTypes.renewal)) {
  // get renewal pending Loans
    const orderIds = loanUtils.fetchOrderIds(maploansdata);
    if (!isEmpty(orderIds)) {
      const renewalPendingLoans = await
      loancardUtils.getRenewalPendingReminders(token, orderIds);
      allReminders = [...allReminders, ...renewalPendingLoans];
    }
  }
  if (includes(type, loanTypes.freshLoan) || includes(type, loanTypes.partRelease)) {
    const freshLoanAndPartReleaseReminders = await
    loancardUtils.getFreshAndPartReleaseLoanReminders(maploansdata, id, token, type);
    allReminders = [...allReminders, ...freshLoanAndPartReleaseReminders];
  }
  return allReminders;
};

const getPaymentsData = async (phone, token) => {
  if (phone) {
    const paymentsData = await paymentService.customerloans(token, phone);
    return paymentsData.user;
  }
  return paymentService.userloans(token);
};

const getMappedLoanData = async (phone, id, token, type = []) => {
  const { renewal, freshLoan } = loanTypes;
  if (phone) {
    return coreService.supportMapLoansVersion5(id, token, true, true);
  }
  return coreService.mapLoansVersion5(id, token, includes(type, renewal)
    || includes(type, freshLoan) ? true : null);
};

const fetchInterestReminders = async (token, maploansdata, paymentsdata,
  duedategrouping, duedaysfilter, loanstatus, loanCardViews) => {
  const accountFilteredLoans = await loanUtils.getAccountLoans(maploansdata, paymentsdata);
  if (isEmpty(accountFilteredLoans)) {
    return [];
  }
  const lmsIds = keys(accountFilteredLoans);
  const accountloanstatus = !isEmpty(loanstatus)
    ? loanstatus.map(status => accounts.loanstatus[status]) : [];
  const interestReminders = await lmsService
    .reminders(lmsIds, accounts.interestremindertype, token, accountloanstatus);
  let interestResponseData = transformInterestReminderData(maploansdata, interestReminders);
  if (duedaysfilter) {
    interestResponseData = filterDueEligibleReminders(interestResponseData);
  }
  if (loanCardViews) {
    interestResponseData = addNextInterestDueReminder(interestResponseData);
  }
  interestResponseData = updateTotalGroupedInterestAmount(interestResponseData, duedategrouping);
  return interestResponseData;
};

const filterDueEligibleReminders = (interestReminders) => {
  const nonEmptyReminderLoans = interestReminders.map(
    loans => loans.filter(loan => loan.duedays <= reminder.reminderdays.interestdue),
  )
    .filter(loans => !isEmpty(loans));
  return nonEmptyReminderLoans;
};

/*
updates the reminder type to nextinterestdue if the duedays are greater than 2 days
*/
const addNextInterestDueReminder = (interestReminders) => {
  const updatedReminderTypeLoans = interestReminders.map(
    loans => loans.map((loan) => {
      const updatedLoan = loan;
      const dueDate = loan.duedate ? moment(loan.duedate, 'DD/MM/YYYY').endOf('day') : undefined;
      const expiryDate = loan.expirydate ? moment(loan.expirydate, 'DD/MM/YYYY').endOf('day') : undefined;
      // updating the duedate with expiry date, when due date > expiry date
      // if (dueDate && expiryDate && dueDate > expiryDate) {
      //   updatedLoan.duedate = loan.expirydate;
      //   updatedLoan.graceperiodduedate = loan.expirydate;
      //   updatedLoan.duedays = expiryDate.diff(moment().endOf('days'), 'days');
      //   updatedLoan.remindertype = updatedLoan.duedays >= 0 ? reminder.remindertype.interestdue
      //     : reminder.remindertype.interestoverdue;
      // }
      if (isEqual(updatedLoan.remindertype, reminder.remindertype.interestoverdue)
      && isEqual(loan.loantype, accounts.loanType.MIP.toLowerCase())) {
        // eslint-disable-next-line max-len
        updatedLoan.remindertype = reminder.remindertype.interestoverduemip;
      }
      if (isEqual(updatedLoan.remindertype, reminder.remindertype.interestdue)
      && updatedLoan.duedays > reminder.reminderdays.interestdue) {
        updatedLoan.remindertype = reminder.remindertype.nextinterestdue;
      }
      if (isEqual(updatedLoan.remindertype, reminder.remindertype.interestoverdue)
      && updatedLoan.duedays > reminder.reminderdays.interestoverdue) {
        updatedLoan.remindertype = reminder.remindertype.interestoverduejumping;
      }
      if (!loan.totalinterestamount
      || (expiryDate && moment().diff(expiryDate, 'days', true) > 0)
      || (dueDate && expiryDate && dueDate > expiryDate)) {
        return omit(loan, ['remindertype', 'repaymenttype']);
      }
      return updatedLoan;
    }),
  ).filter(loans => !isEmpty(loans));
  return updatedReminderTypeLoans;
};

const transformInterestReminderData = (maploansdata, interestReminders) => {
  const lmsIds = map(interestReminders, interestReminder => interestReminder.lmsId);
  const nonEmptyReminderLoans = removeEmptyReminderLoans(maploansdata, lmsIds);
  const response = map(nonEmptyReminderLoans,
    loans => map(loans, (loan) => {
      const securedReminder = find(interestReminders,
        data => data.lmsId === loan.loans[0].lploanid);
      let updatedLoan = {};
      if (securedReminder) {
        const unsecuredReminder = find(interestReminders, data => data.lmsId === loan.ulploanid);
        const loanids = [securedReminder.lmsId];
        if (!isEmpty(unsecuredReminder)) {
          loanids.push(unsecuredReminder.lmsId);
        }
        const loanamountdata = getLoanAmountData(securedReminder, unsecuredReminder);
        updatedLoan = {
          duedate: securedReminder.dueDate ? securedReminder.dueDate.split('-').reverse().join('/') : undefined,
          lenderids: !isEmpty(unsecuredReminder) || isCLM(securedReminder.loanType)
            ? [securedReminder.lenderId,
              (unsecuredReminder ? unsecuredReminder.lenderId : lendersList.rupeek)]
            : [securedReminder.lenderId],
          duedays: Math.abs(securedReminder.dueDays),
          remindertype: securedReminder.stage ? securedReminder.stage.toLowerCase() : undefined,
          repaymenttype: reminder.type.interest,
          loanids: compact(loanids),
          slploanid: securedReminder.lmsId,
          ulploanid: loan.ulploanid,
          sanctiondate: securedReminder.sanctionDate.split('-').reverse().join('/'),
          expirydate: securedReminder.expiryDate.split('-').reverse().join('/'),
          loanstatus: securedReminder.loanStatus,
          loantype: securedReminder.loanType ? securedReminder.loanType.toLowerCase() : undefined,
          schemetype: securedReminder.schemeType,
          coreid: loan.loans[0].loanid, // secure losid
          graceperiodduedate: securedReminder.gracePeriodDueDate ? securedReminder.gracePeriodDueDate.split('-').reverse().join('/') : undefined,
          // quick link params
          params: {
            repayment_type: reminder.type.interest,
            loanids: join(compact(loanids), ','),
          },
          ...loanamountdata,
        };
      }
      return filterRequiredDetails([updatedLoan])[0];
    }));
  return response;
};

const getLoanAmountData = (securedReminder, unsecuredReminder) => {
  if (isEmpty(securedReminder)) {
    return {};
  }
  let loanamountdata = {
    totalinterestamount: securedReminder.interestAmount,
    totalloanamount: securedReminder.loanAmount,
    totaloutstandingamount: securedReminder.outstandingBalance,
    totalclosingamount: securedReminder.closingAmount,
  };
  if (!isEmpty(unsecuredReminder)) {
    loanamountdata = {
      totalinterestamount: securedReminder.interestAmount + unsecuredReminder.interestAmount,
      totalloanamount: securedReminder.loanAmount + unsecuredReminder.loanAmount,
      totaloutstandingamount: securedReminder.outstandingBalance
        + unsecuredReminder.outstandingBalance,
      totalclosingamount: securedReminder.closingAmount + unsecuredReminder.closingAmount,
    };
  }
  return loanamountdata;
};


// fetch all grouped loans eligible for renewal in next 30 days
const fetchLoansToBeRenewed = async (token, id, maploansdata) => {
  const paymentsData = await paymentService.renewalLoans(token,
    { getuserdetails: true, dueDateLimit: reminder.renewalstages.renewalupcoming });
  await filterOperationalBranch(paymentsData, token, true);
  let loansToBeRewewed = filterRenewalLoanGroups(maploansdata, paymentsData);
  loansToBeRewewed = updateAndtransformResponseData(loansToBeRewewed, paymentsData);
  loansToBeRewewed = updateTotalGroupedAmount(loansToBeRewewed);
  return loansToBeRewewed;
};

const removeEmptyReminderLoans = (maploansdata, lmsids) => {
  const nonEmptyReminderLoans = maploansdata.map(
    loans => loans.filter((loansData) => {
      const { loans: securedLoan } = loansData;
      return lmsids.includes(securedLoan[0].lploanid);
    }),
  )
    .filter(loans => !isEmpty(loans));
  return nonEmptyReminderLoans;
};

// paymentsloandata will have only renewal eligible loans
// take intersection with loans data coming from payments to filter out eligble loans
const filterRenewalLoanGroups = (groupedLoans, paymentsloanData) => {
  const renewalLoanGroups = groupedLoans.map(
    loans => loans.filter((loansData) => {
      const { loans: securedLoan } = loansData;
      const paymentsSecuredLoan = find(paymentsloanData,
        loan => loan.loanid === securedLoan[0].lploanid);
      return !isEmpty(securedLoan) && (!isEmpty(paymentsSecuredLoan));
    }),
  )
    .filter(loans => !isEmpty(loans));
  return renewalLoanGroups;
};


const getNonAuctionedLoans = (groupedLoans) => {
  const groupedLoansNotAuctioned = groupedLoans.filter(
    loans => every(loans.map((loansData) => {
      const { loans: securedLoan } = loansData;
      const auction = securedLoan[0].auctionAction ? securedLoan[0].auctionAction.enable : null;
      return (!(auction === false));
    })),
  );
  return groupedLoansNotAuctioned;
};

const getNonHiddenLoans = (groupedLoans) => {
  const groupedLoansNotAuctioned = compact(map(groupedLoans, (loanGroup) => {
    const nonHiddenLoans = compact(map(loanGroup, (loansData) => {
      const { loans: securedLoan } = loansData;
      const hidden = securedLoan[0].hideLoan ? securedLoan[0].hideLoan.enable : null;
      return (!(hidden === true)) ? loansData : null;
    }));
    return !isEmpty(nonHiddenLoans) ? nonHiddenLoans : null;
  }));
  return groupedLoansNotAuctioned;
};


// removes non-operational branches loans from array of loans data
const filterOperationalBranch = async (loanData, token, customer) => {
  const coreIDsGroupedbyBranch = groupBy(loanData, 'branchrefid');
  map(coreIDsGroupedbyBranch, (loans, branch) => {
    coreIDsGroupedbyBranch[branch] = map(loans, loan => loan.coreid);
  });
  const isBranchEnabled = {};
  const filteredCoreIDs = await Promise.map(keys(coreIDsGroupedbyBranch), async (branch) => {
    const coreIDs = coreIDsGroupedbyBranch[branch];
    await Promise.mapSeries(coreIDs, async (coreid) => {
      try {
        if (isBoolean(isBranchEnabled[branch])) {
          return;
        }
        const { data } = customer
          ? await coreService.operationalMetrics(token, { coreids: coreid })
          : await coreService.operationalMetricsSupport(token, { coreids: coreid });
        if (isEmpty(data)) return;
        const repledgedAction = find(data.actions, action => action.type === reminder.type.renewal);
        isBranchEnabled[branch] = (repledgedAction.allowed
          && repledgedAction.type === reminder.type.renewal);
      } catch (e) {
        logger.error('error occurred while calling operationalMetricsSupport api', e);
      }
    });
    return isBranchEnabled[branch] ? coreIDs : null;
  });
  const operationalCoreIDs = flattenDeep(compact(filteredCoreIDs));
  remove(loanData, loan => !includes(operationalCoreIDs, loan.coreid));
};

// update and add required field into api response
const updateAndtransformResponseData = (loansToBeRewewed, paymentsData) => {
  const response = map(loansToBeRewewed,
    loans => map(loans, (loan) => {
      const paymentsloan = find(paymentsData, data => data.loanid === loan.loans[0].lploanid);
      const dueDays = moment(paymentsloan.duedate, 'DD/MM/YYYY').startOf('day').diff(moment().startOf('day'), 'days');
      const loanids = getloanIdsOfLoangroup(loans);
      const updatedLoan = {
        ...loan,
        ...{
          slploanid: loan.loans[0].lploanid,
          duedate: paymentsloan.duedate,
          totalloanamount: !isEmpty(paymentsloan.unsecureloan)
            ? paymentsloan.loanamount + paymentsloan.unsecureloan.loanamount
            : paymentsloan.loanamount,
          lenderids: loan.uloanid || isCLM(paymentsloan.loantype)
            ? [paymentsloan.lenderid, lendersList.rupeek] : [paymentsloan.lenderid],
          loans: filterRequiredDetails(loan.loans),
          duedays: Math.abs(dueDays),
          remindertype: getRenewalTypeBasedOnDueDays(dueDays),
          repaymenttype: reminder.type.renewal,
          loanids: compact(loanids),
          coreid: paymentsloan.coreid,
          sanctiondate: paymentsloan.loanstartedon,
          // quick link params
          params: {
            repayment_type: reminder.type.renewal,
            loanids: join(compact(loanids), ','),
          },
        },
      };
      return filterRequiredDetails([updatedLoan])[0];
    }));
  return response;
};

// added sum of totalloanamount of each loans in  a group to each loan object
const updateTotalGroupedAmount = (loansToBeRewewed) => {
  const updatedResponse = map(loansToBeRewewed, loans => map(loans, loan => ({
    ...loan,
    ...{
      groupedtotalloanamount: sumBy(loans, 'totalloanamount'),
      totalloans: loans.length,
    },
  })));
  return updatedResponse;
};

const updateTotalGroupedInterestAmount = (interestLoans, duedategrouping) => {
  const updatedResponse = map(interestLoans, loans => map(loans, (loan) => {
    const groupedloans = loans.filter(
      loanData => !duedategrouping || loanData.duedays === loan.duedays,
    );
    const updatedLoan = {
      ...loan,
      groupedtotalinterestamount: sumBy(groupedloans, 'totalinterestamount'),
      groupedtotalloanamount: sumBy(groupedloans, 'totalloanamount'),
      totalloans: loans.length,
    };
    const groupedLmsIds = flattenDeep(groupedloans.map(groupedLoan => groupedLoan.loanids));
    updatedLoan.loanids = groupedLmsIds;
    updatedLoan.params.loanids = join(compact(groupedLmsIds), ',');
    return updatedLoan;
  }));
  return updatedResponse;
};

// send renewal sms reminder for all loans of a lender if eligible for renewal
exports.renewalSMSReminderForALenderLoans = async (filter, token) => {
  const loans = await paymentService.renewalLoans(token, filter);
  await filterOperationalBranch(loans, token, filter.getuserdetails);
  const [
    category,
    provider,
    type,
    templates,
  ] = await Promise.all([
    await notificationUtils.getCategories(notification.sms.category),
    await notificationUtils.getProviders(notification.sms.provider),
    await notificationUtils.getTypes(notification.sms.type),
    await notificationUtils.getTemplates(null, 'object'),
  ]);
  await Promise.map(loans, async (loan) => {
    try {
      if (!loan.coreid) {
        return;
      }
      const currenttime = moment().add(5.5, 'hours').startOf('day');
      const dueDays = moment(loan.duedate, 'DD/MM/YYYY').startOf('day').diff(currenttime, 'days');
      if (!includes(values(renewalreminderstages), dueDays)) {
        return;
      }
      const data = {
        customer: {
          id: loan.userrefid,
          phone: loan.phone,
        },
        category,
        type,
        provider,
        template: {
          id: templates[getRenewalTypeBasedOnDueDays(dueDays)],
          data: {
            coreid: loan.coreid,
            duedays: Math.abs(dueDays),
            applink,
          },
        },
        correlationid: moment().unix().toString(),
      };
      await notificationService.sendSMS(data);
    } catch (err) {
      logger.error('error in send sms for loan', { loan, err });
    }
  });
};

// send only required details in api
const filterRequiredDetails = (loans) => {
  const filteredResponse = map(loans,
    loan => pick(
      (loan), ['totalloanamount', 'groupedTotalLoanAmount', 'lenderids', 'loans', 'uloanid', 'ulploanid', 'loanid', 'lploanid',
        'type', 'duedate', 'duedays', 'remindertype', 'repaymenttype', 'loanids', 'params', 'loantype', 'schemetype',
        'graceperiodduedate', 'interestamount', 'totalinterestamount', 'groupedtotalinterestamount',
        'slploanid', 'sanctiondate', 'coreid', 'expirydate', 'loanstatus', 'totalclosingamount', 'totaloutstandingamount',
        'totalloanamount', 'totalinterestamount', 'loancount'],
    ));
  return filteredResponse;
};

// decide type of renewal reminder based on due days left
const getRenewalTypeBasedOnDueDays = (duedays) => {
  if (duedays <= renewalreminderstages.overdue) {
    return reminder.smstemplates.renewal.overdue;
  } if (duedays <= renewalreminderstages.due) {
    return reminder.smstemplates.renewal.due;
  }
  return reminder.smstemplates.renewal.upcoming;
};

// get array of all secure and unsecure loanids of a loansgroup
const getloanIdsOfLoangroup = (loans) => {
  const uloanids = map(loans, loan => loan.ulploanid);
  const sloanids = flattenDeep(map(loans, loandata => map(loandata.loans, l => l.lploanid)));
  return concat(uloanids, sloanids);
};
