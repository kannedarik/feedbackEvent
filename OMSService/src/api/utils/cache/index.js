/* eslint-disable no-unused-vars */
const { copyCoreData } = require('./core');
const { copyDocSignData } = require('./docsign');
const { copyNotificationData } = require('./notification');
const { logger } = require('../../../config/logger');

exports.copyData = async (invalidate = false) => {
  try {
    await Promise.all([
      copyCoreData(invalidate),
      copyDocSignData(invalidate),
      copyNotificationData(invalidate),
    ]);
  } catch (err) {
    logger.error('Failed to copy data', err);
    throw new Error(`Redis caching failed. Error: ${err}`);
  }
};
