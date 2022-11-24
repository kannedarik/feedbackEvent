module.exports = (sequelize, DataTypes) => {
  const LoanMapping = sequelize.define('LoanMapping', {
    compositeloan: {
      type: DataTypes.UUID,
    },
    loan: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: 'loanmappings',
  });
  return LoanMapping;
};
