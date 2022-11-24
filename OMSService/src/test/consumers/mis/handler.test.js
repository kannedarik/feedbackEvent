jest.mock('zeebe-node');
jest.mock('../../../api/services/zeebe.service');

const _ = require('lodash');
const moment = require('moment');
const MISConsumer = require('../../../consumers/mis/handler');
const ZeebeService = require('../../../api/services/zeebe.service');

const OrderItem = require('../../../api/models/orderitem.model');
const MISRecordFactory = require('../../factories/misrecord.factory');
const RenewalOrderFactory = require('../../factories/renewalorder.factory');
const OrderItemFactory = require('../../factories/orderitem.factory');
const ConfigWrapper = require('../../../config/wrapper');

describe('MIS consumer', () => {
  describe('handleMessage', () => {
    beforeEach(() => {
      jest.spyOn(ConfigWrapper, 'lookupBoolean').mockReturnValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('validates a closed loan MIS record', () => {
      const lmsid = 'loan-id';

      describe('when the opened loan record has not yet been processed', () => {
        const setupOrderItemAndMISRecord = async (oldLoanClosureDate) => MISRecordFactory.build({
          data: {
            loanid: lmsid,
            isnewclosedloan: true,
            closuredate: oldLoanClosureDate,
          },
        });

        describe('when the old loan closure date is on or after the order item creation date', () => {
          it('marks order item as isClosedMISValid and adds the old loan closure date', async () => {
            const orderItemCreationDate = '1-01-2021';
            const oldLoanClosureDate = '04-JAN-2021';
            const order = RenewalOrderFactory.build({
              paymentstatus: 'success',
              signingstatus: 'success',
            });
            const misRecord = await setupOrderItemAndMISRecord(oldLoanClosureDate);
            const orderItem = OrderItemFactory.build({
              order,
              meta: {
                lmsid: 'loan-id',
              },
              createdAt: moment(orderItemCreationDate, 'DD-MM-YYYY').toDate(),
            });
            const meta = {
              lmsid: 'loan-id',
              renewalMISData: {
                isClosedMISValid: true,
                oldLoanClosureDate: (moment(misRecord.data.closuredate, 'DD-MMM-YYYY').utcOffset('+05:30', true)).format('DD-MM-YYYY'),
              },
              createdAt: moment(orderItemCreationDate, 'DD-MM-YYYY').toDate(),
            };
            const updatedOrderItem = OrderItemFactory.build({ orderItem, ...meta });

            jest.spyOn(OrderItem, 'findOne').mockResolvedValue(orderItem);
            jest.spyOn(OrderItem, 'find')
              .mockReturnValueOnce({
                populate: jest.fn().mockReturnValue([orderItem]),
                orderItem,
              }).mockReturnValueOnce([orderItem]);
            jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(updatedOrderItem);

            await MISConsumer.handleMessage({
              Body: JSON.stringify({
                Message: JSON.stringify(_.update(misRecord, 'data', JSON.stringify)),
              }),
            });
          });
        });

        describe('when the old loan closure date is before the order item creation date', () => {
          it('throws an error', async () => {
            const orderItemCreationDate = '1-01-2021';
            const oldLoanClosureDate = '01-JAN-2020';
            const order = RenewalOrderFactory.build({
              paymentstatus: 'success',
              signingstatus: 'success',
            });

            const misRecord = await setupOrderItemAndMISRecord(oldLoanClosureDate);

            const orderItem = OrderItemFactory.build({
              order,
              meta: {
                lmsid,
              },
              createdAt: moment(orderItemCreationDate, 'DD-MM-YYYY').toDate(),
            });
            const meta = {
              lmsid: 'loan-id',
              renewalMISData: {
                isClosedMISValid: true,
                oldLoanClosureDate: moment(misRecord.data.closuredate, 'DD-MMM-YYYY').utcOffset('+05:30', true).format('DD-MM-YYYY'),
              },
            };
            const updatedOrderItem = OrderItemFactory.build({ orderItem, ...meta });

            jest.spyOn(OrderItem, 'findOne').mockResolvedValue(orderItem);
            jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
            jest.spyOn(OrderItem, 'find')
              .mockReturnValueOnce({
                populate: jest.fn().mockReturnValue([orderItem]),
                orderItem,
              }).mockReturnValueOnce([orderItem]);
            jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(updatedOrderItem);

            await MISConsumer.handleMessage({
              Body: JSON.stringify({
                Message: JSON.stringify(_.update(misRecord, 'data', JSON.stringify)),
              }),
            });

            expect(ZeebeService.publishMessage)
              .toHaveBeenCalledWith(orderItem.orderId, 'automated_mis_validation_failed');
          });
        });
      });

      describe('when the opened loan record has been processed', () => {
        const setupOrderItemAndMISRecord = async (newLoanSanctionDate,
          orderItemCreationDate,
          oldLoanClosureDate) => {
          const order = RenewalOrderFactory.build({
            paymentstatus: 'success',
            signingstatus: 'success',
          });

          const orderItem = OrderItemFactory.build({
            order,
            meta: {
              lmsid,
              renewalMISData: {
                isOpenedMISValid: true,
                newLoanSanctionDate: moment(newLoanSanctionDate, 'DD-MM-YYYY').toDate(),
              },
            },
            createdAt: moment(orderItemCreationDate, 'DD-MM-YYYY').toDate(),
          });

          const misRecord = MISRecordFactory.build({
            loanid: lmsid,
            data: {
              isnewclosedloan: true,
              closuredate: oldLoanClosureDate,
            },
          });
          return { orderItem, misRecord };
        };

        describe('when the sanction date of the new loan matches the closure date of the old loan', () => {
          it('marks the order item as isClosedMISValid and adds the old loan closure date', async () => {
            const newLoanSanctionDate = '4-01-2021';
            const orderItemCreationDate = '1-01-2021';
            const oldLoanClosureDate = '04-JAN-2021';

            const { orderItem, misRecord } = await setupOrderItemAndMISRecord(newLoanSanctionDate,
              orderItemCreationDate,
              oldLoanClosureDate);
            const meta = {
              loanid: 'loan-id',
              renewalMISData: {
                isClosedMISValid: true,
                oldLoanClosureDate: moment(misRecord.data.closuredate, 'DD-MMM-YYYY').utcOffset('+05:30', true).format('DD-MM-YYYY'),
              },
            };
            const updatedOrderItem = OrderItemFactory.build({ orderItem, meta });

            jest.spyOn(OrderItem, 'findOne').mockResolvedValue(orderItem);
            jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
            jest.spyOn(OrderItem, 'find')
              .mockReturnValueOnce({
                populate: jest.fn().mockReturnValue([orderItem]),
                orderItem,
              }).mockReturnValueOnce([orderItem]);
            jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(updatedOrderItem);

            await MISConsumer.handleMessage({
              Body: JSON.stringify({
                Message: JSON.stringify(_.update(misRecord, 'data', JSON.stringify)),
              }),
            });
          });
        });

        describe('when the sanction date of the new loan does not match the closure date of the old loan', () => {
          it('throws an error', async () => {
            const newLoanSanctionDate = '5-01-2021';
            const orderItemCreationDate = '1-01-2021';
            const oldLoanClosureDate = '04-JAN-2021';

            const { orderItem, misRecord } = await setupOrderItemAndMISRecord(newLoanSanctionDate,
              orderItemCreationDate,
              oldLoanClosureDate);

            const meta = {
              loanid: 'loan-id',
              renewalMISData: {
                isClosedMISValid: true,
                oldLoanClosureDate: moment(misRecord.data.closuredate, 'DD-MMM-YYYY').utcOffset('+05:30', true).format('DD-MM-YYYY'),
              },
            };
            const updatedOrderItem = OrderItemFactory.build({ orderItem, meta });

            jest.spyOn(OrderItem, 'findOne').mockResolvedValue(orderItem);
            jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
            jest.spyOn(OrderItem, 'find')
              .mockReturnValueOnce({
                populate: jest.fn().mockReturnValue([orderItem]),
                orderItem,
              }).mockReturnValueOnce([orderItem]);
            jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(updatedOrderItem);

            await MISConsumer.handleMessage({
              Body: JSON.stringify({
                Message: JSON.stringify(_.update(misRecord, 'data', JSON.stringify)),
              }),
            });
            expect(ZeebeService.publishMessage)
              .toHaveBeenCalledWith(orderItem.orderId, 'automated_mis_validation_failed');
          });
        });
      });
    });
  });
});
