'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'lenderaccountdetails',
      [
        {
          lenderid: 'rcpl',
          accountid: 'acc_BY2AFq4mCfe2AB'
        },
        {
          lenderid: 'federal',
          accountid: 'acc_BY2ERbJR8cYsbb'
        },
        {
          lenderid: 'kvb',
          accountid: 'acc_CyFbyTtW1GNJ95'
        },
        {
          lenderid: 'icici',
          accountid: 'acc_DRGkaDOBVy4L91'
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('lenderaccountdetails', null, {});
  }
};
