'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lendercustomers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      lender_ref: {
        type: Sequelize.STRING
      },
      customer: {
        type: Sequelize.UUID,
        references: {
          model: 'customers',
          key: 'id'
        },
        allowNull: false,
      },
      lender: {
        type: Sequelize.STRING
      },
      rupeek_ref: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lendercustomers');
  }
};