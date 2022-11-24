'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('loans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rupeek_ref: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      lender_ref: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      branch: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      product: {
        type: Sequelize.STRING
      },
      scheme: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customer: {
        type: Sequelize.UUID,
        references: {
          model: 'customers',
          key: 'id'
        },
        allowNull: false,
      },
      status: {
        type: Sequelize.UUID,
        references: {
          model: 'loanstatuses',
          key: 'id'
        },
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER
      },
      pledgedate: {
        type: Sequelize.DATE
      },
      maturitydate: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('loans');
  }
};