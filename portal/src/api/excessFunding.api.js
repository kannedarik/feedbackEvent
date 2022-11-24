import axios from 'axios';
import constants from '@/constant';

const getexcessFundingConfing = async () => {
  const response = await axios.get(`${constants.apiEndpoints.payHostAPI}${constants.urls.getExcessFundingAPI}`);
  return response;
};

export { getexcessFundingConfing as default };
