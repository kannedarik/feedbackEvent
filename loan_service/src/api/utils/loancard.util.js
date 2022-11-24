/* eslint-disable max-len */
const {
  isEmpty,
  sumBy,
  flattenDeep,
  join,
  compact,
  orderBy,
  isEqual,
  add,
  forEach,
  map,
  keys,
  groupBy,
  concat,
  has,
  includes,
  reduce,
  find,
  uniq,
  values,
  get,
} = require('lodash');
const moment = require('moment');

const {
  reminder, los, lendersList, accounts, inProgress, producttype, loanTypes,
} = require('./constants');
const losService = require('../services/los');
const omsService = require('../services/oms');
const { lenders } = require('../../config/vars');

const hasHighPriority = (loan, currentreminder) => reminder.priorityorder[currentreminder.remindertype] > reminder.priorityorder[loan.remindertype];
const hasSameReminderTypeAndDueDays = (loan1, loan2) => loan2 && isEqual(loan1.remindertype, loan2.remindertype) && isEqual(loan1.duedays, loan2.duedays);
const isCLM = loanType => loanType && isEqual(loanType.toUpperCase(), accounts.loanType.CLM);

/*
for each loan filtering the high priority remindertype
based on the priority order of reminder types
*/
exports.filterPriorityLoanReminders = async (loanReminders) => {
  const allLoanReminders = flattenDeep(loanReminders);
  const priorityLoans = reduce(allLoanReminders,
    (result, loanReminder) => {
      const { slploanid } = loanReminder;
      // eslint-disable-next-line no-param-reassign
      if (!result[slploanid] || hasHighPriority(loanReminder, result[slploanid])) { result[slploanid] = loanReminder; }
      return result;
    }, {});
  return priorityLoans;
};

/*

* grouping all the loans reminders belonging to the same loangroup which has same remindertype and duedays,
* sorting the all the reminder objects based on priority order of reminder type and duedays

*/
exports.groupLoansBasedonReminderandDuedate = async (priorityLoans, jewelDetails, maploansdata) => {
  const priorityLoanGroups = map(maploansdata, g => compact(map(g, loan => priorityLoans[loan.loans[0].lploanid])));
  let loanCardViews = compact(map(priorityLoanGroups, (loanGroup) => {
    const loanCardView = reduce((loanGroup), (loanCard, priorityLoan) => groupLoans(loanCard, priorityLoan), {});

    if (!isEmpty(loanCardView)) {
      addParamsForGroupedLoans(loanCardView, loanGroup[0].loanids);
      addJewelDetails(loanCardView, loanGroup, jewelDetails);
      return loanCardView;
    }
    return null;
  }));

  // sorting the loans based on reminder and duedays
  loanCardViews = orderBy(loanCardViews,
    [loans => reminder.priorityorder[loans.remindertype], loans => ((loans.remindertype === keys(reminder.renewalstages)[2]
      || loans.remindertype === keys(reminder.reminderdays)[1])
      ? loans.duedays : -1 * loans.duedays),
    ], ['asc', 'desc']);
  return loanCardViews;
};

/*
grouping the high priority reminders for groupedloans and filtering the others
*/
const groupLoans = (loanCardView, loanReminder) => {
  if ((isEmpty(loanCardView) || hasSameReminderTypeAndDueDays(loanCardView, loanReminder))) {
    return addLoanInfo(loanCardView, loanReminder);
  }
  if ((hasHighPriority(loanReminder, loanCardView) || hasSameReminderTypeAndDiffDueDays(loanCardView, loanReminder)
  || isEmpty(loanCardView.remindertype))) {
    return addLoanInfo({}, loanReminder);
  }
  return loanCardView;
};

/*
 For a loan card view object and adds the loans details with same remindertype and duedays
 1. Adds the common data of the loan card view
 2. Adds the data based on reminder type

*/
const addLoanInfo = (loanCardView, loanReminder) => {
  let updateLoanCardView = loanCardView;
  if (isEmpty(loanCardView)) {
    updateLoanCardView = loanCardCommonData(loanReminder);
  }
  if (isEqual(loanReminder.repaymenttype, reminder.repaymenttype.interest)) {
    return interestReminderRequiredInfo(updateLoanCardView, loanReminder);
  }
  return renewalReminderRequiredInfo(updateLoanCardView, loanReminder);
};

// adding paramaters loanids string and repayment type for quick links
const addParamsForGroupedLoans = (loanCardView, groupLoanids) => {
  const updateLoanCardView = loanCardView;
  if (isEqual(loanCardView.remindertype, reminder.remindertype.nextinterestdue)
    || isEmpty(loanCardView.remindertype)) {
    updateLoanCardView.repaymenttype = null;
    updateLoanCardView.params = {
      loanids: join(compact(groupLoanids), ','),
    };
    return updateLoanCardView;
  }
  updateLoanCardView.params = {
    repayment_type: loanCardView.repaymenttype,
    loanids: join(compact(loanCardView.loanids), ','),
  };
  return updateLoanCardView;
};

// add total jewel count and picturelink for a grouped loan
const addJewelDetails = (loanCardView, loanGroup, jewelDetails) => {
  if (isEmpty(jewelDetails)) return loanCardView;
  const updateLoanCardView = loanCardView;
  updateLoanCardView.jeweldetails = {
    picturelink: (jewelDetails[loanCardView.coreids[0]]) ? jewelDetails[loanCardView.coreids[0]].picturelink : undefined,
    jewelcount: sumBy(loanGroup, (loan) => {
      if (jewelDetails[loan.coreid]) return (jewelDetails[loan.coreid].jewelcount);
      return 0;
    }),
  };
  return updateLoanCardView;
};

// Adds the common information for all the reminder types
const loanCardCommonData = (loanReminder) => {
  const commonDetails = {
    lenderids: loanReminder.lenderids,
    remindertype: loanReminder.remindertype,
    duedays: loanReminder.duedays,
    duedate: moment(loanReminder.duedate, 'DD/MM/YYYY').startOf('day').toISOString(),
    repaymenttype: loanReminder.repaymenttype,
    loandate: (moment(loanReminder.sanctiondate, 'DD/MM/YYYY').startOf('day').toISOString() || loanReminder.sanctiondate),
    groupedtotalloanamount: loanReminder.groupedtotalloanamount,
    totalloans: loanReminder.totalloans,
  };
  return commonDetails;
};


// for interest type reminders grouped loanids and coreids are updated
const interestReminderRequiredInfo = (LoanCardView, loanReminder) => {
  const updatedLoanCardView = {
    ...LoanCardView,
    loanids: addSecureUnsecureLoanIds(LoanCardView, loanReminder),
    coreids: addSecureCoreIds(LoanCardView, loanReminder),
    graceperiodduedate: loanReminder.graceperiodduedate ? moment(loanReminder.graceperiodduedate, 'DD/MM/YYYY').endOf('day').toISOString() : undefined,
    groupedinterestamount: updateGroupedInterestAmount(LoanCardView, loanReminder),
  };
  return updatedLoanCardView;
};


// for renewal type reminders grouped loanids and coreids are updated
const renewalReminderRequiredInfo = (LoanCardView, loanReminder) => {
  const updatedLoanCardView = {
    ...LoanCardView,
    loanids: addSecureUnsecureLoanIds(LoanCardView, loanReminder),
    coreids: addSecureCoreIds(LoanCardView, loanReminder),
  };
  return updatedLoanCardView;
};

// adds the secure and unsecureloanids
const addSecureUnsecureLoanIds = (LoanCardView, loanReminder) => {
  const loanids = LoanCardView.loanids || [];
  loanids.push(loanReminder.slploanid);
  if (loanReminder.ulploanid) loanids.push(loanReminder.ulploanid);
  return loanids;
};

// adds the secure coreids for given loans
const addSecureCoreIds = (LoanCardView, loanReminder) => {
  const coreids = LoanCardView.coreids || [];
  coreids.push(loanReminder.coreid);
  return coreids;
};

// updates the interest amounts
const updateGroupedInterestAmount = (LoanCardView, loanReminder) => add(loanReminder.totalinterestamount, LoanCardView.groupedinterestamount);

/*
for the loan with same reminder and  diff due date and returns true if the loan reminder has earliest dueday or highest overdue
*/
const hasSameReminderTypeAndDiffDueDays = (loan1, loan2) => {
  if (loan2 && !isEqual(loan1.remindertype, loan2.remindertype)) {
    return false;
  }
  if (includes([reminder.remindertype.interestoverdue, reminder.remindertype.interestoverdue], loan1.remindertype)) return loan1.duedays < loan2.duedays;
  return loan1.duedays > loan2.duedays;
};

/*
fetch jewel details from los service
*/
exports.getJewelDetails = async (maploansdata, token) => {
// get all lonids from payments data
  const loanIds = compact(map(flattenDeep(maploansdata), (loan) => {
    if (!(loan.loans[0].hideLoan && loan.loans[0].hideLoan.enable)) {
      return loan.loans[0].loanid;
    }
    return null;
  }));
  // fetch the jewellist for each loanid
  const filter = {
    loanIds: loanIds.join(','),
    fetchUnselectedLoans: false,
    productCategory: los.productcategory.goldloan,
  };
  const jewelListDetails = await losService.jewelList(token, filter);
  // get all loan objects with jewel details
  const allLoans = flattenDeep(map(jewelListDetails, jewelList => map(jewelList.branch, ({ loans }) => loans)));

  const coreidMappedJewels = getLoanMappedJewels(allLoans);
  return coreidMappedJewels;
};

/*
maps the coreid to total jewelcount and a one of the jewel picture
*/
const getLoanMappedJewels = (loans) => {
  const coreidMappedJewels = {};
  forEach(loans, (loan) => {
    coreidMappedJewels[loan.loanId] = {
      picturelink: loan.jewels[0].pictureLink,
      jewelcount: sumBy(loan.jewels, 'noOfItems'),
    };
  });
  return coreidMappedJewels;
};

/*
for the loans which are not there in account service
*/

exports.getLoanDetailsForNoReminders = async (priorityReminders, paymentsdata, maploansdata, jewelDetails) => {
  const paymentloans = flattenDeep(paymentsdata.loans);
  const allloans = groupBy(concat(paymentloans), 'coreid');

  const groupedloanstotal = compact(map(maploansdata, (group) => {
    let loanCardView = {};
    forEach(group, (g) => {
      forEach(g.loans, (loan) => {
        if (!(loan.hideLoan && loan.hideLoan.enable)) {
          const [isVisible, loandata] = isVisibleLoan(allloans, loan.loanid);

          if (isVisible && loan && !priorityReminders[loandata.loanid]) {
          // eslint-disable-next-line no-param-reassign
            loanCardView = loanCardViewforNoReminder(loanCardView, loandata, true, g.uloanid);
          }
        }
      });
      if ((g.uloanid) && !isEmpty(loanCardView)) {
        const [isVisible, loandata] = isVisibleLoan(allloans, g.uloanid);
        if (isVisible) {
          // eslint-disable-next-line no-param-reassign
          loanCardView = loanCardViewforNoReminder(loanCardView, loandata, false);
        }
      }
      if (isEmpty(loanCardView)) {
        // eslint-disable-next-line no-param-reassign
        loanCardView = {};
      }
      return loanCardView;
    }, {});
    if (!isEmpty(loanCardView)) {
      if (!isEmpty(jewelDetails)) {
        loanCardView.jeweldetails = {
          picturelink: jewelDetails[loanCardView.coreids[0]] ? jewelDetails[loanCardView.coreids[0]].picturelink : undefined,
          jewelcount: sumBy(loanCardView.coreids, (coreid) => {
            if (jewelDetails[coreid]) return (jewelDetails[coreid].jewelcount);
            return 0;
          }),
        };
      }
      addParamsForGroupedLoans(loanCardView, loanCardView.loanids);
      return loanCardView;
    }
    return null;
  }));

  return groupedloanstotal;
};

/*
loan card view details for loan group with no reminder details or next interest due details
*/
const loanCardViewforNoReminder = (loanCardView, loan, isSecured, uloanid) => {
  const updatedLoanCardView = loanCardView;
  if (isEmpty(loanCardView)) {
    updatedLoanCardView.loandate = loan.loanstartedon;
    updatedLoanCardView.lenderids = (uloanid) || isCLM(loan.loantype) ? [loan.lenderid, lendersList.rupeek] : [loan.lenderid];
    updatedLoanCardView.loanids = [];
    updatedLoanCardView.coreids = [];
  }
  updatedLoanCardView.loanids.push(loan.loanid);
  if (isSecured) {
    updatedLoanCardView.coreids.push(loan.coreid);
    updatedLoanCardView.totalloans = add(loanCardView.totalloans, 1);
  }

  updatedLoanCardView.groupedtotalloanamount = add(loanCardView.groupedtotalloanamount, loan.loanamount);
  return updatedLoanCardView;
};

/**
 * filter loans
 */
const isVisibleLoan = (loans, id) => {
  if (has(loans, id)) {
    const loandata = loans[id][0]; // Need to take this as above object is groupby
    if (!loandata.repledged) return [true, loandata];
    return [false, null];
  }
  return [false, null];
};

exports.getRenewalPendingReminders = async (token, orderIds) => {
  const params = {
    orderIds: orderIds.join(','),
    loanCard: true,
  };
  const activeRenewalOrders = await omsService.getRenewalOrderDetails(token, params);
  const RenewalPendingReminders = await inProgressLoanReminderResponse(activeRenewalOrders, inProgress.types.renewal);
  return RenewalPendingReminders;
};

// in progress reminder cards response
const inProgressLoanReminderResponse = (inProgressLoans, loanType) => {
  const loans = map(inProgressLoans, (loan) => {
    const { reminderType } = inProgress[loanType];
    const coreIds = map(loan.loans, eachLoan => eachLoan.secureloanid);
    const loanReminder = {
      loandate: loan.loans[0].loandate,
      lenderids: loan.lenders,
      groupedtotalloanamount: sumBy(loan.loans, eachLoan => eachLoan.totalnewloanamount),
      params: { orderIds: loan.id, type: loanTypes.renewal },
      remindertype: reminderType,
      totalloans: loan.loans.length,
      coreids: coreIds,
    };
    return loanReminder;
  });
  return loans;
};

/*
fetch part release reminders and new coreIds
fetch fresh loan reminders
return the reminders based on type
*/

exports.getFreshAndPartReleaseLoanReminders = async (mapLoansData, id, token, type) => {
  const { partReleaseReminders, partReleaseCoreIds } = await getPartReleaseReminders(id, token);
  const freshLoanDetails = compact(map(mapLoansData, loanGroup => getFreshLoanResponse(loanGroup, partReleaseCoreIds)));
  let reminders = [];
  if (includes(type, loanTypes.partRelease)) {
    reminders = [...partReleaseReminders, ...reminders];
  }
  if (includes(type, loanTypes.freshLoan)) {
    reminders = [...freshLoanDetails, ...reminders];
  }
  return reminders;
};


/*
1. Fetch loans from mapped loans whose lms Ids are empty
2. Filter out the loans which are part release loans based on
part release coreIds
3. Transform the response.
*/
const getFreshLoanResponse = (inProgressLoans, partReleaseCoreIds) => {
  let freshLoanObject = {};
  freshLoanObject.loans = compact(map(inProgressLoans, (loanGroup) => {
    if (!isEmpty(loanGroup.loans) && !loanGroup.loans[0].lploanid && !loanGroup.loans[0].orderId && !includes(partReleaseCoreIds, loanGroup.loans[0].loanid)) {
      return {
        secureloanid: loanGroup.loans[0].loanid,
        totalnewloanamount: sumBy(loanGroup.loans, eachLoan => eachLoan.sloanamount) + ((loanGroup.uloanamount) ? loanGroup.uloanamount : 0),
      };
    }
    return null;
  }));
  if (!isEmpty(freshLoanObject.loans)) {
    const coreIds = map(freshLoanObject.loans, eachLoan => eachLoan.secureloanid);
    freshLoanObject = {
      lenderids: (inProgressLoans[0].uloanid || isEqual(inProgressLoans[0].productType, producttype.CLM)) ? [inProgressLoans[0].lender, lendersList.rupeek] : [inProgressLoans[0].lender],
      remindertype: inProgress.types.freshLoan,
      groupedtotalloanamount: sumBy(freshLoanObject.loans, eachLoan => eachLoan.totalnewloanamount),
      params: { coreIds: coreIds.join(','), type: loanTypes.freshLoan },
      totalloans: freshLoanObject.loans.length,
      coreids: coreIds,
      loandate: inProgressLoans[0].checkoutTime,

    };
    return freshLoanObject;
  }
  return null;
};

/*
fetch in progress part release orders for release service.
transform them into partRelease Reminders.
return reminders and new coreIds.
*/
const getPartReleaseReminders = async (customerId, token) => {
  const filters = {
    process: los.orders.partRelease,
    customerId,
    newLoanRequestRequired: true,
    orderStatus: los.orderStatus.inProgress,
  };
  const orders = await losService.orders(token, filters);
  const partReleaseReminders = compact(map(orders, order => getPartReleaseResponse(order)));
  const partReleaseCoreIds = flattenDeep(map(partReleaseReminders, eachReminder => eachReminder.coreids));
  return { partReleaseReminders, partReleaseCoreIds };
};

/*
For a part release Order, for each order Item
Fectch the new loan details.
Transform the respose and return the reminder object
*/
const getPartReleaseResponse = (partReleaseOrder) => {
  const requestToLoanAmount = {};
  const partReleaseLoans = compact(map(partReleaseOrder.orderItems, (orderItem) => {
    if (requestToLoanAmount[orderItem.newLoanRequestId]) return null;
    const newLoanDetails = getNewLoanDetails(orderItem);
    if (newLoanDetails) {
      requestToLoanAmount[newLoanDetails.newLoanRequest ? orderItem.newLoanRequestId : orderItem.id] = newLoanDetails.loanAmount;
    }
    return newLoanDetails;
  }));

  if (!isEmpty(partReleaseLoans)) {
    return {
      lenderids: uniq(flattenDeep(map(partReleaseLoans, eachLoan => eachLoan.newLoanLenders))),
      remindertype: inProgress.types.partRelease,
      groupedtotalloanamount: sumBy(values(requestToLoanAmount)),
      params: { partReleaseOrderIds: partReleaseOrder.id, type: loanTypes.partRelease },
      totalloans: partReleaseLoans.length,
      coreids: uniq(flattenDeep(map(partReleaseLoans, eachLoan => eachLoan.newloanIds))),
      loandate: partReleaseLoans[0].loanDate,
    };
  }
  return null;
};

/*
for a part release Order, for each order Item
1. Check if the new loan request is created or not for the order item
2. If created fetch the new loan request details (loanAmount, newloanIds
   and newloanLenders and loanDate)
3. If not created return estimsted new Loan Details
*/
const getNewLoanDetails = (orderItem) => {
  const { newLoanRequestDetails } = orderItem;
  let loanDate = (!isEmpty(orderItem.newLoanDetails)) ? orderItem.newLoanDetails[0].loanDate : undefined;
  let loanAmount = 0;
  let newLoanLenders = [];
  let newLoanRequest = false;
  const newloanIds = [];
  if (newLoanRequestDetails && !isEmpty(newLoanRequestDetails.loans)) {
    const secureLender = get(find(orderItem.loanDetails, loan => loan.type === 'secure'), 'lender');
    forEach(newLoanRequestDetails.loans, (eachLoan) => {
      if (isEmpty(eachLoan.lpLoanId)) {
        const unSecureComponent = find(newLoanRequestDetails.uloans, loan => loan.sloanid === eachLoan.loanId);
        const loanLender = isEmpty(newLoanRequestDetails.uloans) ? [secureLender]
          : [secureLender, lenders.rupeek];
        loanAmount += eachLoan.amount + (unSecureComponent ? unSecureComponent.loanamount : 0);
        newloanIds.push(eachLoan.loanId);
        newLoanLenders = [...loanLender, ...newLoanLenders];
        loanDate = (newLoanRequestDetails.timestamps && newLoanRequestDetails.timestamps.checkoutTimestamp)
          ? newLoanRequestDetails.timestamps.checkoutTimestamp : loanDate;
      }
      newLoanRequest = true;
    });
  }
  if (newLoanRequest && (isEmpty(newloanIds) || !loanAmount)) return null;
  if (!newLoanRequest && isEmpty(orderItem.newLoanDetails)) return null;
  return {
    loanAmount: (loanAmount) || sumBy(orderItem.newLoanDetails, loan => loan.loanAmount),
    newLoanLenders: !isEmpty(newLoanLenders) ? newLoanLenders : [...map(orderItem.newLoanDetails, loan => loan.lender)],
    newloanIds,
    loanDate,
    newLoanRequest,
  };
};
