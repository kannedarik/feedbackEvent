const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

exports.create = async ({
  endpoint, key, password, customerid, customername = 'Customer', customerphone, custom, otp,
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
        phone: customerphone,
      },
      category: custom.category,
      type: custom.type,
      provider: custom.provider,
      template: {
        id: custom.template,
        data: {
          name: customername,
          otp,
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
