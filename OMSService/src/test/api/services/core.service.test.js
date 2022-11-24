jest.mock('axios');

const axios = require('axios');
const CoreService = require('../../../api/services/core.service');

describe('Core service client', () => {
  it('calls the send lender notification api with give core ids', async () => {
    const token = 'token';
    const coreIDs = ['foo', 'bar'];
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.sendLenderNotification(token, coreIDs);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v2/repledge/sendlendernotif`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data: {
        loanids: coreIDs,
      },
    });
  });

  it('calls the get customer profile api', async () => {
    const token = 'token';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.getCustomerProfile(token, 'random');

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/getcustomerprofile/?userid=random`,
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
  });

  it('calls the get lenders info api', async () => {
    axios.mockImplementation(() => ({
      data: {
        lendingpartners: {
          id: 'test-id', name: 'test-name', slug: 'test-slug', branches: ['1', '2', '3'],
        },
      },
    }));

    await CoreService.getLenders();

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/public/getlenderinfo`,
      method: 'GET',
    });
  });

  it('calls the get new loan details api with give core ids', async () => {
    const token = 'token';
    const data = { scheme: 'test-scheme', loans: 'test-renewal-loans' };
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.getNewLoans(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/getnewloan`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });
  it('calls the get new loan version 4 details api with give core ids', async () => {
    const token = 'token';
    const data = { scheme: 'test-scheme', loans: 'test-renewal-loans' };
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.getNewLoansVersion4(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v4/repledge/getnewloan`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });
  it('calls the get new loan details version 5 api with give core ids', async () => {
    const token = 'token';
    const data = { scheme: 'test-scheme', loans: 'test-renewal-loans' };
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.getNewLoansVersion5(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v5/repledge/getnewloan`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the renew loan details api', async () => {
    const token = 'token';
    const data = {
      loandetails: 'test-loandetails', signstatus: 'test-signstatus', signtype: 'test-signtype', orderrefno: 'test-orderrefno', tenureextension: 'test_tenure extension',
    };

    axios.mockImplementation(() => ({ data: null }));

    await CoreService.renewLoans(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/create`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the renew loan version 4 api', async () => {
    const token = 'token';
    const data = {
      loandetails: 'test-loandetails', signstatus: 'test-signstatus', signtype: 'test-signtype', orderrefno: 'test-orderrefno', tenureextension: 'test_tenure extension',
    };
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.renewLoansVersion4(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v4/repledge/create`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the generate Physical PC API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.generatePhysicalPC(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/generatepcs`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the generate signed pc API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.generateSignedDigiPC(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/generatesignedpc`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the generate signed pc API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.generateUnSignedEPC(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/generateunsignedpc`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });
  it('calls the generate summary PC API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.generateSummaryPC(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/summary`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the view UnSigned PC API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.viewUnSignedPC(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/generateviewpc`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the update Renewal Status API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.updateRenewalStatus(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/updatestatus`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });

  it('calls the get Signed PC API', async () => {
    const token = 'token';
    const params = { refno: 'test-orderid' };
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.getSignedPC(token, params.refno);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v3/repledge/getsignedpc`,
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`,
      },
      params,
    });
  });

  it('calls the Loan Enhancement Options', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.loanEnhancementOptions(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v1/repledge/loanEnhancementOptions`,
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });
  it('calls the restore Loans API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: null }));

    await CoreService.restoreLoans(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v1/repledge/revert`,
      method: 'PATCH',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });
  it('calls the clean History API', async () => {
    const token = 'token';
    const data = 'test-data';
    axios.mockImplementation(() => ({ data: { response: 'test-response' } }));

    await CoreService.cleanHistory(token, data);

    expect(axios).toHaveBeenCalledWith({
      url: `${process.env.CORE_URI}/api/v1/repledge/history/clean`,
      method: 'PATCH',
      headers: {
        Authorization: `JWT ${token}`,
      },
      data,
    });
  });
});
