const { v4: uuidv4 } = require('uuid');
const Promise = require('bluebird');
const _ = require('lodash');
const NotificationService = require('../../../services/notification.service');
const CoreCache = require('../../../utils/cache/core');
const NotificationCache = require('../../../utils/cache/notification');
const ErrorHandler = require('../../../utils/error');
const OrderItem = require('../../../models/orderitem.model');
const { notification } = require('../../../utils/constants.js');
const smsUtils = require('../../../utils/notification/sms');

module.exports = () => ({
  taskType: 'renewal.notification.sms',
  taskHandler: async (job) => {
    try {
      const [category, provider, type, template, csphone] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
        NotificationCache.getTemplates(job.customHeaders.template),
        CoreCache.getCities(job.variables.cityid || job.variables.customer.city.id, 'object', false, 'id', 'csphone'),
      ]);

      await Promise.map(job.variables.shortlinks, (link) => {
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
              name: job.variables.customer.name,
              url: link,
              supportnumber: csphone,
            },
          },
          correlationid: uuidv4(),
        };

        return NotificationService.sendSMS(data);
      });

      if (job.variables.signingstatus === 'success') {
        const orderItems = await OrderItem.find({
          orderId: job.variables.orderid,
        });
        const smsprovider = await NotificationCache.getProviders(notification.provider.sms.kaleyra);
        Promise.each(orderItems, async (orderItem) => {
          const smsData = {
            customer: {
              id: job.variables.customer.id,
              phone: job.variables.phone,
            },
            category,
            provider: smsprovider,
            type,
            correlationid: uuidv4(),
          };
          const loanAmountDeclarationSMSData = {
            ...smsData,
            template: await smsUtils.loanAmountDeclarationSMSTemplate(orderItem),
          };
          if (!_.isEmpty(loanAmountDeclarationSMSData.template)) {
            await NotificationService.sendSMS(loanAmountDeclarationSMSData);
          }
          const loanInterestDeclarationSMSData = {
            ...smsData,
            template: await smsUtils.loanInterestDeclarationSMSTemplate(orderItem),
          };
          if (!_.isEmpty(loanInterestDeclarationSMSData.template)) {
            await NotificationService.sendSMS(loanInterestDeclarationSMSData);
          }
        });
      }
      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
