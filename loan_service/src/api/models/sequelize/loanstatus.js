module.exports = (sequelize, DataTypes) => {
  const LoanStatus = sequelize.define('LoanStatus', {
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'loanstatuses',
  });
  return LoanStatus;
};
