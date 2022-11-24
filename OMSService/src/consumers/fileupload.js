/* eslint-disable no-param-reassign */
const { Consumer } = require('sqs-consumer');
const _ = require('lodash');
const { Transform } = require('stream');
const csvStringify = require('csv-stringify');
const Promise = require('bluebird');

const mongoose = require('../config/mongoose');
const { logger } = require('../config/logger');
const { sqs, isNewrelicEnabled } = require('../config/vars');
const { uploadToS3 } = require('../api/utils/AWSUtils');
const {
  tempFileStore,
  sqs: SQSConst,
  loantoschememap,
  differentialschemefileupload,
} = require('../api/utils/constants');
const { validateObject } = require('../api/utils/fileUtility');
const {
  readFromDatabase,
  writeToDatabase,
  deleteFromDatabase,
} = require('../api/utils/databaseUtils');
const LoantoRenewalSchemeMap = require('../api/models/loantorenewalschememap.model');
const FileUpload = require('../api/models/fileuploadstatus.model');
const TempFileStore = require('../api/models/tempfilestore.model');

if (isNewrelicEnabled) require('newrelic');

const getSNSMessageObject = (message) => {
  const body = JSON.parse(message.Body);
  return JSON.parse(body.Message);
};

mongoose.connect();

logger.info(`Consumer being created for ${sqs.bulkfileupload}`);

const handleMessage = async (message) => {
  logger.info(`Received message from file upload SQS: ${message}`);
  const SQSObject = getSNSMessageObject(message);
  const { batchDataObject, type } = SQSObject;
  const validationObjects = SQSConst.differentialSchemaValidation;

  // validation of dataObject
  let validationRules = _.filter(validationObjects[type],
    (validationObj) => validationObj.required === true);
  validationRules = _.map(validationRules, (rule) => rule.validation);
  const validator = (testString, validate) => _.reduce(
    validate,
    (valid, element) => valid || testString.match(element),
    false,
  );

  await Promise.map(batchDataObject, async (dataObject) => {
    dataObject.status = type === differentialschemefileupload.actionTypes.edit
      ? loantoschememap.status.active
      : loantoschememap.status.inactive;
    const filestatusSearchCriteria = { filename: dataObject.filename };
    const loanSearchCriteria = { GLId: dataObject.GLId };
    const fileStatusUpdate = {
      processedrowcount: 0,
      errorrowcount: 0,
      receivedrowcount: 0,
    };

    const errorfilename = dataObject.filename;
    const S3UploadEntry = {
      filename: errorfilename,
    };

    try {
      // blind update the receivedrowcount field (increment by 1)
      fileStatusUpdate.receivedrowcount += 1;
      const tests = _.values(dataObject);
      validateObject(tests, validationRules, validator);

      S3UploadEntry.GLId = dataObject.GLId;
      S3UploadEntry.scheme = dataObject.scheme;

      if (type === differentialschemefileupload.actionTypes.delete) {
        dataObject.status = loantoschememap.status.inactive;
        const loan = await readFromDatabase(loanSearchCriteria, LoantoRenewalSchemeMap);
        if (!loan) throw new Error(`${dataObject.GLId} Gold Loanid doesn't exist`);
      }
      await writeToDatabase(loanSearchCriteria, dataObject, LoantoRenewalSchemeMap);

      // blind update the receivedrowcount field (increment by 1)
      fileStatusUpdate.processedrowcount += 1;

      S3UploadEntry.status = tempFileStore.status.success;
    } catch (error) {
      // update error count and write to an error file the error message
      // blind update the receivedrowcount field (increment by 1)
      fileStatusUpdate.errorrowcount += 1;
      S3UploadEntry.status = `${tempFileStore.status.failure}: ${error.message}`;
    }

    try {
      await writeToDatabase(
        { GLId: dataObject.GLId },
        S3UploadEntry,
        TempFileStore,
      );

      // blind write to DB and decide based on the updated object
      const fileStatus = await writeToDatabase(
        filestatusSearchCriteria, {
          $inc: fileStatusUpdate,
          status: differentialschemefileupload.status.processing,
        },
        FileUpload,
      );
      if (fileStatus.totalrowcount === fileStatus.receivedrowcount) {
        // Get all the documents of the collection
        const cursor = await TempFileStore.find(filestatusSearchCriteria).cursor();

        // Create a stream handler
        const streamHandler = new Transform({
          readableObjectMode: true,
          writableObjectMode: true, // Enables us to use object in chunk
          transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
          },
        });
        // Get the columns from the schema
        const config = _.omit(TempFileStore.schema.paths, tempFileStore.excludeFeilds);
        const columns = _.keys(config);
        // configure CSVStringify
        const stringifier = csvStringify({ header: true, columns });
        // convert to stream
        const dataStream = cursor.pipe(streamHandler).pipe(stringifier);

        // upload file to S3
        const S3Response = await uploadToS3(errorfilename, type, dataStream);
        await writeToDatabase(filestatusSearchCriteria, {
          errorfilelink: S3Response.Location,
          status: differentialschemefileupload.status.processed,
        }, FileUpload);

        // asynchronously delete all entries
        await deleteFromDatabase(filestatusSearchCriteria, TempFileStore);
      }
    } catch (error) {
      logger.error(error);
    }
  });
};

const app = Consumer.create({
  queueUrl: sqs.bulkfileupload,
  handleMessage,
});

app.on('error', (err) => {
  logger.error(err);
});

app.on('processing_error', (err) => {
  logger.error(err);
});

app.on('timeout_error', (err) => {
  logger.error(err);
});

app.start();

module.exports = { handleMessage };
