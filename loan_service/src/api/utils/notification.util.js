const _ = require('lodash');
const redisUtils = require('./redis.util');
const notificationService = require('../services/notification');
const { redisKeys } = require('./constants');

const getCategories = async (query, type = 'object', invalidate = false) => {
  if (invalidate) {
    await redisUtils.deleteFromCache(redisKeys.notification.categories);
  }

  let categories = await redisUtils.getFromCache(redisKeys.notification.categories);

  if (_.isEmpty(categories)) {
    categories = await notificationService.listCategories();
    await redisUtils.setToCache(redisKeys.notification.categories, categories);
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
    await redisUtils.deleteFromCache(redisKeys.notification.providers);
  }

  let providers = await redisUtils.getFromCache(redisKeys.notification.providers);

  if (_.isEmpty(providers)) {
    providers = await notificationService.listProviders();
    await redisUtils.setToCache(redisKeys.notification.providers, providers);
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
    await redisUtils.deleteFromCache(redisKeys.notification.templates);
  }

  let templates = await redisUtils.getFromCache(redisKeys.notification.templates);

  if (_.isEmpty(templates)) {
    templates = await notificationService.listTemplates();
    await redisUtils.setToCache(redisKeys.notification.templates, templates);
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
    await redisUtils.deleteFromCache(redisKeys.notification.types);
  }

  let types = await redisUtils.getFromCache(redisKeys.notification.types);

  if (_.isEmpty(types)) {
    types = await notificationService.listTypes();
    await redisUtils.setToCache(redisKeys.notification.types, types);
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

exports.getCategories = getCategories;
exports.getProviders = getProviders;
exports.getTemplates = getTemplates;
exports.getTypes = getTypes;
