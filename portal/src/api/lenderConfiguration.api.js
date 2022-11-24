import axios from 'axios';
import constants from '@/constant';

const getLenderConfiguration = async () => {
  const response = await axios.get(`${constants.apiEndpoints.payHostAPI}${constants.urls.getLenderConfiguration}`);
  return response;
};

const getLenders = async () => {
  const response = await axios.get(`${constants.apiEndpoints.payHostAPI}${constants.urls.getLendersUrl}`);
  return response;
};

const getLenderPartners = async () => {
  const response = await axios.get(`${constants.apiEndpoints.lendingHostAPI}${constants.urls.lendingPartnersAPI}`);
  return response;
};

export { getLenderConfiguration, getLenders, getLenderPartners };
