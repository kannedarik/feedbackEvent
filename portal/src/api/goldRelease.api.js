import axios from 'axios';
import constants from '../constant';

const fetchOrdersDetailsAPI = async (data) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.releaseOrderAPI}`, {
    params: data,
  });
  return response;
};
const getStaticMessageAPI = async (data) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.staticMessageAPI}?${data}`);
  return response;
};

export { fetchOrdersDetailsAPI, getStaticMessageAPI };
