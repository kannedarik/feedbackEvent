/* eslint-disable import/no-extraneous-dependencies */
const ConfigWrapper = require('../config/wrapper');

module.exports = {
//   mongoose: () => {
//     let db;
//     let dbURI;
//     let connection;

  //     beforeAll(async () => {
  //       db = new MongoMemoryServer();
  //       dbURI = await db.getUri();
  //       connection = mongoose.connect({ uri: dbURI });
  //     });

  //     beforeEach(async () => {
  //       await Object.values(connection.collections).forEach(async (collection) => {
  //         try {
  //           await collection.deleteMany({});
  //         } catch (error) {
  //           // eslint-disable-next-line no-console
  //           console.error(error);
  //         }
  //       });
  //     });

  //     afterAll(() => {
  //       mongoose.close();
  //       db.stop();
  //     });

  //     return connection;
  //   },

  mockConfig: (configMap) => {
    jest.spyOn(ConfigWrapper, 'lookupBoolean').mockImplementation((keyName) => configMap[keyName]);
    jest.spyOn(ConfigWrapper, 'lookupArray').mockImplementation((keyName) => configMap[keyName]);
    jest.spyOn(ConfigWrapper, 'lookupString').mockImplementation((keyName) => configMap[keyName]);
    jest.spyOn(ConfigWrapper, 'lookupInteger').mockImplementation((keyName) => configMap[keyName]);
  },
};
