const axios = require('axios');
const { services } = require('../../config/vars');

exports.updateSignStatus = async (id, data) => {
  const options = {
    url: `${services.support.endpoint}${services.support.ticket}/${id}/updatesign`,
    method: 'PUT',
    auth: {
      username: services.support.credentials.client,
      password: services.support.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.updateLoanEnhancementStatus = async (id, data) => {
  const options = {
    url: `${services.support.endpoint}${services.support.ticket}/${id}/updateLESign`,
    method: 'PUT',
    auth: {
      username: services.support.credentials.client,
      password: services.support.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.createGeneralLedger = async (orderID, generalLedgerData) => {
  const options = {
    url: `${services.support.endpoint}${services.support.ticket}/${orderID}/generalLedger`,
    method: 'POST',
    auth: {
      username: services.support.credentials.client,
      password: services.support.credentials.token,
    },
    data: {
      generalLedgerList: generalLedgerData.map((ledgerItem) => ({
        secured_gl_number: ledgerItem.securedLMSID,
        unsecured_gl_number: ledgerItem.unsecuredLMSID,
        old_gl: false,
        secured_loan_amount: ledgerItem.securedLoanAmount,
        unsecured_loan_amount: ledgerItem.unsecuredLoanAmount,
        new_gl_booking_date: ledgerItem.newGlBookingDate,
        old_gl_closed_date: ledgerItem.oldGLClosedDate,
      })),
    },
  };

  const response = await axios(options);
  return response.data;
};

exports.notifyOnSlotConfirmation = async (data) => {
  const options = {
    url: `${services.support.endpoint}${services.support.notifyOnSlotConfirmation}`,
    method: 'POST',
    auth: {
      username: services.support.credentials.client,
      password: services.support.credentials.token,
    },
    data,
  };

  const { data: response } = await axios(options);
  return response;
};
