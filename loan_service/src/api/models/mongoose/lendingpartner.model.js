const mongoose = require('mongoose');

/**
 * LendingPartner Schema
 * @private
 */
const lendingPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  schemes: {
    type: Array,
  },
  goldrate: {
    type: String,
    enum: ['agloc', 'ibja'],
  },
  picture: {
    type: String,
  },
  maxloanid: {
    type: Number,
  },
  maxcustomerid: {
    type: Number,
  },
  bankdetails: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  collection: 'lendingpartner',
});

module.exports = mongoose.model('LendingPartner', lendingPartnerSchema);
