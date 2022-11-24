const _ = require('lodash');
const RedisClient = require('../../../config/redis');
const DocSignService = require('../../services/docsign.service');
const { redis } = require('../../../config/vars');

const getDigitSignProviders = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.docsign.digiSignProviders);
  }

  const cachedData = await RedisClient.getAsync(redis.key.docsign.digiSignProviders);
  let providers = JSON.parse(cachedData);

  if (!providers) {
    providers = await DocSignService.listDigiSignProviders();
    await RedisClient.setAsync(redis.key.docsign.digiSignProviders, JSON.stringify(providers), 'EX', redis.expiry.docsign);
  }

  if (type === 'array') {
    const response = query ? _.filter(providers, query) : providers;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(providers).keyBy('name').mapValues('id').value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`DigiSignProvider not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

const getESignProviders = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.docsign.eSignProviders);
  }

  const cachedData = await RedisClient.getAsync(redis.key.docsign.eSignProviders);
  let providers = JSON.parse(cachedData);

  if (!providers) {
    providers = await DocSignService.listESignProviders();
    await RedisClient.setAsync(redis.key.docsign.eSignProviders, JSON.stringify(providers), 'EX', redis.expiry.docsign);
  }

  if (type === 'array') {
    const response = query ? _.filter(providers, query) : providers;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(providers).keyBy('name').mapValues('id').value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`ESignProvider not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

const getTypes = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.docsign.types);
  }

  const cachedData = await RedisClient.getAsync(redis.key.docsign.types);
  let types = JSON.parse(cachedData);

  if (!types) {
    types = await DocSignService.listTypes();
    await RedisClient.setAsync(redis.key.docsign.types, JSON.stringify(types), 'EX', redis.expiry.docsign);
  }

  if (type === 'array') {
    const response = query ? _.filter(types, query) : types;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(types).keyBy('name').mapValues('id').value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`SignType not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

exports.copyDocSignData = async (invalidate = false) => {
  await Promise.all([
    getDigitSignProviders(null, 'object', invalidate),
    getESignProviders(null, 'object', invalidate),
    getTypes(null, 'object', invalidate),
  ]);
};

exports.getDigitSignProviders = getDigitSignProviders;
exports.getESignProviders = getESignProviders;
exports.getTypes = getTypes;
