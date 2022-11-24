const { map, isEmpty } = require('lodash');
const axios = require('axios');
const httpStatus = require('http-status');
const { urls, lendingMDS } = require('../../config/vars');
const { logger } = require('../../config/logger');
const APIError = require('../utils/APIError');

const getLendersInfo = async (params) => {
  const options = {
    method: 'GET',
    url: `${urls.lendingmds.endpoint}${urls.lendingmds.lenderinfo}`,
    headers: {
      Authorization: lendingMDS.basic_auth,
    },
    params: {
      pageNumber: params.pageNumber,
    },
  };
  logger.info('calling getLenderbranch info api with options:', options);
  const response = await axios(options);
  logger.info('Lenderbranch info api response', response.data);
  return response.data;
};

exports.getLenderBranchesInfo = async () => {
  let branches = [];
  let pageNo = 0;
  let notLastPage = true;
  try {
    while (notLastPage) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getLendersInfo({ pageNumber: pageNo });
      pageNo += 1;
      if (isEmpty(response) || isEmpty(response.data) || (pageNo >= response.totalPages)) {
        notLastPage = false;
      }
      if (!isEmpty(response) && !isEmpty(response.data)) branches = [...branches, ...response.data];
    }
  } catch (e) {
    logger.error('some error occured while fetching lenderbranches info', e);
  }
  const branchVsLenderMapping = {};
  map(branches, (branch) => {
    branchVsLenderMapping[branch.coreId] = branch.lendingPartner.coreId;
  });
  return branchVsLenderMapping;
};

exports.getLenders = async () => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.lendingmds.endpoint}${urls.lendingmds.lendingpartners}`,
      headers: {
        Authorization: lendingMDS.basic_auth,
      },
    };
    logger.info('calling getLenders api with options:', options);
    const response = await axios(options);
    logger.info('getLenders info api response', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling lendingpartners api', e);
    /* eslint-disable max-len */
    throw new APIError({
      status: (e.response && e.response.data ? e.response.data.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response && e.response.data ? e.response.data.error : httpStatus.INTERNAL_SERVER_ERROR),
    });
    /* eslint-enable max-len */
  }
};
