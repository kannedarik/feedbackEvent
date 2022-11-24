import axios from 'axios';
import constants from '../constants';

const lenders = async () => {
  const response = await axios.get(`${constants.urls.data}/lenders`);
  return response;
};

const getLenderPartners = async () => {
  const response = await axios.get(`${constants.urls.lendingPartnersAPI}`);
  return response;
};

export { lenders, getLenderPartners };
