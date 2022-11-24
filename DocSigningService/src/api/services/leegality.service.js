const { head } = require('lodash');
const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { esign, urls } = require('../../config/vars');

const normalizeData = (response) => {
  const data = response.requests ? head(response.requests) : response.request;
  return {
    trackingid: response.documentId,
    ...(data.signed && {
      signeddocument: head(response.files),
      status: 'success',
    }),
    ...((data.expired || data.rejected || (data.active === false)) && {
      status: 'failure',
      ...(data.error && {
        error: 'error',
      }),
    }),
    ...((data.active && (data.signed === false) && (data.expired === false) && (data.rejected === false)) && { // eslint-disable-line max-len
      status: 'processing',
    }),
  };
};

exports.create = async ({
  endpoint, password, filename, data, name, phone, baseurl, redirecturl,
}) => {
  const options = {
    method: 'POST',
    url: `${endpoint}${urls.leegality.request}`,
    headers: {
      'X-Auth-Token': password,
    },
    data: {
      file: {
        name: filename,
        file: data,
      },
      invitees: [
        {
          name,
          phone,
          fixedName: true,
          enforceAuthentication: false,
          captureLocation: false,
          capturePhoto: false,
          webhook: {
            success: `${urls.webhook.endpoint}${urls.webhook.leegality}`,
            failure: `${urls.webhook.endpoint}${urls.webhook.leegality}`,
            version: 2.1,
          },
          baseUrl: baseurl,
          redirectUrl: redirecturl,
          retry: 3,
          signatures: [
            {
              type: esign.provider,
              config: {
                authTypes: esign.modes,
              },
            },
          ],
        },
      ],
      expiryDays: 0,
    },
  };

  const response = await axios(options);
  if (response.data.status === 1) {
    return {
      trackingid: response.data.data.documentId,
      signurl: head(response.data.data.invitations).signUrl,
    };
  }
  throw new APIError({
    status: httpStatus.INTERNAL_SERVER_ERROR,
    message: (response.data.messages ? head(response.data.messages).message : 'Error'),
  });
};

exports.cancel = async ({ endpoint, password, trackingid }) => {
  const options = {
    method: 'DELETE',
    url: `${endpoint}${urls.leegality.request}`,
    headers: {
      'X-Auth-Token': password,
    },
    params: {
      documentId: trackingid,
    },
  };

  const response = await axios(options);
  if (response.data.status === 1) {
    return true;
  }
  throw new APIError({
    status: (response.data.messages ? head(response.data.messages).code : httpStatus.INTERNAL_SERVER_ERROR), // eslint-disable-line max-len
    message: (response.data.messages ? head(response.data.messages).message : 'Error'),
  });
};

exports.details = async ({ endpoint, password, trackingid }) => {
  const options = {
    method: 'GET',
    url: `${endpoint}${urls.leegality.request}`,
    headers: {
      'X-Auth-Token': password,
    },
    params: {
      documentId: trackingid,
    },
  };

  const response = await axios(options);
  if (response.data.status === 1) {
    return normalizeData(response.data.data);
  }
  throw new APIError({
    status: (response.data.messages ? head(response.data.messages).code : httpStatus.INTERNAL_SERVER_ERROR), // eslint-disable-line max-len
    message: (response.data.messages ? head(response.data.messages).message : 'Error'),
  });
};

exports.webhook = (data) => normalizeData(data);
