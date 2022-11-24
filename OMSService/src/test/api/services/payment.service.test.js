jest.mock('axios');

const axios = require('axios');
const PaymentService = require('../../../api/services/payment.service');

jest.mock('../../../api/utils/helper.js', () => ({
  getBasicAuthString: () => ('test-AuthString'),
}));

describe('Payment service client', () => {
  it('calls the get Payments Option Api', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await PaymentService.getPaymentOptions(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/getPaymentOptions`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the get Payment Link Api', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: 'test-response' }));

    const response = await PaymentService.getPaymentLink(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/getpaymentlink`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
    expect(response).toBe('test-response');
  });

  it('calls the get get Payment Status Api', async () => {
    const token = 'token';
    const params = { requestid: 'test-data' };
    axios.mockImplementation(() => ({ data: null }));

    await PaymentService.getPaymentStatus(token, 'test-data');

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/payment/status`,
      method: 'GET',
      headers: {
        Authorization: 'JWT test',
      },
      params,
    });
  });

  it('calls the create Renewal Van Api', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: 'test-response' }));

    const response = await PaymentService.createRenewalVan(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/createRenewalVan`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
    expect(response).toBe('test-response');
  });

  it('calls the get Payments Option Api', async () => {
    const token = 'token';
    const data = 'test-data';

    await PaymentService.updateLoanStatus(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/admin/updatestatusofloan`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the get Payments Option Api', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: 'test-response' }));

    const response = await PaymentService.updateCurrentSlab(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/support/updateCurrentSlab`,
      method: 'PUT',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
    expect(response).toBe('test-response');
  });

  it('calls the reset Current Slab Api', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: 'test-response' }));

    const response = await PaymentService.resetCurrentSlab(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/support/resetCurrentSlab`,
      method: 'PUT',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
    expect(response).toBe('test-response');
  });

  it('calls the restore Payment Data Api', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: 'test-response' }));

    const response = await PaymentService.restorePaymentData(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/renewal/revert`,
      method: 'PATCH',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
    expect(response).toBe('test-response');
  });

  it('calls the fetch Loan Payment Data Api', async () => {
    const params = 'test-params';
    axios.mockImplementation(() => ({ data: 'test-response' }));

    const response = await PaymentService.fetchLoanPaymentData(params);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.PAYMENT_URI}/api/v1/partrelease/loanpaymentdata`,
      method: 'GET',
      headers: {
        Authorization: 'test-AuthString',
      },
      params,
    });
    expect(response).toBe('test-response');
  });
});
