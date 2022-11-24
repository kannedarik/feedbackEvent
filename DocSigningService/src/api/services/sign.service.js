const LeegalityService = require('./leegality.service');
const PushService = require('./push.service');
const SMSService = require('./sms.service');

module.exports = {
  leegality: LeegalityService,
  'notification/push': PushService,
  'notification/sms': SMSService,
};
