const _ = require('lodash');
const logger = require('../../config/logger').logger;
const sequelize = require('../models').sequelize;

const VanAccountDetails = sequelize.import('../models/vanaccount.model');
const CacheService = require('./cache.service');

/**
 * Inserts a van account to the vanaccountdetails table
 * @param {*} vanAccount Van account to be inserted into db
 */
let createVanAccount = async (vanAccount) => {
  try {
    let account = await VanAccountDetails.findOne({
      where: {
        accountno: vanAccount.accountNo
      }
    });
    if (account){
      logger.info('Van account already exists in db', account.dataValues);
      return account.dataValues;
    }
    let fields = {};
    fields.accountno = vanAccount.accountNo;
    fields.accountid = vanAccount.accountId;
    account = await VanAccountDetails.create(fields);
    if (account) {
      await CacheService.setKey(fields.accountno, fields.accountid);
      logger.info('Van account added to cache', vanAccount);
    }
    return account.dataValues;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Updates a van account in the vanaccountdetails table
 * @param {*} vanAccount Van account to be updated
 */
let updateVanAccount = async (vanAccount) => {
  try {
    let account = await VanAccountDetails.findOne(
      {
        where:
          { accountno: vanAccount.accountNo }
      }
    );
    if (account) {
      let updatedAccount = await VanAccountDetails.update(
        { accountid: vanAccount.accountId },
        {
          where:
            { accountno: vanAccount.accountNo }
        }
      );
      await CacheService.setKey(vanAccount.accountNo, vanAccount.accountId);
      logger.info('Van account updated in cache', vanAccount);
      return updatedAccount;
    }
    else {
      throw new Error('Van account does not exist in db');
    }
  }
  catch (error) {
    throw error;
  }
}

/**
 * Deletes a van account
 * @param {*} vanAccountNo accountno of the van account to be deleted
 * @returns no of deleted van accounts
 */
let deleteVanAccount = async (vanAccountNo) => {
  try {
    let vanAccount = await VanAccountDetails.destroy({
      where: {
        accountno: vanAccountNo
      }
    });
    if (vanAccount) {
      let key = await CacheService.getKey(vanAccountNo);
      if (!_.isEmpty(key)) {
        await CacheService.deleteKey(key);
        logger.info('Deleted key from cache', vanAccountNo);
      }
    }
    return vanAccount;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Get account id for a van account no
 * @param {*} accountNo
 */
let getVanAccountId = async (accountNo) => {
  try {
    let vanAccount = await VanAccountDetails.findOne({
      where: {
        accountno: accountNo
      }
    });
    return vanAccount.dataValues;
  }
  catch (error) {
    throw error;
  }
}

/**
 * Returns all the lenders
 */
let getAllVanAccounts = async () => {
  try {
    let vanAccounts = await VanAccountDetails.findAll();
    vanAccounts = _.map(vanAccounts, (vanAccount) => {
      return vanAccount.dataValues;
    });
    return vanAccounts;
  }
  catch (error) {
    throw error;
  }
}

module.exports = {
  createVanAccount,
  deleteVanAccount,
  getVanAccountId,
  getAllVanAccounts,
  updateVanAccount
}
