module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    rupeek_ref: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lender_ref: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product: {
      type: DataTypes.STRING,
    },
    scheme: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.UUID,
    },
    amount: {
      type: DataTypes.INTEGER,
    },
    pledgedate: {
      type: DataTypes.DATE,
    },
    maturitydate: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'loans',
  });
  Loan.associate = (models) => {
    // associations can be defined here
    Loan.belongsTo(models.LoanStatus, { foreignKey: 'status' });
    Loan.belongsToMany(models.Asset, { through: models.LoanAsset, foreignKey: 'loan' });
    Loan.belongsToMany(models.File, { through: models.LoanDocument, foreignKey: 'loan' });
    Loan.belongsToMany(models.CompositeLoan, { through: models.LoanMapping, foreignKey: 'loan' });
  };
  return Loan;
};
