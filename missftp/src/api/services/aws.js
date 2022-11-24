const httpStatus = require('http-status');
const AWS = require('aws-sdk');
const APIError = require('../utils/APIError');

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3 = new AWS.S3();

exports.upload = async (opts) => {
  const params = {
    Bucket: opts.bucket,
    Key: opts.key,
    ACL: 'private',
    Body: opts.basedata,
    ContentLength: opts.basedata.length,
    ContentType: opts.contentType,
  };

  const response = await s3.putObject(params).promise();
  return {
    ...response,
    key: opts.key,
    processedkey: opts.processedkey,
    bucket: opts.bucket,
    region: opts.region,
  };
};

exports.retrieve = async (opts) => {
  const params = {
    Bucket: opts.bucket,
    Key: opts.key,
  };

  const response = await s3.getObject(params).promise();
  return response;
};

exports.delete = async (opts) => {
  const params = {
    Bucket: opts.bucket,
    Key: opts.key,
  };

  await s3.deleteObject(params).promise();
};

exports.getSignedURL = (key, bucket, validity) => s3.getSignedUrl('getObject', {
  Bucket: bucket,
  Key: key,
  Expires: 60 * 60 * (validity || 1),
});

exports.doesObjectExists = async (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const response = await s3.headObject(params).promise();
    return response;
  } catch (err) {
    throw new APIError({ status: httpStatus.FAILED_DEPENDENCY, message: err.message });
  }
};
