const axios = require('axios');
const { services } = require('../../config/vars');

exports.getCities = async () => {
  const options = {
    url: `${services.masterdata.endpoint}${services.masterdata.getCities}`,
    method: 'GET',
    params: {
      includeinactive: false,
    },
  };

  const { data: response } = await axios(options);
  return response.data;
};
