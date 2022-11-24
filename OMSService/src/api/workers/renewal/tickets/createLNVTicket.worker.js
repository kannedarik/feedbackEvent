const moment = require('moment');
const Agenda = require('agenda');
const {
  chain,
  isEmpty,
  map,
  find,
  isEqual,
} = require('lodash');
const zeebeWorker = require('../../../utils/zeebeWorker');
const RenewalOrder = require('../../../models/renewalorder.model');
const OrderItem = require('../../../models/orderitem.model');
const NotificationCache = require('../../../utils/cache/notification');
const CoreCache = require('../../../utils/cache/core');
const ErrorHandler = require('../../../utils/error');
const { mongo } = require('../../../../config/vars');

const agenda = new Agenda({
  db: {
    address: mongo.uri,
  },
});

module.exports = zeebeWorker('renewal.tickets.createLNVTicket',
  async (job) => {
    try {
      const [category, provider, type] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
      ]);

      const order = await RenewalOrder.findOneAndUpdate({ _id: job.variables.orderid }, {
        appliedForRenewalAt: moment().toISOString(),
      }, { new: true });

      const items = await OrderItem.find({
        orderId: job.variables.orderid,
      }).lean();

      if (isEmpty(items)) {
        return job.complete();
      }
      const [securedLoan] = items;
      const [lender] = await CoreCache.getLenders({ id: securedLoan.meta.lenderid }, 'array');
      const branch = find(lender.branches, { id: securedLoan.meta.branchid });

      const securedGLNumbers = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'secure' })
        .map((loan) => loan.lmsid)
        .value() : map(items, (item) => item.meta.lmsid);
      const unsecuredGLnumbers = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'unsecure' })
        .map((loan) => loan.lmsid)
        .value() : [];
      const data = {
        orderId: job.variables.orderid,
        category,
        provider,
        type,
        customer: {
          id: job.variables.customer.id,
          phone: job.variables.phone,
          name: job.variables.customer.name,
        },
        lenderDetails: {
          lenderName: lender.name,
          lenderBranch: branch.branchname,
        },
        loanIds: [...securedGLNumbers, ...unsecuredGLnumbers],
        city: branch.city,
      };
      if (isEqual(order.signingstatus, 'success')) {
        await agenda.schedule('in 6 days', 'LoanNotVisibleTicketCreation', data);
      } else {
        await agenda.schedule('in 10 days', 'LoanNotVisibleTicketCreation', data);
      }
      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  });
