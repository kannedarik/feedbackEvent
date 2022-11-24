/* eslint-disable max-len */
const fs = require('fs');
const path = require('path');

/** Retrieve file paths from a given folder and its subfolders. */
const getFilePaths = (folderPath) => {
  const entryPaths = fs.readdirSync(folderPath).map(entry => path.join(folderPath, entry));
  const filePaths = entryPaths.filter(entryPath => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter(entryPath => !filePaths.includes(entryPath));
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(getFilePaths(curr)), []);

  return [...filePaths, ...dirFiles];
};

exports.bulkHasOperations = b => b && b.s && b.s.currentBatch && b.s.currentBatch.operations && b.s.currentBatch.operations.length > 0;

exports.getFilePaths = getFilePaths;
