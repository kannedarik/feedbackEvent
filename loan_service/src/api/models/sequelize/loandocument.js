module.exports = (sequelize, DataTypes) => {
  const LoanDocument = sequelize.define('LoanDocument', {
    type: {
      type: DataTypes.ENUM,
      values: ['pledgecard', 'signedpledgecard', 'esignedpledgecard', 'otpsignedpledgecard'],
    },
    file: {
      type: DataTypes.UUID,
    },
    loan: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: 'loandocuments',
  });
  return LoanDocument;
};
