/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
const _ = require('lodash');
const {handleMessage} = require('../../consumers/fileupload');
const { differentialschemefileupload } = require('../../api/utils/constants');
const AWSUtils = require('../../api/utils/AWSUtils');
const FileUploadFactory = require('../factories/fileupload.factory');
const TempFileStore = require('../../api/models/tempfilestore.model');
const FileUpload = require('../../api/models/fileuploadstatus.model');
const LoantoRenewalSchemeMap = require('../../api/models/loantorenewalschememap.model');

jest.mock('../../config/mongoose');
jest.mock('../../api/models/fileuploadstatus.model');
jest.mock('../../api/models/tempfilestore.model');
jest.mock('../../api/utils/AWSUtils');
// jest.mock('sqs-consumer').mockReturnValue({
//   create :  jest.fn({data: "hello"})
// });

jest.mock('sqs-consumer', () => {
  class Consumer {
    static create = jest.fn( () => ({
      on :jest.fn(),
      start :jest.fn()
    }));

  }
  return {
    ...jest.requireActual('sqs-consumer'),
    Consumer,
  };
});

describe('Differential Scheme Consumer', () => {
  jest.spyOn(FileUpload, 'findOne').mockReturnValue(FileUploadFactory.buildEdit({}));
  jest.spyOn(FileUpload, 'findOneAndUpdate')
    .mockImplementation((__, obj) => {
      let updateObj = {};
      _.forEach(obj, (val, key) => {
        const o = key.startsWith('$') ? val : { [key]: val };
        updateObj = _.merge(updateObj, o);
      });
      return FileUploadFactory.buildEdit(updateObj);
    });

  jest.spyOn(TempFileStore, 'findOneAndUpdate')
    .mockImplementation(() => { jest.fn(); });
  jest.spyOn(TempFileStore, 'find')
    .mockReturnValue({
      cursor: jest.fn().mockReturnValue({
        pipe: jest.fn().mockReturnValue({
          pipe: jest.fn().mockReturnValue(),
        }),
      }),
    });
  jest.spyOn(TempFileStore, 'deleteMany').mockImplementation(() => { jest.fn(); });
  jest.spyOn(LoantoRenewalSchemeMap, 'findOneAndUpdate').mockImplementation(() => { jest.fn(); });
  jest.spyOn(AWSUtils, 'uploadToS3').mockReturnValue({
    location: null,
  });

  it('check if the object is correctly getting uploaded to S3', async () => {
    // eslint-disable-next-line global-require
    const messageBody = {
      GLId: 'GLId123',
      scheme: 'scheme123',
      uploadedBy: 'user',
      filename: 'test123',
      lastUploadedAt: new Date().toString(),
    };

    await handleMessage({
      Body: JSON.stringify({
        Message: JSON.stringify({
          batchDataObject: [messageBody],
          type: differentialschemefileupload.actionTypes.edit,
        }),
      }),
    });

    expect(AWSUtils.uploadToS3).toHaveBeenCalled();
  });
});