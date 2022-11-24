const _ = require('lodash');
const httpStatus = require('http-status');
const Promise = require('bluebird');
const RedisClient = require('../../config/redis');
const { logger } = require('../../config/logger');
const {
  getAllIdentificationKeys,
  delIdentificationKeys,
  hasDuplicates,
  getIdentificationKeysByValue,
} = require('../utils/cache/featureFlag');

exports.enable = async (req, res, next) => {
  try {
    let { identificationKeys, values } = req.body;
    const { featureName, featureIdentifier } = req.body;
    if (_.isEmpty(_.trim(identificationKeys))) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'IdentificationKeys or Values specified in body are empty' },
      );
    }
    identificationKeys = _.split(identificationKeys, ',');
    values = values ? _.split(values, ',') : 0;
    let warning;
    if (values.length < identificationKeys.length && values.length !== 0) {
      warning = 'There wasnt equal number of IdentificationKeys & Values provided, some IdentificationKeys were added with default value';
    }
    await Promise.map(identificationKeys, async (identificationKey, index) => {
      const key = `${featureName}:${featureIdentifier ? `${featureIdentifier}:${identificationKey}` : identificationKey}`;
      const value = values[index] || identificationKey;
      await RedisClient.setAsync(key, JSON.stringify(value));
    });
    return res.status(httpStatus.CREATED).json(
      { code: httpStatus.CREATED, message: `IdentificationKeys added successfully, ${identificationKeys} under the feature name: ${featureName} ${featureIdentifier ? `& Feature identifier: ${featureIdentifier}` : ''}`, warning },
    );
  } catch (error) {
    logger.error('There was an error adding IdentificationKeys', error);
    return next(error);
  }
};

exports.getAllEnabled = async (req, res, next) => {
  try {
    const { featureName, featureIdentifier, withValue } = req.query;
    const pattern = `${featureName}:${featureIdentifier || ''}*`;
    let msg;
    let identificationKeys;
    if (withValue) {
      identificationKeys = await getIdentificationKeysByValue(withValue, pattern);
      msg = `Found the following IdentificationKeys with value as ${withValue}`;
    } else {
      identificationKeys = await getAllIdentificationKeys(pattern);
      const duplicates = await hasDuplicates(identificationKeys);
      msg = (!featureIdentifier) && !_.isEmpty(duplicates) ? `Warning: found duplicates [${duplicates}], the search might be ambigious. Please specify featureIdentifier for better result. Found the following IdentificationKeys:` : 'Found the following IdentificationKeys:';
    }
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: msg,
      identificationKeys,
    });
  } catch (error) {
    logger.error('There was an error Retreiving all IdentificationKeys', error);
    return next(error);
  }
};

exports.disable = async (req, res, next) => {
  try {
    let { identificationKeys } = req.body;
    const { featureName, featureIdentifier } = req.body;
    if (_.isEmpty(_.trim(identificationKeys))) {
      return res.status(httpStatus.BAD_REQUEST).json(
        { code: httpStatus.BAD_REQUEST, message: 'IdentificationKeys specified are empty' },
      );
    }
    identificationKeys = _.split(identificationKeys, ',');
    let undeletedIdentificationKeys = await Promise.map(
      identificationKeys,
      async (identificationKey) => {
        const key = `${featureName}:${featureIdentifier ? `${featureIdentifier}:${identificationKey}` : identificationKey}`;
        const cachedBranch = await delIdentificationKeys(key);
        return cachedBranch;
      },
    );
    undeletedIdentificationKeys = _.compact(undeletedIdentificationKeys);
    if (_.isEmpty(undeletedIdentificationKeys)) {
      return res.status(httpStatus.OK).json(
        { code: httpStatus.OK, message: 'All IdentificationKeys matching were deleted successfully' },
      );
    }
    return res.status(httpStatus.PARTIAL_CONTENT).json(
      { code: httpStatus.PARTIAL_CONTENT, message: 'Some IdentificationKeys deleted successfully, the following were not found in cache', undeletedIdentificationKeys },
    );
  } catch (error) {
    logger.error('There was an error deleting IdentificationKeys', error);
    return next(error);
  }
};
