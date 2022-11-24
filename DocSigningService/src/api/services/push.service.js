const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

exports.create = async ({
  endpoint, key, password, customerid, customerphone, custom, otp,
}) => {
  const options = {
    method: 'POST',
    url: endpoint,
    auth: {
      username: key,
      password,
    },
    data: {
      customer: {
        id: customerid,
        receiver: customerphone,
      },
      category: custom.category,
      type: custom.type,
      provider: custom.provider,
      template: {
        id: custom.template,
        data: {
          otp: otp.replace(/(\d{1})/g, '$1    ').trim(),
        },
      },
      correlationid: uuidv4(),
    },
  };

  const response = await axios(options);
  return {
    trackingid: response.data.notification,
  };
};
