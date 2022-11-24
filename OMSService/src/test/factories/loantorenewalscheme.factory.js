const _ = require('lodash');
const { Types: { ObjectId } } = require('mongoose');

const build = async (options) => _.merge({
  _id: new ObjectId(),
  GLId: 'ABCDEFG',
  scheme: 'testscheme',
  uploadedBy: 'test_User',
  lastUploadedAt: new Date(),
  status: 'ACTIVE',
  timestamps: {
    created: new Date(),
  },
  toObject() {
    return null;
  },
}, options);

module.exports = { build };
