const _ = require('lodash');
const RedisClient = require('../../../config/redis');
const LendingMDSService = require('../../services/lendingMDS.service');
const MasterDataService = require('../../services/masterdata.service');
const { redis } = require('../../../config/vars');

const getLenders = async (query, type = 'object', invalidate = false, key = 'slug', value = 'id') => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.core.lenders);
  }

  const cachedData = await RedisClient.getAsync(redis.key.core.lenders);
  let lenders = JSON.parse(cachedData);

  if (!lenders) {
    lenders = await LendingMDSService.getLenders();
    await RedisClient.setAsync(redis.key.core.lenders, JSON.stringify(lenders), 'EX', redis.expiry.core);
  }

  if (type === 'array') {
    const response = query ? _.filter(lenders, query) : lenders;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(lenders).keyBy(key).mapValues(value).value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`Lender not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

const getCities = async (query, type = 'object', invalidate = false, key = 'name', value = 'id') => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.core.cities);
  }

  const cachedData = await RedisClient.getAsync(redis.key.core.cities);
  let cities = JSON.parse(cachedData);

  if (!cities) {
    cities = await MasterDataService.getCities();
    await RedisClient.setAsync(redis.key.core.cities, JSON.stringify(cities), 'EX', redis.expiry.core);
  }

  if (type === 'array') {
    const response = query ? _.filter(cities, query) : cities;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(cities).keyBy(key).mapValues(value).value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`City not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

exports.copyCoreData = async (invalidate = false) => {
  await Promise.all([
    getLenders(null, 'object', invalidate),
    getCities(null, 'object', invalidate),
  ]);
};

exports.getLenders = getLenders;
exports.getCities = getCities;
