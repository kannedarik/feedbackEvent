const {
  isEmpty,
  isEqual,
  includes,
  values,
} = require('lodash');
const httpStatus = require('http-status');
const { redisInfo, redisDiscrepancyKey } = require('../../../config/vars');
const cacheClient = require('../../utils/redis.util');
const lendingmdsService = require('../../services/lendingmds');

/**
 * Get  key value
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Promise<any>>}
 */
exports.read = async (req, res, next) => {
  try {
    const { lender, branch } = req.query;
    const keyPrefix = `${redisInfo.keys.lenderBranches}:${lender}:${branch}`;
    const cachedValue = await cacheClient.getFromCache(keyPrefix);
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, cachedValue });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add key-value to cache
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.create = async (req, res, next) => {
  try {
    const { lender, branch, value } = req.body;
    const branchVsLenderMapping = await lendingmdsService.getLenderBranchesInfo();
    if (isEmpty(branchVsLenderMapping[branch]) || !isEqual(branchVsLenderMapping[branch], lender)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'Lender or branch  not found' },
      );
    }
    if (!includes(values(redisInfo.loanGatewayRoutingKeys), value)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'invalid value' },
      );
    }
    const key = `${redisInfo.keys.lenderBranches}:${lender}:${branch}`;
    const cachedValue = await cacheClient.setToCache(key, value);
    return res.status(httpStatus.CREATED).json(
      { code: httpStatus.CREATED, message: 'Key added successfully', cachedValue },
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Update cache
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.update = async (req, res, next) => {
  try {
    const { lender, branch, value } = req.body;
    if (!includes(values(redisInfo.loanGatewayRoutingKeys), value)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'invalid value' },
      );
    }
    const key = `${redisInfo.keys.lenderBranches}:${lender}:${branch}`;
    let cachedValue = await cacheClient.getFromCache(key);
    if (isEmpty(cachedValue)) {
      return res.status(httpStatus.NOT_FOUND).json(
        { code: httpStatus.NOT_FOUND, message: 'Key not found' },
      );
    }
    cachedValue = await cacheClient.setToCache(key, value);
    return res.status(httpStatus.CREATED).json(
      { code: httpStatus.OK, message: 'Key added successfully', cachedValue },
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a key from cache
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.delete = async (req, res, next) => {
  try {
    const { lender, branch } = req.body;
    const key = `${redisInfo.keys.lenderBranches}:${lender}:${branch}`;
    const cachedValue = await cacheClient.getFromCache(key);
    if (isEmpty(cachedValue)) {
      return res.status(httpStatus.NOT_FOUND).json(
        { code: httpStatus.NOT_FOUND, message: 'Key not found' },
      );
    }
    await cacheClient.deleteFromCache(key);
    return res.status(httpStatus.NO_CONTENT).json(
      { code: httpStatus.NO_CONTENT, message: 'Key deleted successfully', cachedValue },
    );
  } catch (error) {
    return next(error);
  }
};

/*
 * Fetch discrepancy message from cache
*/

exports.fetchdiscrepancymsg = async (req, res, next) => {
  try {
    let message = await cacheClient.getFromCache(redisDiscrepancyKey);
    if (isEmpty(message)) {
      return res.status(httpStatus.NOT_FOUND).json(
        { code: httpStatus.NOT_FOUND, message: 'Key not found' },
      );
    }
    message = req.param('type') ? message[req.param('type')] : message;
    if (!isEmpty(req.param('type')) && isEmpty(message)) {
      return res.status(httpStatus.NOT_FOUND).json(
        { code: httpStatus.NOT_FOUND, message: 'discrepancy type not found' },
      );
    }
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message });
  } catch (error) {
    return next(error);
  }
};

/*
 * set discrepancy message to cache
*/

exports.setdiscrepancymsg = async (req, res, next) => {
  try {
    const { message } = req.body;
    const cachedValue = await cacheClient.setToCache(redisDiscrepancyKey, message);
    if (isEmpty(cachedValue)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'Keys not set' },
      );
    }
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, cachedValue });
  } catch (error) {
    return next(error);
  }
};
