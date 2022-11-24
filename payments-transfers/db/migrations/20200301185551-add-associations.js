'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint(
      'transfers', ['paymentid'],
      {
        type: 'FOREIGN KEY',
        name: 'FK_transfers_paymentrequest_paymentid',
        references: {
          table: 'paymentrequests',
          field: 'paymentid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    );
  },
}
