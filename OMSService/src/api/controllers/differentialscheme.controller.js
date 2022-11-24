const _ = require('lodash');
const Velocity = require('velocityjs');
const fs = require('fs');
const httpStatus = require('http-status');
const moment = require('moment');
const Promise = require('bluebird');
const csvtojson = require('csvtojson');
const pathModule = require('path');
const csvReadable = require('stream').Readable;

const DifferentialScheme = require('../models/loantorenewalschememap.model');
const fileUtils = require('../utils/fileUtility');
const databaseUtils = require('../utils/databaseUtils');
const FileUpload = require('../models/fileuploadstatus.model');
const {
  differentialScheme: differentialSchemeConst,
  loantoschememap,
  differentialschemefileupload,
  sqs: SQSConst,
} = require('../utils/constants');
const { logger } = require('../../config/logger');
const { downloadFromS3 } = require('../utils/AWSUtils');
const { differentialScheme: differentialSchemeVars, env } = require('../../config/vars');

const CommaSeparatedStrToArray = (str) => {
  const Arr = _.map(_.split(str, ','), (item) => _.trim(item));
  return _.compact(Arr);
};

const getDownloadString = async (flatDataArray, tmpl) => {
  const headers = differentialSchemeConst.download.loanToSchemeHeaders;
  const newline = '\n';
  const context = {
    flatDataArray,
    headers,
    newline,
  };
  const csvString = Velocity.render(tmpl, context, {});
  const respFilename = `download_LoanToScheme_${moment().format('DD_MM_YY_hh_mm_ss')}_csv.csv`;
  return { csvString, respFilename };
};

const fetchLoanToSchemMapping = async (query) => {
  const count = await DifferentialScheme.countDocuments(query);

  const paginatedResults = await DifferentialScheme.find(query)
    .sort({ createdAt: 'asc', _id: 'asc' })
    .select('-_id -updatedAt -createdAt -status');

  const formattedResults = _.map(paginatedResults, (row) => {
    const temp = _.cloneDeep(row.toObject());
    temp.createdAt = moment(temp.createdAt).utc().add(5.5, 'hours').format('DD_MM_YY_hh_mm_ss');
    temp.updatedAt = moment(temp.updatedAt).utc().add(5.5, 'hours').format('DD_MM_YY_hh_mm_ss');
    temp.lastUploadedAt = moment(temp.lastUploadedAt).utc().add(5.5, 'hours').format('DD_MM_YY_hh_mm_ss');
    return temp;
  });

  const tmpl = fs.readFileSync(`${__dirname}/../../templates/download_loan_scheme_data.vm`, 'utf-8');
  const csvValue = await getDownloadString(formattedResults, tmpl);

  return {
    count,
    csvValue,
  };
};

const writeToFile = async (filePath, dataString) => new Promise(
  (resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    // eslint-disable-next-line new-cap
    const readString = new csvReadable();
    readString._read = () => { };
    readString.push(dataString);
    readString.push(null);

    writeStream.on('open', () => {
      readString.pipe(writeStream);
    }).on('error', (err) => {
      logger.error('There was an error writing to the file', err);
      reject(err);
    }).on('finish', () => {
      resolve('Written to File');
    });
  },
);

exports.downloadFiltered = async (req, res, next) => {
  try {
    const filter = req.body;
    const query = { $and: [{ status: { $eq: loantoschememap.status.active } }] };
    const tempFileName = `download_${moment().utc().add(5.5, 'hours').format('DD_MM_YYYY_hh_mm_ss')}.csv`;
    const tempFilePath = pathModule.join(__dirname, `../../${tempFileName}`);

    // building the filter query
    if (filter.GLId && !_.isEmpty(_.trim(filter.GLId))) {
      const GLIdArr = await CommaSeparatedStrToArray(filter.GLId);
      query.$and.push({ GLId: { $in: GLIdArr } });
    }
    if (filter.scheme && !_.isEmpty(_.trim(filter.scheme))) {
      const schemeIDsArr = await CommaSeparatedStrToArray(filter.scheme);
      query.$and.push({ scheme: { $in: schemeIDsArr } });
    }
    if (filter.uploadedBy && !_.isEmpty(_.trim(filter.uploadedBy))) {
      const uploadedByArr = await CommaSeparatedStrToArray(filter.uploadedBy);
      query.$and.push({ uploadedBy: { $in: uploadedByArr } });
    }
    if (filter.createdAt && !_.isEmpty(_.trim(filter.createdAt))) {
      query.$and.push({ createdAt: filter.createdAt });
    }
    if (filter.updatedAt && !_.isEmpty(_.trim(filter.updatedAt))) {
      query.$and.push({ updatedAt: filter.updatedAt });
    }
    if (filter.lastUploadedAt && !_.isEmpty(_.trim(filter.lastUploadedAt))) {
      query.$and.push({ lastUploadedAt: filter.lastUploadedAt });
    }
    // fetches the mongoDB data and converts to csv Value
    const { csvValue } = await fetchLoanToSchemMapping(query);
    // writes the csvString to the csv file
    await writeToFile(tempFilePath, csvValue.csvString);

    return res.download(tempFilePath, (err) => fileUtils.deleteAfterSending(err, tempFilePath));
  } catch (error) {
    logger.error('There was an error downloading LoanToSchemeID Mapping', error);
    return next(error);
  }
};

exports.downloadTemplate = async (req, res, next) => {
  try {
    const { templateName } = req.query;
    const tmpl = fs.readFileSync(`${__dirname}/../../templates/download_differential_scheme_${templateName}.vm`, 'utf-8');
    const tempFileName = `Differential_Scheme_${templateName}.csv`;
    const tempFilePath = pathModule.join(__dirname, `../../${tempFileName}`);
    const sample = Velocity.render(tmpl, {});

    await writeToFile(tempFilePath, sample);
    return res.download(tempFilePath, (err) => fileUtils.deleteAfterSending(err, tempFilePath));
  } catch (error) {
    logger.error('There was an error fetching template', error);
    return next(error);
  }
};

const fetchAndTransformSchemeIDs = async (selectedLoanIDs, totalLoanIDs, pendingLoanIDs) => {
  try {
    const result = {};
    const selectedLoanIDsArray = CommaSeparatedStrToArray(selectedLoanIDs);
    const pendingLoanIDsArray = CommaSeparatedStrToArray(pendingLoanIDs);

    const selectedSchemeIds = await DifferentialScheme.find({
      $and: [
        { status: { $eq: loantoschememap.status.active } },
        { GLId: { $in: selectedLoanIDsArray } },
      ],
    })
      .select('scheme -_id');
    result.selectedSchemeID = !_.isEmpty(selectedSchemeIds) ? _.map(selectedSchemeIds, (row) => row.scheme) : '';

    if (!_.isEmpty(pendingLoanIDsArray)) {
      const pendingSchemeIds = await DifferentialScheme.find({
        $and: [
          { status: { $eq: loantoschememap.status.active } },
          { GLId: { $in: pendingLoanIDsArray } },
        ],
      })
        .select('scheme -_id');
      result.pendingSchemeID = !_.isEmpty(pendingSchemeIds) ? _.map(pendingSchemeIds, (row) => row.scheme) : '';
    } else {
      result.pendingSchemeID = '';
    }

    const totalSchemeIds = _.union(result.selectedSchemeID, result.pendingSchemeID);
    result.totalSchemeID = !_.isEmpty(totalSchemeIds) ? totalSchemeIds : '';

    return result;
  } catch (error) {
    logger.error('There was an error fetching & transforming Schemes ', error);
    return new Error('There was an error fetching & transforming Schemes ', { cause: error });
  }
};

exports.fetchOverriddenSchemes = async (req, res, next) => {
  try {
    const { selectedLoanIDs, totalLoanIDs, pendingLoanIDs } = req.query;

    const schemeIDs = await fetchAndTransformSchemeIDs(
      selectedLoanIDs,
      totalLoanIDs,
      pendingLoanIDs,
    );
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      schemeIDs,
    });
  } catch (error) {
    logger.error('There was an error fetching Overridden Schemes', error);
    return next(error);
  }
};

exports.downloadS3ErrorFile = async (req, res, next) => {
  try {
    const {
      fileName: uploadFileName,
      identifier,
      bucket,
      path,
    } = req.query;
    const uploadFileBucket = differentialSchemeVars[bucket];
    const uploadFileFolder = `${env}/${path}/${identifier}`;
    const uploadFileKey = `${uploadFileFolder}/${uploadFileName}`;
    const downloadedFileBuffer = await downloadFromS3({ uploadFileBucket, uploadFileKey });
    const downloadedFileString = downloadedFileBuffer.Body.toString();
    // eslint-disable-next-line no-buffer-constructor
    const buffer = new Buffer(downloadedFileString, 'utf-8');
    // eslint-disable-next-line new-cap
    const readable = new csvReadable();
    // eslint-disable-next-line no-underscore-dangle
    readable._read = () => { };
    readable.push(buffer);
    readable.push(null);
    const respFilename = `attachment; filename=${uploadFileName}`;
    res.setHeader('Content-disposition', respFilename);
    res.setHeader('Content-Type', 'text/csv');
    readable.pipe(res);
    logger.info(`${uploadFileName} downloaded successfully`);
    return res.status(httpStatus.OK);
  } catch (err) {
    return next(err);
  }
};

exports.bulkuploadFile = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const { file } = req;

    let { filename } = file;
    // eslint-disable-next-line prefer-destructuring
    const [fileName, extension] = filename.split('.');
    filename = `${fileName}_${moment().utc().add(5.5, 'hours').format('DD_MM_YY_hh_mm_ss')}_${identifier}_error.${extension}`;
    // convert CSV file to JSON
    const JSONfileEntries = await csvtojson().fromFile(file.path);

    // row limit check
    if (JSONfileEntries.length > differentialschemefileupload.fileUploadRowLimit) {
      throw new Error('Too many rows uploaded at once');
    }

    // settingup validation rules
    const validationObjects = SQSConst.differentialSchemaValidation;
    let validationRules = _.filter(validationObjects[identifier],
      (validationObj) => validationObj.required === true);
    validationRules = _.map(validationRules, (rule) => rule.headername);
    const validator = (test, validate) => _.find(validate, (el) => el === test);

    // batch into rows of 10
    const batches = _.chunk(JSONfileEntries, differentialschemefileupload.chunkSize);
    logger.info(`Batch count: ${batches.length}`);
    // batch process all the rows and wait for all the batches to be sent to SNS
    await Promise.map(batches, (batch) => {
      const newBatch = _.map(batch, (entry) => {
        const entryCopy = { ...entry };
        entryCopy.filename = filename;
        entryCopy.uploadedBy = req.user.id;
        entryCopy.lastUploadedAt = new Date().toString();
        // validation of headers
        fileUtils.validateObject(_.keys(entryCopy), validationRules, validator);
        return entryCopy;
      });
      const SNSObject = {
        type: identifier,
        batchDataObject: newBatch,
      };
      return fileUtils.pushJSONtoSNS(SNSObject);
    });

    // after all the lines have been pushed, delete the file
    fileUtils.deleteFile(file.path);
    // creating db entry
    const fileEntry = await databaseUtils.writeToDatabase(
      { filename }, {
        filename,
        totalrowcount: JSONfileEntries.length,
        fileuploadidentifier: identifier,
      },
      FileUpload,
    );

    return res.status(httpStatus.OK).send({
      code: httpStatus.OK,
      message: 'File successfully uploaded',
      file: fileEntry.filename,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST)
      .send({ code: httpStatus.BAD_REQUEST, message: error.message });
  }
};
