'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define('Transfer', {
    paymentid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    manual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }
  }, {
    tableName: 'transfers'
  });
  Transfer.associate = function (models) {
    // associations can be defined here
    Transfer.belongsTo(models.PaymentRequest);
  };
  return Transfer;
};
