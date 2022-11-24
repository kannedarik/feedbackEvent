/* eslint-disable consistent-return */
// /* eslint-disable no-unused-vars */
const { simpleParser } = require('mailparser');

const {
  pick, isEqual, find, each,
} = require('lodash');
const uuidv4 = require('uuid/v4');
const mongoose = require('../../config/mongoose');
const whitelistmatrix = require('../../api/models/mongoose/miswhitelist.model');
const misfile = require('../../api/models/mongoose/misfile.model');
const misfileprocessor = require('../../api/services/misfileprocessor');
const AWSServices = require('../../api/services/aws');
const staticutils = require('../utils/static');
const { s3keyprefix } = require('../../config/vars');

mongoose.connect();

exports.checkfile = async (data) => {
  try {
    const s3obj = data.Records[0].s3;
    if (s3obj.bucket.name === process.env.MIS_BUCKET) {
      const s3objkey = s3obj.object.key;
      if (s3objkey.includes('sftp')) {
        this.checksftpfile(s3objkey);
      } else if (s3objkey.includes('ses')) {
        this.checkemail(s3objkey);
      } else {
        const misFile = await misfile.findOne({
          s3key: s3objkey.replace(`${s3keyprefix}/processed/`, ''),
          status: 'RECEIVED',
        });
        if (misFile) {
          await misfileprocessor.process(misFile);
        }
      }
    }
  } catch (err) {
    console.log('s3 notfication error', err);
  }
};

exports.checksftpfile = async (s3objkey) => {
  try {
    const fileName = s3objkey.replace(`${s3keyprefix}/sftp/`, '');
    const checkFile = await this.whitelistprocessing(fileName);
    if (checkFile) {
      const awsparams = {
        key: s3objkey.replace(/[+]/g, ' '),
        bucket: process.env.MIS_BUCKET,
      };
      const retrivaldata = await AWSServices.retrieve(awsparams);
      const awsKey = checkFile.lender + '_' + uuidv4();
      await misfile.create({
        filename: checkFile.filename,
        s3key: awsKey,
        status: 'RECEIVED',
        mode: 'SFTP',
        extension: checkFile.extension,
        lender: checkFile.lender,
        type: checkFile.type,
      });
      await AWSServices.upload({
        key: `${s3keyprefix}/processed/${awsKey}`,
        bucket: process.env.MIS_BUCKET,
        basedata: retrivaldata.Body,
        contentType: retrivaldata.ContentType,
      });
    }
  } catch (err) {
    console.log('sftp check error', err);
  }
};

exports.checkemail = async (s3objkey) => {
  try {
    const awsparams = {
      key: s3objkey,
      bucket: process.env.MIS_BUCKET,
    };
    let filename;
    const retrivaldata = await AWSServices.retrieve(awsparams);
    const lenders = staticutils.getLenders();
    const parsed = await simpleParser(retrivaldata.Body);
    const attachment = parsed.attachments;
    delete parsed.attachments;
    console.log(JSON.stringify(parsed));
    each(lenders, (lender) => {
      if (parsed.headerLines) {
        const item = find(parsed.headerLines, { key: 'x-forwarded-to' });
        if (item.line.includes(lender.email)) {
          filename = `${lender.slug}_${attachment[0].filename}`;
          return false;
        }
      }
      if (parsed.html && parsed.html.includes(lender.email)) {
        filename = `${lender.slug}_${attachment[0].filename}`;
        return false;
      }
    });
    if (!filename) {
      const lenderemail = parsed.to.value[0].address;
      const lender = find(lenders, { email: lenderemail });
      filename = `${lender.slug}_${attachment[0].filename}`;
    }
    const checkFile = await this.whitelistprocessing(filename);
    if (checkFile) {
      const awsKey = uuidv4();
      await misfile.create({
        filename: checkFile.filename,
        s3key: awsKey,
        status: 'RECEIVED',
        mode: 'EMAIL',
        extension: checkFile.extension,
        lender: checkFile.lender,
        type: checkFile.type,
      });
      await AWSServices.upload({
        key: `${s3keyprefix}/processed/${awsKey}`,
        bucket: process.env.MIS_BUCKET,
        basedata: attachment[0].content,
        contentType: attachment[0].contentType,
      });
      await AWSServices.delete(awsparams);
    }
  } catch (err) {
    console.log('email checklist error', err);
  }
};

exports.whitelistprocessing = async (fileName) => {
  try {
    let checkobj;
    let lenderobj;
    let filename;
    filename = fileName.replace(/[+]/g, ' ');
    filename = filename.replace(/[0-9]/g, '');
    const split = filename.toLowerCase().split(/[-_. ]/g);
    if (filename.includes('Transaction')) {
      checkobj = {
        lender: split[0],
        filename: split.slice(1, -2).join('_'),
        extension: split.slice(-1)[0],
        type: 'trans',
      };
      lenderobj = await whitelistmatrix.findOne({
        lender: split[0],
        type: 'trans',
      });
    } else {
      checkobj = {
        lender: split[0],
        filename: (split.length <= 3) ? split[1] : split.slice(1, -2).join('_'),
        extension: split.slice(-1)[0],
        type: 'mis',
      };
      lenderobj = await whitelistmatrix.findOne({
        lender: split[0],
        type: 'mis',
      });
    }
    const newlenderobj = pick(lenderobj, ['lender', 'filename', 'extension', 'type']);
    if (isEqual(checkobj, newlenderobj)) {
      return newlenderobj;
    }
    return false;
  } catch (err) {
    console.log('whitelist process error', err);
  }
};
