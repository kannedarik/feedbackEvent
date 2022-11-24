const mongoose = require('mongoose');
const { map } = require('lodash');
// eslint-disable-next-line no-unused-vars
const CoreService = require('../../../services/core.service');
const PaymentService = require('../../../services/payment.service');
const ErrorHandler = require('../../../utils/error');
const OrderItem = require('../../../models/orderitem.model');

module.exports = () => ({
  taskType: 'renewal.order.van',
  taskHandler: async (job) => {
    try {
      const [items, profile] = await Promise.all([
        getorderitems(job.variables.orderid),
        CoreService.getCustomerProfile(job.variables.token),
      ]);

      const data = {
        kycname: profile.customerprofile.customerproofname,
        phone: job.variables.phone,
        refid: job.variables.customer.id,
        lenderid: job.variables.securedlender,
        loandata: map(items, (loan) => ({
          txn_date: loan.createdAt,
          rzp_pay_id: job.variables.pgresponseid,
          securedloanid: loan.meta.lmsid,
          unsecuredloanid: loan.meta.unsecurelmsid,
          amount: loan.meta.securepaidamount,
          type: loan.meta.newloantype,
        })),
      };

      await PaymentService.createRenewalVan(job.variables.token, data);

      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});

const getorderitems = async (orderid) => OrderItem.find({
  orderId: mongoose.Types.ObjectId(orderid),
}).lean();
