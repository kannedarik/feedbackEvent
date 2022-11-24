const _ = require('lodash');
const logger = require('../../config/logger').logger;
const sequelize = require('../models').sequelize;;

const TransferRequest = sequelize.import('../models/transfer.model');

/**
 * Creates transfers
 * @param {*} transferMappings
 */

let createTransfers = async (transferMappings) => {
  let transfers = {};
  try {
    transfers = await TransferRequest.bulkCreate(transferMappings, { returning: true });
    transfers = _.map(transfers, (transfer) => {
      return transfer.dataValues;
    });
    return transfers;
  }
  catch (error) {
    logger.error('Error occurred while saving transfers into db:', error);
    throw error;
  }
}


module.exports = {
  createTransfers,
}
