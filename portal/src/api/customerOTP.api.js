import axios from 'axios';
import constants from '@/constant';

const getCustomerOTP = async (data) => {
  const response = await axios.post(`${constants.apiEndpoints.loginAAAAPI}${constants.urls.sendOtp}`, data);
  return response;
};

export { getCustomerOTP as default };
