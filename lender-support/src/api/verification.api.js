import axios from 'axios';
import constants from '../constants';

const getInvalidDataAPI = async () => {
  const response = await axios.get(`${process.env.VUE_APP_KONG_URL}/${process.env.VUE_APP_PAY_HOST}${constants.urls.getInvalidData}`);
  return response;
};

const updateKeysAPI = async (data) => {
  const response = await axios.post(`${process.env.VUE_APP_KONG_URL}/${process.env.VUE_APP_PAY_HOST}${constants.urls.updateKeys}`, data);
  return response;
};

const getMisFilesAPI = async (data) => {
  const response = await axios.post(`${process.env.VUE_APP_KONG_URL}/${process.env.VUE_APP_PAY_HOST}${constants.urls.getMisFile}`, data);
  return response;
};

export {
  getInvalidDataAPI, updateKeysAPI, getMisFilesAPI,
};
