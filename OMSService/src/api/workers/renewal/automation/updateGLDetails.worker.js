const moment = require('moment');
const _ = require('lodash');
const zeebeWorker = require('../../../utils/zeebeWorker');
const OrderItem = require('../../../models/orderitem.model');
const SupportService = require('../../../services/support.service');
const { logger } = require('../../../../config/logger');

const hasUnsecureComponent = (orderItem) => orderItem.meta.newloantype === '1:1' || orderItem.meta.newloantype === 'N:1';

const formatDate = (dayString) => moment(dayString, 'DD-MM-YYYY').format('DD/MM/YYYY');

module.exports = zeebeWorker('renewal.automation.updateGLDetails',
  async (job) => {
    try {
      const orderItems = await OrderItem.find({ orderId: job.variables.orderid });
      const renewalByLenderCompleted = orderItems.every((orderItem) => {
        const renewalCompleted = _.get(orderItem, 'meta.renewalMISData.isClosedMISValid')
          && _.get(orderItem, 'meta.renewalMISData.isOpenedMISValid')
          && _.get(orderItem, 'meta.newlmsid');
        return renewalCompleted;
      });

      await SupportService
        .createGeneralLedger(job.variables.orderid, orderItems.map((orderItem) => ({
          securedLMSID: orderItem.meta.newlmsid,
          unsecuredLMSID: (hasUnsecureComponent(orderItem) && orderItem.meta.newunsecurelmsid)
            ? orderItem.meta.newunsecurelmsid : null,
          securedLoanAmount: orderItem.meta.newsecureamount,
          unsecuredLoanAmount: (hasUnsecureComponent(orderItem) && orderItem.meta.newunsecurelmsid)
            ? orderItem.meta.newunsecureamount : null,
          newGlBookingDate: formatDate(orderItem.meta.renewalMISData.newLoanSanctionDate),
          oldGLClosedDate: formatDate(orderItem.meta.renewalMISData.oldLoanClosureDate),
        })));

      await SupportService.updateSignStatus(job.variables.orderid, {
        renewal_by_lender_completed: renewalByLenderCompleted,
      });
      return job.complete();
    } catch (err) {
      logger.error('Error in the update GL details worker:', err);
      return job.error('renewal_automation_error', err.message);
    }
  });
