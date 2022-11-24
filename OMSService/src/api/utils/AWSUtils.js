const httpStatus = require('http-status');
const AWS = require('aws-sdk');
const _ = require('lodash');

const APIError = require('./APIError');
const { awsConfig, differentialScheme, SNS } = require('../../config/vars');
const { logger } = require('../../config/logger');

AWS.config.update({
  region: awsConfig.region,
});

const sns = new AWS.SNS({ region: SNS.region });

exports.downloadFromS3 = async (opts) => {
  // update config
  try {
    const s3 = new AWS.S3();
    const { uploadFileBucket, uploadFileKey } = opts;
    const params = {
      Bucket: uploadFileBucket,
      Key: uploadFileKey,
    };
    const downloadedFileBuffer = await s3.getObject(params).promise();
    return downloadedFileBuffer;
  } catch (err) {
    if (err.code === 'NoSuchKey' && err.statusCode === 404) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: 'File not found',
      });
    }
    logger.error('Internal server error (AWS S3 download failed): ', err.message);
    throw new APIError({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message,
      errors: err,
    });
  }
};

exports.uploadToS3 = async (filename, type, body) => {
  // update config
  try {
    const s3 = new AWS.S3();
    const params = {
      Bucket: differentialScheme.differentialSchemeS3Bucket,
      Key: `${differentialScheme.uploadFolder}/${type}/${filename}`,
      Body: body,
    };
    const uploadedToS3 = await s3.upload(params).promise();
    logger.info(`File uploaded to S3 at ${uploadedToS3.Location}`);
    return uploadedToS3;
  } catch (err) {
    logger.error('Internal server error (AWS S3 upload failed): ', err.message);
    throw new APIError({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message,
      errors: err,
    });
  }
};

exports.publishMessage = (message) => {
  try {
    if (!_.isEmpty(message)) {
      const params = {
        TopicArn: SNS.bulkFileUploadSNSurl,
        Message: JSON.stringify(message),
      };
      logger.info('Publising message to SNS');
      return sns.publish(params).promise();
    }
    return { err: SNS.errorCodes.SNSPublishMsgBlank };
  } catch (err) {
    logger.error(`Something unexpected error occurred while publishing messages to SNS ::${err} for msg :: ${message}`);
    return { err: SNS.errorCodes.Exception };
  }
};
