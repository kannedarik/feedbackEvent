const { map, isEmpty } = require('lodash');
const axios = require('axios');
const { urls, lendingMDS } = require('../../config/vars');
const { logger } = require('../../config/logger');

const getLenderInfo = async (params) => {
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
  logger.info('calling getLenderinfo api with options:', options);
  const response = await axios(options);
  logger.info('getLenderinfo api response', response.data);
  return response.data;
};

exports.fetchLenderInfo = async () => {
  let lenders = [];
  let pageNo = 0;
  let notLastPage = true;
  try {
    while (notLastPage) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getLenderInfo({ pageNumber: pageNo });
      pageNo += 1;
      if (isEmpty(response) || isEmpty(response.data) || (pageNo >= response.totalPages)) {
        notLastPage = false;
      }
      if (!isEmpty(response) && !isEmpty(response.data)) lenders = [...lenders, ...response.data];
    }
  } catch (e) {
    logger.error('some error occured while fetching lender info', e);
  }
  return map(lenders, lp => ({
    id: lp.coreId,
    name: lp.lenderName,
    slug: lp.slug,
  }));
};
