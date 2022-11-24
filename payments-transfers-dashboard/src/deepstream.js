import * as deepstream from 'deepstream.io-client-js';
import EventBus from './event-bus';
import constants from './constants';

const ds = deepstream(constants.deepstream.url, {
  subscriptionTimeout: 500000,
})
  .login()
  .on('error', (msg, event, topic) => {
    if (event === 'connectionError') {
      EventBus.$emit('reloadpage');
    }
    throw new Error(`[${event}][${topic}] Error: ${msg}`);
  });

export { ds as default };
