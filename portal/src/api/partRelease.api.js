import axios from 'axios';
import constants from '../constant';

const releasePodAPIs = constants.apiEndpoints.losHostAPI;

const getPartReleaseFeatureFlagAPI = async () => {
  const response = await axios.get(`${releasePodAPIs}${constants.urls.partReleaseFeatureFlagAPI}`);
  return response;
};

const getJewelsListAPI = async (data) => {
  const response = await axios.get(`${releasePodAPIs}${constants.urls.getJewelsListAPI}`, {
    params: data,
  });
  return response;
};
const partReleaseValidateAPI = async (data) => {
  const response = await axios.post(`${releasePodAPIs}${constants.urls.partReleaseValidateAPI}`,
    data);
  return response;
};

const createPartReleaseOrderAPI = async (data) => {
  const response = await axios.post(`${releasePodAPIs}${constants.urls.releaseOrderAPI}`,
    data);
  return response;
};

const fetchPartReleaseOrdersAPI = async (data) => {
  const response = await axios.get(`${releasePodAPIs}${constants.urls.releaseOrderAPI}`, {
    params: data,
  });
  return response;
};

const getStaticMessageAPI = async (data) => {
  const response = await axios.get(
    `${releasePodAPIs}${constants.urls.staticMessageAPI}?identifier=${data}`,
  );
  return response;
};

export {
  getPartReleaseFeatureFlagAPI,
  getJewelsListAPI,
  partReleaseValidateAPI,
  fetchPartReleaseOrdersAPI,
  createPartReleaseOrderAPI,
  getStaticMessageAPI,
};
