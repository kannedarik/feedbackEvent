'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('paymentrequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      paymentid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      paymentstatus: {
        type: Sequelize.ENUM(['AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED']),
        allowNull: false,
      },
      requeststatus: {
        type: Sequelize.ENUM(['CREATED', 'SUCCESS', 'FAILED']),
        defaultValue: 'CREATED',
      },
      response: {
        type: Sequelize.JSON,
        defaultValue: false,
        allowNull: false,
      },
      contactno: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('PaymentRequests');
  }
};
