const {
  map,
  isEmpty,
  includes,
  values,
  isEqual,
} = require('lodash');
const httpStatus = require('http-status');
const { redisInfo } = require('../../../config/vars');
const cacheClient = require('../../utils/redis.util');
const lendingmdsService = require('../../services/lendingmds');

/**
 * Synch cache from core
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Promise<any>>}
 */
exports.syncCacheFromCore = async (req, res, next) => {
  try {
    const branchVsLenderMapping = await lendingmdsService.getLenderBranchesInfo();
    const allKeys = map(branchVsLenderMapping, (lender, branch) => `${lender}:${branch}`);
    await Promise.map(allKeys, async (key) => {
      const newKey = `${redisInfo.keys.lenderBranches}:${key}`;
      await cacheClient.setToCache(newKey, redisInfo.loanGatewayRoutingKeys.payment);
    });
    return res.status(httpStatus.CREATED).json(
      { code: httpStatus.CREATED, message: 'Keys synched from core successfully', allKeys },
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Set cache for specific branches of a lender
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Promise<any>>}
 */
exports.setConfigForLender = async (req, res, next) => {
  try {
    const { lender, branches, value } = req.body;
    if (!includes(values(redisInfo.loanGatewayRoutingKeys), value)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'invalid value' },
      );
    }
    const branchVsLenderMapping = await lendingmdsService.getLenderBranchesInfo();
    const invalidLenderOrBranch = [];
    const allKeys = map(branches, (branch) => {
      if (isEmpty(branchVsLenderMapping[branch])
        || !isEqual(branchVsLenderMapping[branch], lender)) {
        invalidLenderOrBranch.push({ lender, branch });
      }
      return `${lender}:${branch}`;
    });
    if (!isEmpty(invalidLenderOrBranch)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'some branches or lender not found', branches: invalidLenderOrBranch },
      );
    }
    await Promise.map(allKeys, async (key) => {
      const cacheKey = `${redisInfo.keys.lenderBranches}:${key}`;
      await cacheClient.setToCache(cacheKey, value);
    });
    return res.status(httpStatus.CREATED).json(
      { code: httpStatus.CREATED, message: 'Keys added successfully', allKeys },
    );
  } catch (error) {
    return next(error);
  }
};
