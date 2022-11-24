module.exports = (sequelize, DataTypes) => {
  const LoanAsset = sequelize.define('LoanAsset', {
    loan: {
      type: DataTypes.UUID,
    },
    asset: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: 'loanassets',
  });
  return LoanAsset;
};
