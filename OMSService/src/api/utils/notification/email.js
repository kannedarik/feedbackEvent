const { services } = require('../../../config/vars');
const OrderItem = require('../../models/orderitem.model');

exports.UpdateRenewalAutomationEmailDetails = async (searchQuery, emailDetails = {}) => {
  const automatedEmailDetails = {
    ...(!emailDetails.decreaseRetryCount && {
      notification: {
        id: (emailDetails.id) ? emailDetails.id : null,
        status: (emailDetails.status) ? emailDetails.status
          : services.notification.status.pending,
      },
      retryleft: emailDetails.retryleft,
    }),
  };
  await OrderItem.updateMany(searchQuery, {
    ...(!emailDetails.decreaseRetryCount && {
      $set: {
        'meta.automatedEmailDetails': automatedEmailDetails,
      },
    }),
    ...(emailDetails.decreaseRetryCount && {
      $inc: {
        'meta.automatedEmailDetails.retryleft': -1,
      },
    }),
  });
};
