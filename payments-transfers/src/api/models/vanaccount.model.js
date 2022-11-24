'use strict';
module.exports = (sequelize, DataTypes) => {
  const vanaccountdetails = sequelize.define('vanaccountdetails', {
    accountno: DataTypes.STRING,
    accountid: DataTypes.STRING
  }, {
    tableName: 'vanaccountdetails'
  });

  return vanaccountdetails;
};
