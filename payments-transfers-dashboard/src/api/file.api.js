import axios from 'axios';
import constants from '../constants';

const create = async (data) => {
  const formData = new FormData();
  formData.append('purpose', data.purpose);
  formData.append('lender', data.lender.id);
  formData.append('process', true);
  formData.append('file', data.file);

  const response = await axios.post(constants.urls.files, formData);
  return response;
};

export { create as default };
