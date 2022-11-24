'use strict';
const uuid = require('uuid/v4');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('loanstatuses',[
      {
        id: uuid(),
        name: 'CREATED',
        description: 'Loan booked in market place',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: 'BOOKED',
        description: 'Loan booked in Lender system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: 'ON_HOLD',
        description: 'Loan is pending for closing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: 'BLOCKED',
        description: 'Loan is in blocked state',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: 'CLOSED',
        description: 'Loan is closed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: 'ARCHIVED',
        description: 'Loan is archived',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('loanstatuses', null, {});
  }
};
