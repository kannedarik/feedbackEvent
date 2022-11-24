const _ = require('lodash');
const RedisClient = require('../../../config/redis');
const NotificationService = require('../../services/notification.service');
const { redis } = require('../../../config/vars');

const getCategories = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.notification.categories);
  }

  const cachedData = await RedisClient.getAsync(redis.key.notification.categories);
  let categories = JSON.parse(cachedData);

  if (!categories) {
    categories = await NotificationService.listCategories();
    await RedisClient.setAsync(redis.key.notification.categories, JSON.stringify(categories), 'EX', redis.expiry.notification);
  }

  if (type === 'array') {
    const response = query ? _.filter(categories, query) : categories;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(categories).keyBy('name').mapValues('id').value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`Category not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

const getProviders = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.notification.providers);
  }

  const cachedData = await RedisClient.getAsync(redis.key.notification.providers);
  let providers = JSON.parse(cachedData);

  if (!providers) {
    providers = await NotificationService.listProviders();
    await RedisClient.setAsync(redis.key.notification.providers, JSON.stringify(providers), 'EX', redis.expiry.notification);
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

  throw new Error(`Provider not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

const getTemplates = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.notification.templates);
  }

  const cachedData = await RedisClient.getAsync(redis.key.notification.templates);
  let templates = JSON.parse(cachedData);

  if (!templates) {
    templates = await NotificationService.listTemplates();
    await RedisClient.setAsync(redis.key.notification.templates, JSON.stringify(templates), 'EX', redis.expiry.notification);
  }

  if (type === 'array') {
    const response = query ? _.filter(templates, query) : templates;
    return response;
  }
  if (type === 'object') {
    const data = _.chain(templates).keyBy('name').mapValues('id').value();
    const response = query ? data[query] : data;
    if (response) {
      return response;
    }
  }

  throw new Error(`Template not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

const getTypes = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await RedisClient.delAsync(redis.key.notification.types);
  }

  const cachedData = await RedisClient.getAsync(redis.key.notification.types);
  let types = JSON.parse(cachedData);

  if (!types) {
    types = await NotificationService.listTypes();
    await RedisClient.setAsync(redis.key.notification.types, JSON.stringify(types), 'EX', redis.expiry.notification);
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

  throw new Error(`Type not found. Query: ${JSON.stringify(query)}, type: ${type}, invalidate: ${invalidate}`);
};

exports.copyNotificationData = async (invalidate = false) => {
  await Promise.all([
    getCategories(null, 'object', invalidate),
    getProviders(null, 'object', invalidate),
    getTemplates(null, 'object', invalidate),
    getTypes(null, 'object', invalidate),
  ]);
};

exports.getCategories = getCategories;
exports.getProviders = getProviders;
exports.getTemplates = getTemplates;
exports.getTypes = getTypes;
