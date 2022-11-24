const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { services } = require('../../config/vars');

exports.validateAadhar = async (userid, data) => {
  try {
    const options = {
      url: `${services.kyc.endpoint}${services.kyc.customer}/${userid}${services.kyc.validateAadharLast4Digits}`,
      method: 'POST',
      headers: {
        'X-Client-Id': services.kyc.xClientId,
      },
      data,
    };
    const { data: response } = await axios(options);
    return response;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};
