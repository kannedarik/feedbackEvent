module.exports = (sequelize, DataTypes) => {
  const OrnamentType = sequelize.define('OrnamentType', {
    name: {
      type: DataTypes.STRING,
    },
    mongoid: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'ornamenttypes',
  });
  return OrnamentType;
};
