import axios from 'axios';
import constants from '../constants';

const listProcessor = async (page = 1, limit = 10) => {
  const response = await axios.get(constants.urls.processors, {
    params: {
      page,
      limit,
    },
  });
  return response;
};

const createProcessor = async (data) => {
  const response = await axios.post(constants.urls.processors, data);
  return response;
};

const executeProcessor = async (id) => {
  const response = await axios.put(`${constants.urls.processors}/${id}/execute`);
  return response;
};

const downloadLog = async (id) => {
  const response = await axios.get(`${constants.urls.processors}/${id}/logs`);
  return response;
};

export {
  listProcessor,
  createProcessor,
  executeProcessor,
  downloadLog,
};
