'use strict';
module.exports = (sequelize, DataTypes) => {
  const lenderaccountdetails = sequelize.define('lenderaccountdetails', {
    lenderid: DataTypes.STRING,
    accountid: DataTypes.STRING
  }, {
    tableName: 'lenderaccountdetails'
  });

  return lenderaccountdetails;
};
