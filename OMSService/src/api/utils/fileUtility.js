const fs = require('fs');
const _ = require('lodash');
const { logger } = require('../../config/logger');

const AWSUtils = require('./AWSUtils');

const validateObject = (testList, validationObj, validator) => {
  // [TODO]: change to _.find
  _.forEach(testList, (test) => {
    if (!validator(test, validationObj)) { throw new Error(`Validation Falied for test ${test}`); }
  });
};

const pushJSONtoSNS = (object) => AWSUtils.publishMessage(object);

const deleteFile = (path) => fs.unlink(path, (error) => {
  if (error) throw new Error(error.message);
});

const deleteAfterSending = (err, tempFilePath) => {
  if (err) {
    logger.error('cant download the file', err);
  }
  fs.unlinkSync(tempFilePath, (error) => {
    if (error) throw new Error(error.message);
  });
};

module.exports = {
  validateObject,
  pushJSONtoSNS,
  deleteFile,
  deleteAfterSending,
};
