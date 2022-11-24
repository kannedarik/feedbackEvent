const mongoose = require('mongoose');

/**
 * LendingBranch Schema
 * @private
 */
const lendingBranchSchema = new mongoose.Schema({
  branchname: {
    type: String,
  },
  address: {
    type: String,
  },
  locality: {
    type: String,
  },
  city: {
    type: String,
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
  },
  emails: {
    type: Array,
  },
  branchof: {
    type: mongoose.Schema.ObjectId,
    ref: 'LendingPartner',
  },
}, {
  collection: 'lendingbranch',
});

module.exports = mongoose.model('LendingBranch', lendingBranchSchema);
