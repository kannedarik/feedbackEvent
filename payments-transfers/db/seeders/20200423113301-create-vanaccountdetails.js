'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'vanaccountdetails',
      [
        {
          accountno: '765432123456789',
          accountid: 'ba_DETA2UuuKtKLR1'
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('vanaccountdetails', null, {});
  }
};
