const { has } = require('lodash');

/**
 * Generate password from allowed word
 */
const digits = '0123456789';
const alphabets = 'abcdefghijklmnopqrstuvwxyz';
const upperCase = alphabets.toUpperCase();
const specialChars = '#!&@';

const rand = (min, max) => {
  const random = Math.random();
  return Math.floor(random * (max - min) + min);
};

/**
 * Generate OTP of the length
 * @param  {number} length length of password.
 * @param  {object} options
 * @param  {boolean} options.digits Default: `true` true value includes digits in OTP
 * @param  {boolean} options.alphabets Default: `true` true value includes alphabets in OTP
 * @param  {boolean} options.upperCase Default: `true` true value includes upperCase in OTP
 * @param  {boolean} options.specialChars Default: `true` true value includes specialChars in OTP
 */
exports.generate = (length = 10, options) => {
  const generateOptions = options || {};

  generateOptions.digits = has(generateOptions, 'digits') ? options.digits : true;
  generateOptions.alphabets = has(generateOptions, 'alphabets') ? options.alphabets : true;
  generateOptions.upperCase = has(generateOptions, 'upperCase') ? options.upperCase : true;
  generateOptions.specialChars = has(generateOptions, 'specialChars') ? options.specialChars : true;

  const allowsChars = `${((generateOptions.digits || '') && digits)}${((generateOptions.alphabets || '') && alphabets)}${((generateOptions.upperCase || '') && upperCase)}${((generateOptions.specialChars || '') && specialChars)}`;

  let password = '';
  for (let index = 0; index < length; index += 1) {
    const charIndex = rand(0, allowsChars.length - 1);
    password += allowsChars[charIndex];
  }
  return password;
};
