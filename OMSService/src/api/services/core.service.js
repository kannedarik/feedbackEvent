const { pick, map } = require('lodash');
const axios = require('axios');
const httpStatus = require('http-status');
const { services } = require('../../config/vars');
const { getBasicAuthString } = require('../utils/helper');
const { logger } = require('../../config/logger');
const APIError = require('../utils/APIError');

exports.getLenders = async () => {
  const options = {
    url: `${services.core.endpoint}${services.core.getLenderInfo}`,
    method: 'GET',
  };

  const response = await axios(options);

  const list = map(response.data.lendingpartners, (lp) => pick(lp, ['id', 'name', 'slug', 'branches']));
  return list;
};

exports.getNewLoans = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.getNewLoans}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.getNewLoansVersion4 = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.getNewLoansV4}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.getNewLoansVersion5 = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.getNewLoansV5}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };
  const response = await axios(options);
  return response.data;
};

exports.renewLoans = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.renewLoans}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.renewLoansVersion4 = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.renewLoansV4}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.generatePhysicalPC = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.generatePhysicalPC}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.generateSignedDigiPC = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.generateSignedDigiPC}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.generateUnSignedEPC = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.generateUnSignedEPC}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.generateSummaryPC = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.generateSummaryPC}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.viewUnSignedPC = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.viewUnSignedPC}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.updateRenewalStatus = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.updateRenewalStatus}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.getSignedPC = async (token, refno) => {
  const options = {
    url: `${services.core.endpoint}${services.core.getSignedPC}`,
    method: 'GET',
    params: {
      refno,
    },
    headers: {
      Authorization: `JWT ${token}`,
    },
  };

  const response = await axios(options);
  return response.data;
};

exports.loanEnhancementOptions = async (token, data) => {
  const options = {
    url: `${services.core.endpoint}${services.core.loanEnhancementOptions}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const response = await axios(options);
  return response.data;
};

exports.restoreLoans = async (token, payload) => {
  const options = {
    url: `${services.core.endpoint}${services.core.restoreLoans}`,
    method: 'PATCH',
    data: payload,
    headers: {
      Authorization: `JWT ${token}`,
    },
  };
  const { data: response } = await axios(options);
  return response;
};

exports.loanrequests = async (payload) => {
  const options = {
    url: `${services.core.bypassKongEndpoint}${services.core.loanrequests}`,
    method: 'GET',
    params: payload,
    headers: {
      Authorization: getBasicAuthString(services.core.auth.username, services.core.auth.password),
    },
  };
  const { data: response } = await axios(options);
  return response;
};

exports.cleanHistory = async (token, payload) => {
  const options = {
    url: `${services.core.endpoint}${services.core.cleanHistory}`,
    method: 'PATCH',
    data: payload,
    headers: {
      Authorization: `JWT ${token}`,
    },
  };
  const { data: response } = await axios(options);
  return response;
};

exports.sendLenderNotification = async (token, coreIDs) => {
  const options = {
    url: `${services.core.endpoint}${services.core.sendLenderNotification}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data: {
      loanids: coreIDs,
    },
  };

  const response = await axios(options);
  return response.data;
};

exports.getCustomerProfile = async (token, customerid) => {
  const options = {
    url: `${services.core.endpoint}${services.core.getcustomerprofile}/?userid=${customerid}`,
    method: 'GET',
    headers: {
      Authorization: `JWT ${token}`,
    },
  };

  const response = await axios(options);
  return response.data;
};

exports.supportMapLoansVersion5 = async (userid, token, loangateway = null, allloans = null, loannotvisible = null) => {
  try {
    const options = {
      method: 'GET',
      url: `${services.core.endpoint}${services.core.supportmaploansV5}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: userid,
        loangateway,
        allloans,
        loannotvisible,
      },
    };
    logger.info('calling supportmaploansV5 with options', options);
    const response = await axios(options);
    logger.info('supportmaploansV5 response', response.data.mappedloans);
    return response.data.mappedloans;
  } catch (e) {
    logger.info('error occurred while calling supportmaploansversion5 api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};
