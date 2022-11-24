const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');
const zeebeWorker = require('../../../../../utils/zeebeWorker');
const { services } = require('../../../../../../config/vars');
const OrderItem = require('../../../../../models/orderitem.model');
const RenewalOrder = require('../../../../../models/renewalorder.model');
const LendingMDSService = require('../../../../../services/lendingMDS.service');
const featureFlagUtils = require('../../../../../utils/cache/featureFlag');
const constants = require('../../../../../utils/constants');
const { logger } = require('../../../../../../config/logger');

const filterOrdersByHoliday = async (automatedOrderIds, branchId, lenderSlug) => {
  if (!_.isEmpty(automatedOrderIds)) {
    const date = moment().format('DD-MMM-YYYY');
    const { data: { holiday: isHolidayTrue } } = await LendingMDSService.getBranchHolidayData({
      operation: services.lendingMDS.operation,
      date,
      branchId,
    }, lenderSlug);
    if (isHolidayTrue) {
      return [];
    }
  }
  return automatedOrderIds;
};

const selectAutomatedOrderIDs = async (orderIDs, branchId) => {
  const orders = await RenewalOrder.find({ _id: orderIDs });
  const automatedOrderIds = orders.filter((order) => order.automationState === 'automated').map((order) => order._id);
  const lenderSlug = orders[0].meta.lender;
  const filteredAutoOrderIds = await filterOrdersByHoliday(automatedOrderIds, branchId, lenderSlug);
  return filteredAutoOrderIds;
};

module.exports = zeebeWorker('renewal.automation.email.v2.selectOrders',
  async (job) => {
    try {
      const enabledBranchIDsv1 = await featureFlagUtils.getAllIdentificationKeys(
        constants.featureFlag.renewalAutomation,
      );
      logger.info('enabledBranchIDsv1', enabledBranchIDsv1);
      const enabledBranchIDsv2 = await featureFlagUtils.getAllIdentificationKeys(
        constants.featureFlag.renewalAutomationv2,
      );
      logger.info('enabledBranchIDsv2', enabledBranchIDsv2);
      const results = await OrderItem.aggregate([{
        $match: {
          'meta.branchid': { $in: enabledBranchIDsv2, $nin: enabledBranchIDsv1 },
          'meta.automatedEmailToLenderProcessed': { $ne: true },
          'meta.isEligibleForSendEmail': true,
          'meta.newloandate': {
            $lt: moment().utcOffset('+05:30', true).endOf('day').toISOString(),
          },
        },
      }, {
        $group: {
          _id: '$meta.branchid',
          orderIDs: { $push: '$orderId' },
        },
      }, {
        $project: {
          _id: 0, branchID: '$_id', orderIDs: 1,
        },
      }]);
      const branchOrderIDPairs = await Promise.map(results,
        async (entry) => [entry.branchID,
          await selectAutomatedOrderIDs(_.uniq(entry.orderIDs), entry.branchID)]);
      const ordersPerBranchv2 = _.fromPairs(branchOrderIDPairs);
      job.complete({
        ordersPerBranchv2,
        branchIDsV2: Object.keys(ordersPerBranchv2),
      });
    } catch (err) {
      job.fail(err.message);
      logger.error('error in selecting orders for re-automation email', err);
    }
  });
