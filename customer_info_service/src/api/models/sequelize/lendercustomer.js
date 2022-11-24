module.exports = (sequelize, DataTypes) => {
  const LenderCustomer = sequelize.define('LenderCustomer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lender_ref: {
      type: DataTypes.STRING,
    },
    customer: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rupeek_ref: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  }, {
    tableName: 'lendercustomers',
  });
  LenderCustomer.associate = (models) => {
    // associations can be defined here
    LenderCustomer.belongsTo(models.Customer, { foreignKey: 'customer' });
  };
  return LenderCustomer;
};
