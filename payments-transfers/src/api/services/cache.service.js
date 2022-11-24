const redis = require('redis');
const _ = require('lodash');

const { redisconf } = require('../../config/vars');
const { logger } = require('../../config/logger');
const VanAccountService = require('../../api/services/vanaccount.service');

const client = redis.createClient({ host: redisconf.url, port: redisconf.port });

client.on('connect', async () => {
  logger.info('Redis client connected');
});

client.on('error', (err) => {
  logger.error('Something went wrong while connecting to redis:', err);
});

exports.intitialize = () => {
  synchWithDb().then(result => {
    let logmsg = { "values": result };
    logger.info('Initialised cache', logmsg);
  })
    .catch(err => {
      logger.error('Some error occurred while synching cache with db:', err);
    });
}

const synchWithDb = async () => {
  try {
    let vanaccounts = await VanAccountService.getAllVanAccounts();
    let response = [];
    await Promise.all(
      Promise.each(vanaccounts, async (vanaccount) => {
        let key = await this.getKey(vanaccount.accountno);
        if (_.isEmpty(key)) {
          this.setKey(vanaccount.accountno, vanaccount.accountid);
          response.push({ accountno: vanaccount.accountno, accountid: vanaccount.accountid });
        }
      })
    );
    return response;
  }
  catch (error) {
    throw error;
  }
};

const redisCacheGet = async (key) => new Promise((resolve, reject) => {
  client.get(key, (err, value) => {
    if (err) { return reject(err); }
    return resolve(value);
  });
});

const redisCacheKeys = (key) => new Promise((resolve, reject) => {
  const searchkey = key || 'rule*';
  client.keys(searchkey, (err, keys) => {
    if (err) { return reject(err); }
    return resolve(keys);
  });
});

exports.getKey = async (key) => {
  try {
    const keyValue = await redisCacheGet(key);
    return keyValue;
  } catch (err) {
    logger.error('Error while getting key:', err);
    return {};
  }
};

exports.setKey = async (key, val) => {
  try {
    client.set(key, val);
  } catch (err) {
    logger.error('Error while set key:', err);
    throw err;
  }
};

exports.deleteKey = async (key) => {
  try {
    client.del(key);
  } catch (err) {
    logger.error('Error while deleting key:', err);
    throw err;
  }
}

exports.getKeyWithPrefix = async (prefix) => {
  try {
    const keyList = await redisCacheKeys(prefix);
    return keyList;
  } catch (err) {
    logger.error('Error while getting key with prefix:', err);
    return [];
  }
};
