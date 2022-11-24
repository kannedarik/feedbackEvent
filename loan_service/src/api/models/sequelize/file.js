module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    filename: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
    },
    bucket: {
      type: DataTypes.STRING,
    },
    region: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'files',
  });
  return File;
};
