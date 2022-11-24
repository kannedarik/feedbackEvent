import axios from 'axios';
import constants from '@/constant';

const login = async (data) => {
  const response = await axios.post(`${constants.apiEndpoints.loginAAAAPI}${constants.urls.otpLogin}`, data);
  axios.defaults.headers.common.Authorization = `JWT ${response.data.token}`;
  return response;
};

const logout = async () => {
  const response = await axios.post(`${constants.apiEndpoints.loginAAAAPI}${constants.urls.logout}`);
  return response;
};

export { login, logout };
