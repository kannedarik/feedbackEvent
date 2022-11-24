const _ = require('lodash');
const lendingMDSService = require('./../services/lendingmds');
const redisUtils = require('./redis.util');
const { redisKeys } = require('./constants');

const getLenderIdToSlugMap = async (lenderId) => {
  let lenderIdToSlugMap = await redisUtils.getFromCache(redisKeys.lenderIdToSlugMap);
  if (!_.isEmpty(lenderIdToSlugMap)) {
    return lenderIdToSlugMap[lenderId];
  }
  const { data } = await lendingMDSService.getLenders();
  lenderIdToSlugMap = _.chain(data).keyBy('coreId').mapValues('slug').value();
  await redisUtils.setToCache(redisKeys.lenderIdToSlugMap, lenderIdToSlugMap);
  return lenderIdToSlugMap[lenderId];
};

module.exports = {
  getLenderIdToSlugMap,
};
