const ds = require('deepstream.io-client-js');
const { deepstream } = require('./vars');

const client = ds(deepstream.url, {
  subscriptionTimeout: 500000,
}).login();

client.on('error', (msg, event, topic) => {
  console.error(`[${event}][${topic}]  Deepstream Error: ${msg}`);
});

module.exports = client;
