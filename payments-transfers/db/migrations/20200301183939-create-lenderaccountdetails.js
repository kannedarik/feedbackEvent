'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lenderaccountdetails', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true
      },
      lenderid: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      accountid: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lenderaccountdetails');
  }
};
