module.exports = {
  verbose: true,
  moduleFileExtensions: ['js', 'json'],
  rootDir: './src',
  testRegex: '.test.js$',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['../jest.setup.js', './test/setup.js'],
  clearMocks: true,
};
