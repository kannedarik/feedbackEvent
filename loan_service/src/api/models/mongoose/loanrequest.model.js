/* eslint-disable func-names */
const mongoose = require('mongoose');


/**
 * Loan Request Schema
 * @private
 */
const loanRequestScheme = new mongoose.Schema({
  loantitle: {
    type: String,
    required: true,
  },
  referencenumber: {
    type: String,
    unique: true,
    required: true,
  },
  requestedamount: {
    type: Number,
  },
  city: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    maxlength: 250,
  },
  exceptionnotes: {
    type: Array,
  },
  // address as entered by support team
  address: {
    type: String,
  },
  //   collect at time of request
  addressObj: {
    type: mongoose.Schema.Types.Mixed,
  },
  // addressparts - collected from ISE / reaper
  addressparts: {
    type: mongoose.Schema.Types.Mixed,
  },
  // collected by support team, locality to be shown to agent
  locality: {
    type: String,
  },
  locationsource: {
    type: String,
  },
  // timeslots as requested by customer / entered by support
  timeslotstart: {
    type: Date,
  },
  timeslotend: {
    type: Date,
  },
  tranxmode: {
    type: String,
  },
  // agent time logging
  agentpicked: {
    type: Date,
  },
  agentarrived: {
    type: Date,
  },
  kycuploaded: {
    type: Date,
  },
  appraisalended: {
    type: Date,
  },
  checkouttime: {
    type: Date,
  },
  cashtransferred: {
    type: Date,
  },
  archived: {
    type: Date,
  },
  releaseetd: {
    type: Date,
  },
  // statuscode - represents state of the loan
  statuscode: {
    type: Number,
    required: true,
  },
  // four digit code sent to customer to authenticate the agent
  agentvercode: {
    type: String,
  },
  // total appraisal weight of all the loans
  appraisaltotalwt: {
    type: Number,
  },
  // total deductions done for all loans
  appraisalstonewt: {
    type: Number,
  },
  // total appraisal adjustements - haircut, karat penalty etc
  appraisaladjustmentwt: {
    type: Number,
  },
  // net weight of all loans put together
  appraisaleligiblewt: {
    type: Number,
  },
  // total loan amount given to customer
  appraisedworth: {
    type: Number,
  },
  // initailly arrived at amount, which was overriden by agent
  agentoverridenamount: {
    type: Number,
  },
  // initally sanctioned amount, overriden by admin
  adminoverridenamount: {
    type: Number,
  },
  // customer can also intervene - deprecated
  customerrequestedamount: {
    type: Number,
  },
  // customer can change the jewel details - deprecated
  customeroverride: {
    type: Boolean,
    required: true,
  },
  // customer packetno - deprecated
  packserialno: {
    type: String,
    required: false,
  },
  // interest rate of the loan / scheme seleceted - deprecated, refer loans array
  interestrate: {
    type: Number,
  },

  // server generated image that has to be printed
  printerpledgecardimage: {
    type: String,
  },
  // whether this particular transaction used biometric authentication
  aadhaarverified: {
    type: Boolean,
    required: true,
  },
  // whether this transaction was requested by customer from app
  appusage: {
    type: Boolean,
    required: true,
  },
  logisticspackno: {
    type: String,
  },
  logisticsrno: {
    type: String,
  },
  feedback: {
    type: Number,
  },
  // feedback parameters given by the customer
  feedbackparams: {
    type: mongoose.Schema.Types.Mixed,
  },
  feedbacktext: {
    type: String,
  },
  // gross weight check before the appraisal happens
  grossweightscope: {
    type: mongoose.Schema.Types.Mixed,
  },
  // deprecated, see loans array for details
  lploanid: {
    type: String,
  },
  // amount transfer code
  cashtransfercode: {
    type: String,
  },
  // admin notes saved during approval
  adminnotes: {
    type: String,
  },
  // lender notes saved during amount transfer
  lendernotes: {
    type: String,
  },
  archivenotes: {
    type: String,
  },
  // archivereason when archiving the request
  archivereason: {
    type: String,
  },
  // incident type
  incident: {
    type: String,
  },
  // incident notes
  incidentnotes: {
    type: String,
  },
  travelallowance: {
    type: Number,
  },
  packetScanActionAt: {
    type: Number,
  },
  // new datatypes for splitting the loans
  // array contains - amount, interestrate, jewels, loanid,
  // printerpledgecardimage, releasedate
  loans: {
    type: Array,
  },
  uloans: {
    type: Array,
  },
  // new datatype to keep track of releases
  releases: {
    type: Array,
  },
  releasepics: {
    type: mongoose.Schema.Types.Mixed,
  },
  maxloanid: {
    type: Number,
  },
  incidents: {
    type: Array,
  },
  // smartdna integtration - assetid of the packet to be tracked
  assetid: {
    type: String,
    maxlength: 36,
  },
  // takeover data
  // smart dna post takeover
  topacket: {
    type: String,
  },
  topledgecard: {
    type: String,
  },
  takeoveragreementpics: {
    type: Array,
  },
  takeoverchequepic: {
    type: String,
  },
  takeoverreceiptpic: {
    type: String,
  },
  takeoverpacketpic: {
    type: String,
  },
  takeoverpacketbackpic: {
    type: String,
  },
  loanParcelImages: {
    type: Array,
  },
  // lending partner integrations
  lpsynced: {
    type: Boolean,
    required: true,
  },
  // todo - schema migration for old timestamps
  timestamps: {
    type: mongoose.Schema.Types.Mixed,
  },
  flags: {
    type: mongoose.Schema.Types.Mixed,
  },
  lendingpartner: {
    type: mongoose.Schema.Types.Mixed,
  },
  // associations
  requester: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  assignedagent: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  appraiser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  auditor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  releasechecker: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  releaseagent: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  releasesec: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  releaseter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  // support - location save
  supportexec: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  cashtransferapprovedby: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  archivedby: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  repledgehistory: {
    type: Array,
  },
  maxjewelclub: {
    type: Number,
  },
  // Array containing details of transactions for a loan
  // Each object has following fields
  // type(Fresh, TO, EP, Recovery), mode(cash, Wire)
  // UTR, amount, comments, updatedBy, timestamps
  transactiondetails: {
    type: Array,
  },
}, {
  collection: 'loanrequest',
});

/**
 * Virtuals
 */
loanRequestScheme.virtual('pledgedjewel', {
  ref: 'Pledgedjewel', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'pledgedin', // is equal to `foreignField`
  // If `justOne` is true, 'events' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
});

module.exports = mongoose.model('LoanRequest', loanRequestScheme);
