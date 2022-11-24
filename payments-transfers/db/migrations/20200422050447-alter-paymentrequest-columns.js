'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'paymentrequests',
        'paymenttype',
        {
          type: Sequelize.ENUM(['DEFAULT', 'TEMPVAN', 'UNLINKEDVAN']),
          defaultValue: 'DEFAULT',
        }
      ),
      queryInterface.changeColumn(
        'paymentrequests',
        'orderid', 
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query('drop type enum_paymentrequests_paymenttype;')
      .then(() => queryInterface.removeColumn(
        'paymentrequests',
        'paymenttype'
      )),
      queryInterface.changeColumn(
        'paymentrequests',
        'orderid',
        {
          type: Sequelize.STRING,
          allowNull: false,
        }
      ),
    ]);
  }
};