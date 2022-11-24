const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.upload = async (opts) => {
  const params = {
    Bucket: opts.bucket,
    Key: opts.path,
    ACL: 'bucket-owner-full-control',
    Body: opts.basedata,
    ContentLength: opts.basedata.length,
    ContentType: opts.contentType,
  };

  const response = await s3.putObject(params).promise();
  return {
    ...response,
    filename: opts.filename,
    path: opts.path,
    bucket: opts.bucket,
    region: opts.region,
    contenttype: opts.contentType,
  };
};

exports.getSignedURL = (path, bucket, validity) => s3.getSignedUrl('getObject', {
  Bucket: bucket,
  Key: path,
  Expires: 60 * 60 * (validity || 1),
});
