jest.mock('axios');

const axios = require('axios');
const DocsignService = require('../../../api/services/docsign.service');

describe('Docsign service', () => {
  it('calls the send list Digital Sign Providers api', async () => {
    axios.mockImplementation(() => ({ data: { providers: 'test-request' } }));
    await DocsignService.listDigiSignProviders();

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/providers/digital`,
      method: 'GET',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
    });
  });

  it('calls the send list ESign Providers  api', async () => {
    axios.mockImplementation(() => ({ data: { providers: 'test-request' } }));
    await DocsignService.listESignProviders();

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/providers/esign`,
      method: 'GET',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
    });
  });

  it('calls the send list types api', async () => {
    axios.mockImplementation(() => ({ data: { types: 'test-request' } }));
    await DocsignService.listTypes();

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/types`,
      method: 'GET',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
    });
  });

  it('calls the send list requests api', async () => {
    const filters = { data: 'test-params' };

    axios.mockImplementation(() => ({ data: { requests: 'test-request' } }));
    await DocsignService.listRequests(filters);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/requests`,
      method: 'GET',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
      params: filters,
    });
  });

  it('calls the send Create Esign api', async () => {
    const data = { request: 'test-request' };

    axios.mockImplementation(() => ({ data: { request: 'test-request' } }));
    await DocsignService.createESign(data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/requests/esign`,
      method: 'POST',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
      data,
    });
  });

  it('calls the send Create Digisign api', async () => {
    const data = { request: 'test-request' };

    axios.mockImplementation(() => ({ data: { request: 'test-request' } }));
    await DocsignService.createDigiSign(data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/requests/digital`,
      method: 'POST',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
      data,
    });
  });

  it('calls the send Digisign OTP api', async () => {
    const data = { request: 'test-request' };

    axios.mockImplementation(() => ({ data: { request: 'test-request' } }));
    await DocsignService.digiSignOTP('random-id', data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/requests/digital/random-id/otp`,
      method: 'PUT',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
      data,
    });
  });

  it('calls the send verify Digital sign OTP api', async () => {
    const data = { request: 'test-request' };

    axios.mockImplementation(() => ({ data: { request: 'test-request' } }));
    await DocsignService.verifyDigiSign('random-id', data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.DOCSIGN_URI}/api/v1/requests/digital/random-id/verify`,
      method: 'PUT',
      auth: {
        username: process.env.DOCSIGN_CLIENTID,
        password: process.env.DOCSIGN_TOKEN,
      },
      data,
    });
  });
});
