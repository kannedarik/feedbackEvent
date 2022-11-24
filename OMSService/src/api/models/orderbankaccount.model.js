const mongoose = require('mongoose');
const Constants = require('../utils/constants');

const MAX_ACCOUNT_ENTRY_ATTEMPTS = Constants.accountVerification.maxAccounEntryAttempts;
const MAX_OTP_VERIFICATION_RETRY_ATTEMPTS = Constants.accountVerification.maxOtpRetriesPerAccount;

const orderBankAccountSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  retryCount: {
    type: Number,
    required: true,
  },
  verificationStatus: {
    type: String,
    required: true,
  },
  otpVerified: Boolean,
  accountVerified: Boolean,
  statusUpdatedAt: Date,
  accountEntryAttempts: Number,
  latestAccountEntryAt: Date,
}, {
  timestamps: true,
});

// eslint-disable-next-line func-names
orderBankAccountSchema.virtual('pendingOtpRetryAttempts').get(function () {
  return MAX_OTP_VERIFICATION_RETRY_ATTEMPTS - this.retryCount;
});

// eslint-disable-next-line func-names
orderBankAccountSchema.virtual('pendingAccountEntryAttempts').get(function () {
  return MAX_ACCOUNT_ENTRY_ATTEMPTS - (this.accountEntryAttempts || 0);
});

module.exports = mongoose.model('OrderBankAccount', orderBankAccountSchema);
