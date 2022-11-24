module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mongoid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'customers',
  });
  Customer.associate = (models) => {
    // associations can be defined here
    Customer.hasMany(models.LenderCustomer, { foreignKey: 'customer' });
    Customer.hasMany(models.CustomerPhone, { foreignKey: 'customer' });
  };
  return Customer;
};
