const Promise = require('bluebird');
const { compact, split } = require('lodash');
const RedisClient = require('../../../config/redis');
const { redis } = require('../constants');
const { logger } = require('../../../config/logger');

const scanAsync = async (pattern, cursor, foundVal) => {
  try {
    await RedisClient.scanAsync(cursor, 'MATCH', pattern, 'COUNT', parseInt(redis.countLimit, 10)).then(
      (res) => {
        const newcursor = res[0];
        foundVal.push(...res[1]);
        if (newcursor === '0') {
          return foundVal;
        }
        return scanAsync(pattern, newcursor, foundVal);
      },
    );
    return foundVal;
  } catch (error) {
    logger.error('Error in scanning the cache', error);
    return [];
  }
};

exports.getAllIdentificationKeys = async (pattern) => {
  try {
    const foundVal = [];
    const IdentificationKeys = await scanAsync(`${pattern}*`, 0, foundVal);
    const IdentificationKeyValues = await Promise.map(
      IdentificationKeys,
      async (IdentificationKey) => {
        const cachedIdentificationKeyValue = await RedisClient.getAsync(IdentificationKey);
        return JSON.parse(cachedIdentificationKeyValue);
      },
    );
    return IdentificationKeyValues;
  } catch (error) {
    logger.error('Cant retrieve all IdentificationKey', error);
    return [];
  }
};

exports.delIdentificationKeys = async (key) => {
  try {
    const deleted = await RedisClient.delAsync(key);
    if (!deleted) {
      logger.error(`${key} is not present in cache`);
      return key;
    }
    return null;
  } catch (error) {
    logger.error('Redis error while deleting ', error);
    return null;
  }
};

exports.getSingleIdentificationKey = async (featureName, featureIdentifier, ID) => {
  try {
    const key = `${featureName}:${featureIdentifier ? `${featureIdentifier}:${ID}` : ID}`;
    let cachedIdentificationKey = await RedisClient.getAsync(key);
    if (!cachedIdentificationKey) {
      logger.error('There was no IdentificationKey with the Key', key);
      return false;
    }
    cachedIdentificationKey = JSON.parse(cachedIdentificationKey);
    return cachedIdentificationKey;
  } catch (error) {
    logger.error('There was an error getting IdentificationKey by ID', error);
    return false;
  }
};

// eslint-disable-next-line max-len
exports.hasDuplicates = async (array) => {
  const uniqueElements = new Set(array);
  const filteredElements = array.filter((item) => {
    if (uniqueElements.has(item)) {
      uniqueElements.delete(item);
    } else {
      return item;
    }
    return false;
  });
  return Array.from(new Set(filteredElements));
};

exports.getIdentificationKeysByValue = async (value, pattern) => {
  try {
    const foundVal = [];
    const IdentificationKeys = await scanAsync(`${pattern}*`, 0, foundVal);
    const IdentificationKeysWithValue = await Promise.map(
      IdentificationKeys,
      async (IdentificationKey) => {
        const cachedValue = await RedisClient.getAsync(IdentificationKey);
        if (value === JSON.parse(cachedValue)) {
          return split(IdentificationKey, ':').slice(-1)[0];
        }
        return null;
      },
    );
    return compact(IdentificationKeysWithValue);
  } catch (error) {
    logger.error('Cant retrieve all IdentificationKey with specified value', error);
    return [];
  }
};
