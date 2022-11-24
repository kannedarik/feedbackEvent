'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'paymentrequests',
        'loantype',
        {
          type: Sequelize.STRING,
          defaultValue: 'DEFAULT',
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'paymentrequests',
        'loantype'
      )
    ]);
  }
};