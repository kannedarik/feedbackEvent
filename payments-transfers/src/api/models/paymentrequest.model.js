'use strict';
module.exports = (sequelize, DataTypes) => {
  const PaymentRequest = sequelize.define('PaymentRequest', {
    orderid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    paymentid: {
      type: DataTypes.STRING,
      defaultValue: false,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentstatus: {
      type: DataTypes.ENUM(['AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED']),
      allowNull: false,
    },
    requeststatus: {
      type: DataTypes.ENUM(['CREATED', 'SUCCESS', 'FAILED']),
      defaultValue: 'CREATED',
    },
    paymenttype: {
      type: DataTypes.ENUM(['DEFAULT', 'TEMPVAN', 'UNLINKEDVAN']),
      defaultValue: 'DEFAULT',
    },
    loantype: {
      type: DataTypes.STRING,
      defaultValue: 'DEFAULT',
    },
    response: {
      type: DataTypes.JSON,
      defaultValue: false,
      allowNull: false,
    },
    contactno: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'paymentrequests'
  });
  PaymentRequest.associate = function (models) {
    // associations can be defined here
    PaymentRequest.hasMany(models.Transfer);
  };
  return PaymentRequest;
};
