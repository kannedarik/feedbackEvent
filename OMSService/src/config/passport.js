const { BasicStrategy } = require('passport-http');
const { Strategy } = require('passport-custom');
const Client = require('../api/models/client.model');
const RupeekService = require('../api/services/rupeek.service');

const re = /(\S+)\s+(\S+)/;

const parseAuthHeader = (hdrValue) => {
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
};

const getUser = async (headers) => {
  // request comes from Kong / API Gateway
  const user = await RupeekService.jwtvalidate(headers);
  return {
    ...user,
    token: parseAuthHeader(headers.authorization).value || null,
    auth: 'JWT',
  };
};

const basic = async (username, apikey, done) => {
  try {
    const client = await Client.findOne({ username, archived: false });
    if (client) {
      if (client.verifyAPIKey(apikey)) {
        return done(null, client);
      }
    }
    return done(null, false);
  } catch (error) {
    return done(error);
  }
};

const jwt = async (req, done) => {
  try {
    const auth = req.headers.authorization;
    if (auth.split(' ')[0] !== 'JWT') {
      return done(null, false);
    }
    const user = await getUser(req.headers);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error);
  }
};

exports.basic = new BasicStrategy(basic);
exports.jwt = new Strategy(jwt);
