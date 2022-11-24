const mongoose = require('mongoose');

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
  },
  lastname: {
    type: String,
    required: false,
    maxlength: 30,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 20,
  },
  userslug: {
    type: String,
    minLength: 1,
    maxLength: 15,
  },
  password: {
    type: String,
    required: false,
  },
  langpref: {
    type: String,
    required: true,
    maxLength: 5,
    defaultsTo: 'en',
  },
  roles: {
    type: mongoose.Schema.Types.Mixed,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },
  phones: {
    type: [String],
    required: false,
  },
  phonevertoken: {
    type: String,
    maxlength: 8,
  },
  lenderportalvertoken: {
    type: String,
    maxlength: 8,
  },
  archived: {
    type: Boolean,
    required: true,
    default: false,
  },
  picid: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 36,
    default: 'default',
    get: key => (key ? `https://s3.amazonaws.com/rupeek.img/${key}-big.jpg` : undefined),
  },
  cityid: {
    type: Number,
  },
  bankerof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LendingPartner',
  },
  managerof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LendingBranch',
  },
  agentprofile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentProfile',
  },
  customerprofile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerProfile',
  },
}, {
  collection: 'user',
});

userSchema.set('toObject', { getters: true });
userSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('User', userSchema);
