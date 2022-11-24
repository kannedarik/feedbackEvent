module.exports = (sequelize, DataTypes) => {
  const LenderCustomerPhone = sequelize.define('LenderCustomerPhone', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    primary: {
      type: DataTypes.BOOLEAN,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    archivedat: {
      type: DataTypes.DATE,
    },
    createdby: {
      type: DataTypes.STRING,
    },
    updatedby: {
      type: DataTypes.STRING,
    },
    archivedby: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'lendercustomerphones',
  });
  LenderCustomerPhone.associate = (models) => {
    // associations can be defined here
    LenderCustomerPhone.belongsTo(models.CustomerPhone, { foreignKey: 'phone' });
  };
  return LenderCustomerPhone;
};
