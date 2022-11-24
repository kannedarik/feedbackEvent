const axios = require('axios');
const { services } = require('../../config/vars');

exports.confirmSlot = async (token, slotId, data) => {
  const options = {
    url: `${services.insight.endpoint}${services.insight.confirmSlot.replace(':id', slotId)}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };
  const { data: response } = await axios(options);
  return response;
};
