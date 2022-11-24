import axios from 'axios';
import constants from '../constants';

const login = async (data) => {
  const response = await axios.post(constants.urls.login, data);
  // set authToken
  axios.defaults.headers.common.Authorization = `JWT ${response.data.token}`;
  return response;
};

export { login as default };
