/* eslint-disable max-len */
const {
  capitalize, chain, find, map, sumBy, get,
} = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const path = require('path');
const RenewalOrder = require('../../../models/renewalorder.model');
const CoreService = require('../../../services/core.service');
const ErrorHandler = require('../../../utils/error');
const {
  coreSigningMethodMap, coreSigningStatusMap, unsecuredLender, repledgeType,
} = require('../../../utils/constants');
const { supportJwtToken } = require('../../../../config/vars');

const signingData = (variables) => {
  if (variables.signingmethod === 'digital' || variables.signingmethod === '2fa') {
    const [otp] = variables.signingrequests.map((request) => request.otp);
    return {
      otp,
    };
  }
  if (variables.signingmethod === 'esign') {
    return {
      ...(variables.secureddocument && {
        signedpc: path.parse(variables.secureddocument.path).name,
      }),
      ...(variables.unsecureddocument && {
        usignedpc: path.parse(variables.unsecureddocument.path).name,
      }),
      ...(variables.renewalLetter && {
        signedpc: path.parse(variables.renewalLetter.path).name,
      }),
    };
  }
  return true;
};

const paidAmount = (totalamount, amountsplit) => {
  if (totalamount <= amountsplit) {
    return totalamount;
  }
  if (totalamount > amountsplit && amountsplit > 0) {
    return amountsplit;
  }
  return '--';
};

const formatData = (meta, items, loandata) => {
  const repledgeSPayments = chain(items)
    .map((item) => {
      item.payment = find(loandata, (loan) => loan.loan.loanid === item.meta.lmsid); // eslint-disable-line no-param-reassign
      return item;
    })
    .map((item) => ({
      loantype: 'secure',
      lmsid: item.meta.lmsid,
      losid: item.meta.losid,
      lender: capitalize(item.meta.lender),
      closingamount: item.meta.secureclosingamount,
      amountpaid: (item.payment ? paidAmount(item.meta.securepaidamount, item.payment.paidamount) : '--'),
      rebate: item.meta.securecashback,
      loanamount: item.meta.oldsecureamount,
      excessamount: item.meta.secureexcessfunding,
      oldloantype: item.meta.oldloantype,
      olddisbursalamount: get(item.meta, 'oldsecuredisbursalamount', '--'),
      oldpf: get(find(item.meta.oldsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
      oldgst: get(find(item.meta.oldsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
      repledgetype: item.meta.repledgetype,
    }))
    .value();
  const repledgedSLoans = map(items, (item) => ({
    losid: item.meta.newlosid,
    lender: capitalize(item.meta.lender),
    loanamount: item.meta.newsecureamount,
    loandate: moment(item.meta.newloandate).format('DD-MM-YYYY'),
    newdisbursalamount: get(item.meta, 'newsecuredisbursalamount', '--'),
    newpf: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
    newgst: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
    repledgetype: item.meta.repledgetype,
  }));
  const repledgedULoans = chain(items)
    .filter((item) => item.meta.newloantype === '1:1')
    .map((item) => ({
      losid: item.meta.newunsecurelosid,
      lender: capitalize(item.meta.unsecurelender || unsecuredLender),
      loanamount: item.meta.newunsecureamount,
      loandate: moment(item.meta.newloandate).format('DD-MM-YYYY'),
      // for now it be undefined, as PF is only for SECURE
      newdisbursalamount: get(item.meta, 'newunsecuredisbursalamount', '--'),
      newpf: get(find(item.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
      newgst: get(find(item.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
      repledgetype: item.meta.repledgetype,
    }))
    .value();

  let repledgeUPayments = [];
  if (meta.renewaltype === '1:1') {
    repledgeUPayments = chain(items)
      .filter((item) => item.meta.oldloantype === '1:1')
      .map((item) => {
        item.payment = find(loandata, (loan) => loan.loan.loanid === item.meta.unsecurelmsid); // eslint-disable-line no-param-reassign
        return item;
      })
      .map((item) => ({
        loantype: 'unsecure',
        lmsid: item.meta.unsecurelmsid,
        losid: item.meta.unsecurelosid,
        lender: capitalize(item.meta.unsecurelender || unsecuredLender),
        closingamount: item.meta.unsecureclosingamount,
        amountpaid: (item.payment ? paidAmount(item.meta.securepaidamount, item.payment.paidamount) : '--'),
        rebate: item.meta.unsecurecashback,
        loanamount: item.meta.oldunsecureamount,
        excessamount: item.meta.unsecureexcessfunding,
        // for now it be undefined, as PF is only for SECURE
        olddisbursalamount: get(item.meta, 'oldunsecuredisbursalamount', '--'),
        oldpf: get(find(item.meta.oldunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
        oldgst: get(find(item.meta.oldunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
        repledgetype: item.meta.repledgetype,
      }))
      .value();
  }
  if (meta.renewaltype === 'N:1') {
    const [unsecuredLoan] = items;
    if (unsecuredLoan.meta.oldloantype === 'N:1') {
      const payment = find(loandata, (loan) => loan.loan.loanid === unsecuredLoan.meta.unsecurelmsid);
      const totalamount = sumBy(items, 'meta.securepaidamount');
      repledgeUPayments = [
        {
          loantype: 'unsecure',
          lmsid: unsecuredLoan.meta.unsecurelmsid,
          losid: unsecuredLoan.meta.unsecurelosid,
          lender: capitalize(unsecuredLoan.meta.unsecurelender || unsecuredLender),
          closingamount: sumBy(items, 'meta.unsecureclosingamount'),
          amountpaid: (payment ? paidAmount(totalamount, payment.paidamount) : '--'),
          rebate: sumBy(items, 'meta.unsecurecashback'),
          loanamount: sumBy(items, 'meta.oldunsecureamount'),
          excessamount: sumBy(items, 'meta.unsecureexcessfunding'),
          // for now it be undefined, as PF is only for SECURE
          olddisbursalamount: get(unsecuredLoan.meta, 'oldunsecuredisbursalamount', '--'),
          oldpf: get(find(unsecuredLoan.meta.oldunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
          oldgst: get(find(unsecuredLoan.meta.oldunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
          repledgetype: unsecuredLoan.meta.repledgetype,
        },
      ];
    }
  }

  return {
    payments: [
      ...repledgeSPayments,
      ...repledgeUPayments,
    ],
    repledges: [
      ...repledgedSLoans,
      ...repledgedULoans,
    ],
  };
};

module.exports = () => ({
  taskType: 'renewal.loans.renew',
  taskHandler: async (job) => {
    try {
      const order = await RenewalOrder.findOne({
        _id: job.variables.orderid,
        status: {
          $ne: 'cancelled',
        },
        paymentstatus: 'success',
      }).populate('items');

      if (order) {
        const data = {
          loandetails: map(order.items, (item) => ({
            loanid: item.meta.losid.toString(),
            oldsecureamount: item.meta.oldsecureamount,
            newsecureamount: item.meta.newsecureamount,
            oldunsecureamount: item.meta.oldunsecureamount,
            newunsecureamount: item.meta.newunsecureamount,
            oldloandate: moment(item.meta.oldloandate).format('YYYY-MM-DD'),
            newloandate: moment(item.meta.newloandate).format('YYYY-MM-DD'),
            oldschemeid: job.variables.version >= 2 ? getSchemeIdFromCoreSchemeId(item.meta.oldscheme.coreSchemeId) : item.meta.oldscheme.id,
            newschemeid: job.variables.version >= 2 ? getSchemeIdFromCoreSchemeId(item.meta.newscheme.coreSchemeId) : item.meta.newscheme.id,
            ...(item.meta.oldscheme && item.meta.oldscheme.masterSchemeId && { oldmasterschemeid: item.meta.oldscheme.masterSchemeId }),
            ...(item.meta.newscheme && item.meta.newscheme.masterSchemeId && { newmasterschemeid: item.meta.newscheme.masterSchemeId }),
            ...(item.meta.newsecuredisbursalamount && item.meta.newsecurecharges && {
              newsecuredisbursalamount: item.meta.newsecuredisbursalamount,
              newsecurecharges: item.meta.newsecurecharges,
            }),
            ...(item.meta.newunsecuredisbursalamount && item.meta.newunsecurecharges && {
              newunsecuredisbursalamount: item.meta.newunsecuredisbursalamount,
              newunsecurecharges: item.meta.newunsecurecharges,
            }),
            repledgetype: item.meta.repledgetype,
            currentslab: get(job.variables.currentSlabs, [item.meta.lmsid, 'index']) || 1,
          })),
          signstatus: coreSigningStatusMap[job.variables.signingstatus],
          signtype: coreSigningMethodMap[job.variables.signingmethod],
          orderrefno: job.variables.orderid,
          ...(job.variables.signingstatus === 'success' && signingData(job.variables)),
          tenureextension: job.variables.tenureextension,
        };
        const response = job.variables.version >= 2 ? await CoreService.renewLoansVersion4(supportJwtToken, data) : await CoreService.renewLoans(job.variables.token, data);

        const transformedItems = await Promise.map(order.items, async (item) => {
          const loanMap = find(response.loans, (loan) => loan.renewedloan && loan.renewedloan.sloanid === item.meta.losid);
          if (loanMap) {
            // Assumption: LOS ID is not changing after renewal
            item.meta.newlosid = loanMap.renewedloan.sloanid; // eslint-disable-line no-param-reassign
            item.markModified('meta.newlosid');
            if (loanMap.renewedloan.uloanid) {
              item.meta.newunsecurelosid = loanMap.renewedloan.uloanid; // eslint-disable-line no-param-reassign
              item.markModified('meta.newunsecurelosid');
            }

            await item.save();
          }
          return item;
        });

        const withoutRenewalLoan = !find(order.items, (item) => item.meta.repledgetype !== repledgeType.LOAN_ENHANCEMENT);

        return job.complete({ loans: formatData(order.meta, transformedItems, job.variables.loandata), withoutRenewalLoan });
      }

      return job.fail('Order Not Found');
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});

const getSchemeIdFromCoreSchemeId = (coreSchemeId) => {
  if (!coreSchemeId) return null;
  return parseInt(coreSchemeId.split('-')[1], 10);
};
