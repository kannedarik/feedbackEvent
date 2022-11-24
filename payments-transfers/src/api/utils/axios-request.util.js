const axios = require('axios');
const _ = require('lodash');

/**
 * @param method HTTP method to be used for request
 * @param url
 * @param data request body
 * @param headers
 */
exports.axios_request = async (method, url, options) => {
  let response = {};
  try {
    //create request config
    let config = {};
    if (!_.isEmpty(options)) {
      config = {
        data: options.data,
        headers: options.headers,
        params: options.params,
        auth: options.auth,
        httpsAgent: options.agent
      }
    }
    config.method = method;
    response = await axios.request(url, config);
  }
  catch (error) {
    if (error.response) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      response = getErrorObject(error.response);
    }
    //else if (error.request) {
    /*
     * The request was made but no response was received, `error.request`
     * is an instance of XMLHttpRequest in the browser and an instance
     * of http.ClientRequest in Node.js
     */
    //}
    else {
      // Something happened in setting up the request and triggered an Error
      throw error;
    }
  }
  return response;
}

let getErrorObject = async (response) => {
  let errorObject = {};
  errorObject.data = response.data;
  errorObject.status = response.status;
  errorObject.statusText = response.statusText;
  return errorObject;
}
