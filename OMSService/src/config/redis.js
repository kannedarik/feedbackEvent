const redisclient = require('redis');
const Promise = require('bluebird');
const { redis } = require('./vars');
const configWrapper = require('./wrapper');

Promise.promisifyAll(redisclient);

const client = redisclient.createClient({
  host: redis.endpoint,
  port: redis.port,
});

client.select(configWrapper.lookupInteger('REDIS_INDEX') % 1 === 0 ? configWrapper.lookupInteger('REDIS_INDEX') : 0, (err, res) => {
  if (err) {
    console.error(`Redis select error: ${err}`); // eslint-disable-line no-console
    process.exit(-1);
  }
  console.log(`Selected redis database ${configWrapper.lookupInteger('REDIS_INDEX')} with redis response ${res}`); // eslint-disable-line no-console
});

client.on('error', (err) => {
  console.error(`Redis error: ${err}`); // eslint-disable-line no-console
  process.exit(-1);
});

module.exports = client;
