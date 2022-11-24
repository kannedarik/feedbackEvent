/* eslint-disable no-unused-vars */
const Client = require('ssh2-sftp-client');
const promise = require('bluebird');
const fs = require('file-system');
const { filter, find } = require('lodash');
const xls = require('node-xlsx');
const xlsx = require('xlsx');

const moment = require('moment');
const AWS = require('./aws');
const staticutils = require('../utils/static');
const { privateaKeyPath } = require('../utils/constants');
const { sftpip, s3keyprefix } = require('../../config/vars');

const sftp = new Client();
const currentDay = moment().startOf('day');
exports.getsftpfile = async (options) => {
  const reqoptions = {
    host: sftpip,
    port: 22,
    username: process.env.username,
    privateKey: fs.readFileSync(privateaKeyPath),
  };
  await sftp.connect(reqoptions);
  const lenders = staticutils.getLenders();
  const contenttypes = staticutils.getcontenttype();
  await promise.map(lenders, async (lender) => {
    try {
      const allFiles = await sftp.list(`sftp/${lender.slug}`);
      const filteredfiles = filter(allFiles, files => (files.modifyTime >= currentDay.valueOf() && files.name !== '.DS_Store'));
      await promise.map(filteredfiles, async (filestobeuploaded) => {
        const split = filestobeuploaded.name.split('.');
        const localpath = `/tmp/data.${split[1]}`;
        await sftp.fastGet(`sftp/${lender.slug}/${filestobeuploaded.name}`, localpath);
        const buffer = Buffer.from(fs.readFileSync(localpath));
        const contentType = find(contenttypes, { type: split[1] });
        const response = await AWS.upload({
          bucket: process.env.MIS_BUCKET,
          key: `${s3keyprefix}/sftp/${lender.slug}_${filestobeuploaded.name}`,
          basedata: buffer,
          contentType: contentType.contentType,
        });
      });
    } catch (err) {
      console.log(err);
    }
  });
  await sftp.end();
  return true;
};
