module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    mongoid: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.UUID,
    },
    purity: {
      type: DataTypes.INTEGER,
    },
    netweight: {
      type: DataTypes.FLOAT,
    },
    grossweight: {
      type: DataTypes.FLOAT,
    },
    picture: {
      type: DataTypes.UUID,
    },
    damaged: {
      type: DataTypes.BOOLEAN,
    },
    ishallmark: {
      type: DataTypes.BOOLEAN,
    },
    hasstone: {
      type: DataTypes.BOOLEAN,
    },
    haswax: {
      type: DataTypes.BOOLEAN,
    },
    noofitems: {
      type: DataTypes.INTEGER,
    },
    stoneadjustment: {
      type: DataTypes.FLOAT,
    },
    otheradjustment: {
      type: DataTypes.FLOAT,
    },
    isreleased: {
      type: DataTypes.BOOLEAN,
    },
    customer: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: 'assets',
  });
  Asset.associate = (models) => {
    // associations can be defined here
    Asset.belongsToMany(models.loan, { through: models.LoanAsset, foreignKey: 'asset' });
    Asset.belongsTo(models.OrnamentType, { foreignKey: 'type' });
    Asset.belongsTo(models.File, { foreignKey: 'picture' });
  };
  return Asset;
};
