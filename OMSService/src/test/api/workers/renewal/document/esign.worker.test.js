const esignworker = require('../../../../../api/workers/renewal/document/esign.worker');
const OrderDocSigning = require('../../../../../api/models/orderdocsigning.model');
const DocSignService = require('../../../../../api/services/docsign.service');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    signingrequests: [{ otp: 123 }],
    unsecuredlender: 'rupeek',
  },
  OrderDocSigning_response: [
    {
      requestId: '5f7bfd8001212e22f23cbee0',
    },
    {
      requestId: '5f7bfd8001212e22f23cbee1',
    },
  ],
  DocSignService_response: [
    {
      _id: '5f7bfd8001212e22f23cbee0',
      custom: {
        lender: 'federal',
      },
      signeddocument: {
        id: '5f7bfdefb6e2b6525e2aa150',
        path: '6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
        url: 'https://s3.amazonaws.com/rupeek.qrcimg/6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
      },
    },
    {
      _id: '5f7bfd8001212e22f23cbee1',
      custom: {
        lender: 'rupeek',
      },
      signeddocument: {
        id: '5f7bfdefb6e2b6525e2aa150',
        path: 'unsecure-6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
        url: 'https://s3.amazonaws.com/rupeek.qrcimg/6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
      },
    },
  ],
  response: {
    secure_path: '6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
    secure_url: 'https://s3.amazonaws.com/rupeek.qrcimg/6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
    unsecure_path: 'unsecure-6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
    unsecure_url: 'https://s3.amazonaws.com/rupeek.qrcimg/6dc6748f-5dc0-4b7b-8f13-0f80ffb5f49f.pdf',
  },
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe('esign worker suits', () => {
  beforeAll(() => {
    const mock1 = jest.spyOn(OrderDocSigning, 'find');
    mock1.mockReturnValue(job.OrderDocSigning_response);

    const mock2 = jest.spyOn(DocSignService, 'listRequests');
    mock2.mockReturnValue(job.DocSignService_response);

    mock1.mockReturnValue({});

    const MockHandler = jest.spyOn(ErrorHandler, 'captureWFError');
    MockHandler.mockReturnValue({});
  });

  it('whether url and path returned or not', async () => {
    await esignworker()
      .taskHandler(
        job,
      );
  });
});
