const axios = require('axios');
const { urls, secretid, secretkey } = require('../../config/vars');

exports.getuserfromlmsid = async (lploanid) => {
  const options = {
    url: `${urls.core.endpoint}${urls.core.userfromlploanid}`,
    method: 'GET',
    auth: {
      username: secretid,
      password: secretkey,
    },
    params: {
      lploanid,
    },
    json: true,
  };

  const response = await axios(options);
  return response.data.user;
};
