module.exports = (sequelize, DataTypes) => {
  const CustomerPhone = sequelize.define('CustomerPhone', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    phone: {
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
    tableName: 'customerphones',
  });
  CustomerPhone.associate = (models) => {
    // associations can be defined here
    CustomerPhone.belongsTo(models.Customer, { foreignKey: 'customer' });
  };
  return CustomerPhone;
};
