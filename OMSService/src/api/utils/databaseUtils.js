exports.readFromDatabase = async (searchCriteria, databaseModel) => {
  try {
    const result = await databaseModel.findOne(searchCriteria);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.writeToDatabase = async (searchCriteria, updateObj, databaseModel) => {
  try {
    if (!updateObj) return null;
    const result = await databaseModel
      .findOneAndUpdate(
        searchCriteria,
        updateObj,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deleteFromDatabase = async (searchCriteria, databaseModel) => {
  try {
    await databaseModel.deleteMany(searchCriteria);
  } catch (error) {
    throw new Error(error.message);
  }
};
