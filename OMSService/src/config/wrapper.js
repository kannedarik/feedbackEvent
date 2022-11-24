/**
 * This file is intended to be a wrapper over config variables
 * in both the environment and in Flagship.
 * Lookup for Flagship is yet to be added.
 */

exports.lookupBoolean = (keyName) => process.env[keyName] === 'true';

exports.lookupArray = (keyName) => {
  if (!process.env[keyName]) {
    return [];
  }

  return process.env[keyName].split(',');
};

exports.lookupString = (keyName) => process.env[keyName];
exports.lookupInteger = (keyName) => parseInt(process.env[keyName], 10);
