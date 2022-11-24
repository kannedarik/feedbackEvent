const { Consumer } = require('sqs-consumer');
const { compact, uniq, map } = require('lodash');
const lendingmdsService = require('../api/services/lendingmds.service');
const coreservice = require('../api/services/core.service');
const { logger } = require('../config/logger');
const { sqs } = require('../config/vars');

const {
  Customer,
  CustomerPhone,
  LenderCustomerPhone,
} = require('../api/models/sequelize');

let lendermap = [];

const app = Consumer.create({
  queueUrl: sqs.mis,
  handleMessage: async (message) => {
    const body = JSON.parse(message.Body);
    const msg = JSON.parse(body.Message);
    // eslint-disable-next-line max-len
    const rawphonenumber = msg.unverifiedData.phonenumber || msg.unverifiedData.additionalnumber || msg.unverifiedData.landlinenumber;
    const phone = validatephonenumber(rawphonenumber);
    if (phone) {
      const lploanid = msg.unverifiedData.loanaccountnumber;

      const [lendermapdata, customerdata] = await Promise.all([
        getlendermap(),
        coreservice.getuserfromlmsid(lploanid),
      ]);
      // eslint-disable-next-line max-len
      const [lenderid] = uniq(compact(map(lendermapdata, item => (item.slug.includes(msg.unverifiedData.lenderid) ? item.id : false))));
      // eslint-disable-next-line max-len
      if (customerdata.id && lenderid) await upsertlenderphonedata(customerdata.id, lenderid, phone);
    }
  },
});

app.on('error', (err) => {
  logger.error(err);
});

app.on('processing_error', (err) => {
  logger.error(err);
});

app.on('timeout_error', (err) => {
  logger.error(err);
});

app.start();

const getlendermap = async () => {
  if (!lendermap.length) {
    lendermap = await lendingmdsService.fetchLenderInfo();
  }

  return lendermap;
};

const upsertlenderphonedata = async (customerid, lenderid, phone) => {
  const [customer] = await Customer.findOrCreate({
    where: { mongoid: customerid },
    defaults: {
      mongoid: customerid,
    },
  });

  const [customerphone] = await CustomerPhone.findOrCreate({
    where: { customer: customer.id, phone },
    defaults: {
      customer: customer.id, phone, verified: false, primary: true, archived: false,
    },
  });

  await LenderCustomerPhone.findOrCreate({
    where: { phone: customerphone.id, lender: lenderid },
    defaults: {
      phone: customerphone.id, lender: lenderid, verified: false, primary: true, archived: false,
    },
  });

  return true;
};

const validatephonenumber = (number) => {
  if (!number) return false;
  // eslint-disable-next-line no-useless-escape
  const trimmedstr = number.toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '');
  if (trimmedstr.length < 10 || trimmedstr.length > 12 || trimmedstr.length === 11) return false;
  if (trimmedstr.length === 12) return trimmedstr.substring(2);

  return trimmedstr;
};
