const axios = require('axios');
const configVars = require('../../config/vars');

exports.renewRCPLLoan = async (params) => {
  const options = {
    url: `${configVars.services.orion.baseURI}${configVars.services.orion.renewRCPLLoanPath}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    json: true,
    data: params,
    auth: {
      username: configVars.services.orion.clientID,
      password: configVars.services.orion.password,
    },
  };
  const response = await axios(options);
  return response.data;
};

exports.closeRCPLLoan = async (params) => {
  const options = {
    url: `${configVars.services.orion.baseURI}${configVars.services.orion.closeRCPLLoanPath}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    data: params,
    auth: {
      username: configVars.services.orion.clientID,
      password: configVars.services.orion.password,
    },
  };
  const response = await axios(options);
  return response.data;
};
