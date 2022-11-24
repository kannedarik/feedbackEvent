const _ = require('lodash');
const moment = require('moment');

const OrderItem = require('../../api/models/orderitem.model');
// eslint-disable-next-line no-unused-vars
const Order = require('../../api/models/order.model'); // Needed to define the Order schema for population
const ZeebeService = require('../../api/services/zeebe.service');
const { logger } = require('../../config/logger');
const ConfigWrapper = require('../../config/wrapper');

const selectOrderItem = async (query) => {
  const orderItems = await OrderItem
    .find(query)
    .populate({
      path: 'orderId',
      match:
      { paymentstatus: 'success', signingstatus: 'success' },
    });

  const selectedOrderItems = _.filter(orderItems, (orderItem) => !_.isEmpty(orderItem.orderId));

  if (selectedOrderItems.length > 1) {
    throw new Error('More than one order item found for given MIS record');
  }

  if (selectedOrderItems.length === 0) {
    throw new Error('No order items found for given MIS record');
  }

  // Querying again because we need the orderId field on the object intact.
  return OrderItem.findOne({ _id: selectedOrderItems[0]._id });
};

// Parse a date string, which is assumed to be in the IST timezone.
const parseDay = (dayString) => moment(dayString, 'DD-MM-YYYY').utcOffset('+05:30', true);

const parseMISDateString = (misDateString) => moment(misDateString, 'DD-MMM-YYYY').utcOffset('+05:30', true);

// Parse an instant string, which could be in any timezone.
const parseInstant = (instantString) => moment(instantString).utcOffset('+05:30');

const closureDate = (misRecord) => parseMISDateString(misRecord.closuredate);

const validateClosedMISRecord = (misRecord, orderItem) => {
  const dateOfClosure = closureDate(misRecord);
  const closureDateValid = dateOfClosure.isSameOrAfter(parseInstant(orderItem.createdAt), 'day');

  if (_.get(orderItem, 'meta.renewalMISData.isOpenedMISValid')) {
    // If this field is true, it means that the open record was processed first.
    // We must validate the sanction date of the new loan against the closure date here
    // as a result.
    return closureDateValid && parseDay(orderItem.meta.renewalMISData.newLoanSanctionDate).isSame(dateOfClosure, 'day');
  }

  return closureDateValid;
};

const validateOpenedMISRecord = (misRecord, orderItem) => {
  if (!_.get(orderItem, 'meta.renewalMISData.isClosedMISValid')) {
    // If this field is false, it means that the closed record has not been processed yet.
    // We return true, with the expectation that it will be processed later.
    return true;
  }

  const dateOfClosure = parseDay(orderItem.meta.renewalMISData.oldLoanClosureDate);
  return parseMISDateString(misRecord.sanctiondate).isSame(dateOfClosure, 'day');
};

const isValidationComplete = async (orderID) => {
  const orderItems = await OrderItem.find({ orderId: orderID });
  return orderItems.every((orderItem) => _.get(orderItem, 'meta.renewalMISData.isClosedMISValid')
    && _.get(orderItem, 'meta.renewalMISData.isOpenedMISValid'));
};

const handleMessage = async (message) => {
  logger.info('MIS queue message received', message);
  if (!ConfigWrapper.lookupBoolean('ENABLE_RENEWAL_AUTOMATION')) return;

  const notification = JSON.parse(message.Body);
  const notificationMessage = JSON.parse(notification.Message);
  const misRecord = JSON.parse(notificationMessage.data);

  logger.info('Received MIS message: ', misRecord);

  let selectedOrderItem;
  let isRecordValid;
  let updates;

  try {
    if (!misRecord.isnewclosedloan && !misRecord.isnewopenedloan) {
      // We don't need to handle this message.
      return;
    }

    if (misRecord.isnewclosedloan && misRecord.loanid) {
      logger.info(`Validating closed loan record with loan id: ${misRecord.loanid}`);
      selectedOrderItem = await selectOrderItem({ 'meta.lmsid': misRecord.loanid });
      logger.info(`Found order item with ID: ${selectedOrderItem._id} for a closed loan MIS record`);
      isRecordValid = validateClosedMISRecord(misRecord, selectedOrderItem);
      updates = {
        'meta.renewalMISData.isClosedMISValid': true,
        // We store this so that it can be validated against
        // the MIS record to open a new loan.
        'meta.renewalMISData.oldLoanClosureDate': closureDate(misRecord).format('DD-MM-YYYY'),
      };
    }

    if (misRecord.isnewopenedloan) {
      logger.info(`Validating opened loan record with loan id: ${misRecord.loanid}`);
      selectedOrderItem = await selectOrderItem({
        'meta.newsecureamount': parseFloat(misRecord.sanctionedamount),
        'meta.oldMISRecordDetails.lenderCustomerID': misRecord.custid.toString(),
      });
      logger.info(`Found order item with ID: ${selectedOrderItem._id} for an opened loan MIS record`);
      isRecordValid = validateOpenedMISRecord(misRecord, selectedOrderItem);
      updates = {
        'meta.renewalMISData.isOpenedMISValid': true,
        // This is needed for updating GL details in Salesforce.
        'meta.newlmsid': misRecord.loanid,
        // We store this so that it can be validated against the
        // MIS record to close the old loan, in case the open record
        // is processed before the close record.
        'meta.renewalMISData.newLoanSanctionDate': parseMISDateString(misRecord.sanctiondate).format('DD-MM-YYYY'),
      };
    }

    if (!isRecordValid) {
      throw new Error('Could not validate MIS record');
    }

    await OrderItem.findOneAndUpdate({ _id: selectedOrderItem._id }, updates, { new: true });

    if (await isValidationComplete(selectedOrderItem.orderId)) {
      await ZeebeService.publishMessage(selectedOrderItem.orderId, 'automated_mis_validation_completed');
    }
  } catch (error) {
    if (_.get(selectedOrderItem, 'orderId')) {
      await ZeebeService.publishMessage(selectedOrderItem.orderId, 'automated_mis_validation_failed');
    } else {
      // This means that an error occurred before/during looking up the order item.
      logger.error('Error while processing an MIS record', error);
      logger.error('MIS record:', misRecord);
    }
  }
};

module.exports = { handleMessage };
