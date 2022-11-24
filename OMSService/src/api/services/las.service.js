const axios = require('axios');
const { services } = require('../../config/vars');

exports.create = async (token, leadId, data) => {
  const options = {
    url: `${services.las.endpoint}${services.las.create}${leadId}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };
  const { data: response } = await axios(options);
  return response;
};
