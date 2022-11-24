const {
  capitalize,
  chain,
  isEmpty,
  map,
  sample,
  sumBy,
  find,
  get,
} = require('lodash');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { env } = require('../../../../config/vars');
const OrderItem = require('../../../models/orderitem.model');
const NotificationService = require('../../../services/notification.service');
const CoreCache = require('../../../utils/cache/core');
const Constants = require('../../../utils/constants');
const NotificationCache = require('../../../utils/cache/notification');
const ErrorHandler = require('../../../utils/error');
const { loantypemapping, ticket, zohodesk } = require('../../../utils/constants');

const getRenewalAmountType = (repledgetype) => (repledgetype === 'ENHANCE' ? 'Eligible Amount' : (repledgetype === 'NONENHANCE' ? 'Closing Amount' : 'Balance Amount')); // eslint-disable-line no-nested-ternary

const isPositiveNumber = (n) => Number(n) === n && n > 0;

const formatData = (items, renewaltype) => {
  if (renewaltype === 'N:1') {
    const [unsecuredLoan] = items;
    return {
      combined: true,
      renewaltype: unsecuredLoan.meta.oldloantype ? loantypemapping[unsecuredLoan.meta.oldloantype] : renewaltype, // eslint-disable-line max-len
      secured: map(items, (item, idx) => ({
        idx: idx + 1,
        lmsid: item.meta.lmsid,
        loanamount: item.meta.oldsecureamount,
        closingamount: item.meta.secureclosingamount,
        rebookamount: item.meta.newsecureamount,
        rebate: item.meta.securecashback,
        excessamount: item.meta.secureexcessfunding,
        securenextworkingdayinterest: item.meta.securenextworkingdayinterest,
        securenextworkingdaycashback: item.meta.securenextworkingdaycashback,
        unsecurerebookamount: item.meta.newloantype === '1:1' ? item.meta.newunsecureamount : '--',
        renewalAmountType: getRenewalAmountType(item.meta.repledgetype),
        /* Secure Processing fee charges */
        ...(isPositiveNumber(item.meta.secureprocessingfeecharge) && {
          hasProcessingFee: isPositiveNumber(item.meta.secureprocessingfeecharge),
          processingFeeCharge: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
          newSecureDisbursalAmount: item.meta.newsecuredisbursalamount,
          gst: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
        }),
      })),
      ...(unsecuredLoan.meta.oldloantype === 'N:1' && {
        unsecured: {
          lmsid: unsecuredLoan.meta.unsecurelmsid,
          loanamount: sumBy(items, 'meta.oldunsecureamount'),
          closingamount: sumBy(items, 'meta.unsecureclosingamount'),
          rebate: sumBy(items, 'meta.unsecurecashback'),
          excessamount: sumBy(items, 'meta.unsecureexcessfunding'),
          /* Unsecure Processing fee charges */
          ...(isPositiveNumber(unsecuredLoan.meta.unsecureprocessingfeecharge) && {
            hasProcessingFee: isPositiveNumber(unsecuredLoan.meta.unsecureprocessingfeecharge),
            processingFeeCharge: get(find(unsecuredLoan.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
            newUnSecureDisbursalAmount: unsecuredLoan.meta.newunsecuredisbursalamount,
            gst: get(find(unsecuredLoan.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
          }),
          unsecurenextworkingdayinterest: unsecuredLoan.meta.unsecurenextworkingdayinterest,
          unsecurenextworkingdaycashback: unsecuredLoan.meta.unsecurenextworkingdaycashback,
        },
      }),
      daysinnextworkingday: unsecuredLoan.meta.daysinnextworkingday,
    };
  }

  return {
    combined: false,
    loans: map(items, (item) => ({
      renewaltype: item.meta.oldloantype ? loantypemapping[item.meta.oldloantype] : renewaltype,
      secured: {
        lmsid: item.meta.lmsid,
        loanamount: item.meta.oldsecureamount,
        closingamount: item.meta.secureclosingamount,
        rebookamount: item.meta.newsecureamount,
        rebate: item.meta.securecashback,
        excessamount: item.meta.secureexcessfunding,
        securenextworkingdayinterest: item.meta.securenextworkingdayinterest,
        securenextworkingdaycashback: item.meta.securenextworkingdaycashback,
        unsecurerebookamount: item.meta.newloantype === '1:1' ? item.meta.newunsecureamount : '--',
        renewalAmountType: getRenewalAmountType(item.meta.repledgetype),
        /* Secure Processing fee charges */
        ...(isPositiveNumber(item.meta.secureprocessingfeecharge) && {
          hasProcessingFee: isPositiveNumber(item.meta.secureprocessingfeecharge),
          processingFeeCharge: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
          newSecureDisbursalAmount: item.meta.newsecuredisbursalamount,
          gst: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
        }),
      },
      ...(item.meta.oldloantype === '1:1' && {
        unsecured: {
          lmsid: item.meta.unsecurelmsid,
          loanamount: item.meta.oldunsecureamount,
          closingamount: item.meta.unsecureclosingamount,
          rebate: item.meta.unsecurecashback,
          excessamount: item.meta.unsecureexcessfunding,
          /* Unsecure Processing fee charges */
          ...(isPositiveNumber(item.meta.unsecureprocessingfeecharge) && {
            hasProcessingFee: isPositiveNumber(item.meta.unsecureprocessingfeecharge),
            processingFeeCharge: get(find(item.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
            newUnSecureDisbursalAmount: item.meta.newunsecuredisbursalamount,
            gst: get(find(item.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
          }),
          unsecurenextworkingdayinterest: item.meta.unsecurenextworkingdayinterest,
          unsecurenextworkingdaycashback: item.meta.unsecurenextworkingdaycashback,
        },
      }),
      daysinnextworkingday: item.meta.daysinnextworkingday,
    })),
  };
};

module.exports = () => ({
  taskType: 'renewal.notification.ticket',
  taskHandler: async (job) => {
    try {
      const [category, provider, type, template, city, lender] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
        NotificationCache.getTemplates(job.customHeaders.template),
        CoreCache.getCities(job.variables.cityid || job.variables.customer.city.id, 'object', false, 'id', 'name'),
        CoreCache.getLenders(job.variables.securedlender, 'object', false, 'slug', 'name'),
      ]);

      const items = await OrderItem.find({
        orderId: mongoose.Types.ObjectId(job.variables.orderid),
        'meta.repledgetype': { $ne: Constants.repledgeType.LOAN_ENHANCEMENT },
      }).lean();

      if (isEmpty(items)) {
        return job.complete();
      }

      const securedGLNumbers = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'secure' })
        .map((loan) => loan.lmsid)
        .value() : map(items, (item) => item.meta.lmsid);
      const unsecuredGLnumbers = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'unsecure' })
        .map((loan) => loan.lmsid)
        .value() : [];
      const transformedData = formatData(items, job.variables.renewaltype);
      const { tenureextensioncriteria } = job.variables;

      const data = {
        customer: {
          id: job.variables.customer.id,
          phone: job.variables.phone,
        },
        category,
        type,
        provider,
        template: {
          id: template,
          data: {
            ...transformedData,
            name: job.variables.customer.name,
            phone: job.variables.phone,
            ispartial: job.variables.ispartial ? 'Partial Renewal' : 'Full Renewal',
            tenureextension: job.variables.tenureextension,
            ...(tenureextensioncriteria && {
              lessthanloanamount: tenureextensioncriteria === 'loanamount',
              lessthanoutstandingamount: tenureextensioncriteria === 'outstandingamount',
            }),
          },
        },
        options: {
          subject: `${env !== 'production' ? '[Test Ticket] ' : ''}Renewal payment successful, ${capitalize(job.variables.signingmethod)} signature ${job.variables.signingstatus}`,
          assignee: sample(ticket.renewal[job.customHeaders.department]),
          department: zohodesk[job.customHeaders.department],
        },
        correlationid: uuidv4(),
        custom: {
          cf_city: city,
          cf_lender: lender,
          cf_gl_no: securedGLNumbers.join(','),
          cf_unsecured_gl: unsecuredGLnumbers.join(','),
        },
      };
      await NotificationService.sendTicket(data);

      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
