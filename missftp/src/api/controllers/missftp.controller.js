const Promise = require('bluebird');
const moment = require('moment');
const httpStatus = require('http-status');
const SFTPServices = require('../services/sftp.js');
const mongoose = require('../../config/mongoose');
const staticutils = require('../utils/static');
const misfile = require('../../api/models/mongoose/misfile.model');
const Notificationservice = require('../../api/services/notification');

mongoose.connect();

exports.pullSFTP = async (req, res, next) => {
  try {
    console.log('monitor runnning');
    await SFTPServices.getsftpfile();
    // console.log(sftpResponse);
    return res.json({ code: httpStatus.OK, message: 'File uploaded successfully' });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};


exports.raiseAlert = async (req, res, next) => {
  try {
    const currentDay = moment().startOf('day').add(5.5, 'hours').toISOString();
    const lenders = staticutils.getLenders();
    await Promise.map(lenders, async (lender) => {
      const misFile = await misfile.findOne({
        lender: lender.slug,
        createdAt: { $gte: new Date(currentDay) },
        type: 'mis',
      });
      if (!misFile) {
        await Notificationservice.raiselenderalert({
          lender: lender.slug,
          type: 'mis',
        });
      }
      const transactionFile = await misfile.findOne({
        lender: lender.slug,
        createdAt: { $gte: new Date(currentDay) },
        type: 'trans',
      });

      if (!transactionFile) {
        await Notificationservice.raiselenderalert({
          lender: lender.slug,
          type: 'trans',
        });
      }
    });
    return res.json({ code: httpStatus.OK, message: 'Email has been sent for respective lenders' });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
