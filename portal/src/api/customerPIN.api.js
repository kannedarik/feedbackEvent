import axios from 'axios';
import constants from '@/constant';

const aaaAPIEndPoint = constants.apiEndpoints.loginAAAAPI;

const setPin = async (data) => {
  const response = await axios.put(`${aaaAPIEndPoint}${constants.urls.setPin}`, data);
  return response;
};

const loginWithPin = async (data) => {
  const response = await axios.post(`${aaaAPIEndPoint}${constants.urls.loginWithPin}`, data);
  return response;
};

const recoverPin = async (body) => {
  const { data, params } = body;
  const response = await axios.post(`${aaaAPIEndPoint}${constants.urls.recoverPin}`, data, { params });
  return response;
};

export {
  setPin,
  loginWithPin,
  recoverPin,
};
