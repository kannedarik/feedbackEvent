module.exports = (sequelize, DataTypes) => {
  const CompositeLoan = sequelize.define('CompositeLoan', {
    compositescheme: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ltv: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    tableName: 'compositeloans',
  });
  return CompositeLoan;
};
