'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('assets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      mongoid: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.UUID,
        references: {
          model: 'ornamenttypes',
          key: 'id'
        },
      },
      purity: {
        type: Sequelize.INTEGER
      },
      netweight: {
        type: Sequelize.FLOAT
      },
      grossweight: {
        type: Sequelize.FLOAT
      },
      picture: {
        type: Sequelize.UUID,
        references: {
          model: 'files',
          key: 'id'
        },
      },
      damaged: {
        type: Sequelize.BOOLEAN
      },
      ishallmark: {
        type: Sequelize.BOOLEAN
      },
      hasstone: {
        type: Sequelize.BOOLEAN
      },
      haswax: {
        type: Sequelize.BOOLEAN
      },
      noofitems: {
        type: Sequelize.INTEGER
      },
      stoneadjustment: {
        type: Sequelize.FLOAT
      },
      otheradjustment: {
        type: Sequelize.FLOAT
      },
      isreleased: {
        type: Sequelize.BOOLEAN
      },
      customer: {
        type: Sequelize.UUID
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
    return queryInterface.dropTable('assets');
  }
};