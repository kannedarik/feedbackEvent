const axios = require('axios');
const { services } = require('../../config/vars');

exports.getMISCustomerDetails = async (lmsid) => {
  const options = {
    url: `${services.mis.endpoint}${services.mis.getCustomerDetails}`,
    method: 'GET',
    auth: {
      username: services.mis.credentials.clientID,
      password: services.mis.credentials.token,
    },
    params: {
      loanid: lmsid,
    },
  };

  const response = await axios(options);
  return response.data.data;
};
