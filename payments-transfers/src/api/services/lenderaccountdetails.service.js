const _ = require('lodash');
const logger = require('../../config/logger').logger;
const sequelize = require('../models').sequelize;

const LenderAccountDetails = sequelize.import('../models/lenderaccount.model');

/**
 * Inserts a lender to the lenderaccountdetails table
 * @param {*} lender Lender to be inserted into db
 */
let createLenderAccount = async (lender) => {
  try {
    let fields = {};
    fields.lenderid = lender.lenderId;
    fields.accountid = lender.accountId;
    let lenderAccount = await LenderAccountDetails.create(fields);
    return lenderAccount.dataValues;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Deletes a lender
 * @param {*} lender Lender to be deleted
 */
let deleteLenderAccount = async (lender) => {
  try {
    let lenderAccount = await LenderAccountDetails.destroy({
      where: {
        lenderid: lender.lenderId,
        accountid: lender.accountId
      }
    });
    return lenderAccount;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Get account details for a lender
 * @param {*} lenderId
 */
let getAllAccountsForLender = async (lenderId) => {
  try {
    let lenders = await LenderAccountDetails.findAll({
      where: {
        lenderid: lenderId
      }
    });
    lenders = _.map(lenders, (lender) => {
      return lender.dataValues;
    });
    return lenders;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Get account details for a lender
 * @param {*} lenderId
 */
let getAccountForLender = async (lenderId) => {
  try {
    let lender = await LenderAccountDetails.findOne({
      where: {
        lenderid: lenderId
      }
    });
    return lender.dataValues;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Returns all the lenders
 */
let getAllLendersAccount = async () => {
  try {
    let lenders = await LenderAccountDetails.findAll();
    lenders = _.map(lenders, (lender) => {
      return lender.dataValues;
    });
    return lenders;
  }
  catch (error) {
    throw error;
  }
}

module.exports = {
  createLenderAccount,
  deleteLenderAccount,
  getAllAccountsForLender,
  getAllLendersAccount,
  getLenderAccountNo: getAccountForLender
}
