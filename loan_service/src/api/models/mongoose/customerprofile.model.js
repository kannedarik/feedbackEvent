const mongoose = require('mongoose');

const customerprofileSchema = new mongoose.Schema({
  customerproofname: {
    type: String,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
  },
  salutation: {
    type: String,
  },
  occupation: {
    type: String,
  },
  industry: {
    type: String,
  },
  religion: {
    type: String,
  },

  maritalstatus: {
    type: String,
  },

  qualification: {
    type: String,
  },

  annualincome: {
    type: Number,
  },

  fathername: {
    type: String,
  },
  addressparts: {
    type: mongoose.Schema.Types.Mixed,
  },
  secondaryaddressparts: {
    type: mongoose.Schema.Types.Mixed,
  },
  permanentaddress: {
    type: String,
  },
  secondaryaddress: {
    type: String,
  },
  district: {
    type: String,
  },
  state: {
    type: String,
  },
  pin: {
    type: Number,
  },
  homelocation: {
    type: mongoose.Schema.Types.Mixed,
  },
  accountnumber: {
    type: String,
  },
  bank: {
    type: String,
  },
  branch: {
    type: String,
  },
  ifsc: {
    type: String,
  },
  customerpic: {
    type: String,
  },
  cancelledcheque: {
    type: String,
  },
  pan: {
    type: String,
  },
  panpicture: {
    type: String,
  },
  panbackpicture: {
    type: String,
  },
  panverified: {
    type: Boolean,
  },
  dl: {
    type: String,
  },
  dlpicture: {
    type: String,
  },
  dlbackpicture: {
    type: String,
  },
  dlverified: {
    type: Boolean,
  },
  aadhar: {
    type: String,
  },
  aadharpic: {
    type: String,
  },
  aadharbackpic: {
    type: String,
  },
  aadharverified: {
    type: Boolean,
  },
  aadhardata: {
    type: mongoose.Schema.Types.Mixed,
  },
  passport: {
    type: String,
  },
  passportpic: {
    type: String,
  },
  passportbackpic: {
    type: String,
  },
  passportverified: {
    type: Boolean,
  },
  voterid: {
    type: String,
  },
  voteridpic: {
    type: String,
  },
  voteridbackpic: {
    type: String,
  },
  voteridverified: {
    type: Boolean,
  },
  localproof: {
    type: String,
  },
  localproofpicture: {
    type: String,
  },
  localproofbackpicture: {
    type: String,
  },
  localproofverified: {
    type: Boolean,
  },
  localproofsec: {
    type: String,
  },
  localproofpicturesec: {
    type: String,
  },
  localproofbackpicturesec: {
    type: String,
  },
  localproofsecverified: {
    type: Boolean,
  },
  lpcustomerdetails: {
    type: mongoose.Schema.Types.Mixed,
  },
  repeat: {
    type: Boolean,
  },
  fingerprints: {
    type: Array,
  },
  biometricscollected: {
    type: Boolean,
  },
  ekyccollected: {
    type: Boolean,
  },
  lpinfo: {
    type: Array,
  },
}, {
  collection: 'customerprofile',
});

customerprofileSchema.set('toObject', { getters: true });
customerprofileSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('CustomerProfile', customerprofileSchema);
