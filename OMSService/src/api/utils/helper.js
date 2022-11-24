const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/** Retrieve file paths from a given folder and its subfolders. */
const getFilePaths = (folderPath) => {
  const entryPaths = fs.readdirSync(folderPath).map((entry) => path.join(folderPath, entry));
  const filePaths = entryPaths.filter((entryPath) => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter((entryPath) => !filePaths.includes(entryPath));
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(getFilePaths(curr)), []);

  return [...filePaths, ...dirFiles];
};

exports.getFilePaths = getFilePaths;

exports.isSuperset = (array, subarray) => _.every(subarray, (item) => array.includes(item));

exports.getBasicAuthString = (username, password) => `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
