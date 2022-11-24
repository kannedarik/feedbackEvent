'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('vanaccountdetails', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true
      },
      accountno: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      accountid: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('vanaccountdetails');
  }
};
