module.exports = {
  regexValues: {
    hexadecimal: /^[a-fA-F0-9]{24}$/,
  },
  notificationProviderMap: {
    call: 'notification/push',
    sms: 'notification/sms',
  },
  coreSigningMethodMap: {
    digital: 'otp',
    '2fa': 'otp',
    esign: 'esign',
    physical: 'manual',
  },
  coreSigningStatusMap: {
    pending: 'initiated',
    success: 'success',
    failure: 'failure',
  },
  paymentSigningMethodMap: {
    digital: 'OTP',
    '2fa': 'OTP',
    esign: 'ESIGN',
    physical: 'OFFLINE',
  },
  paymentType: {
    renewal: 'repledge',
  },
  paymentMethod: {
    name: 'razorpay',
  },
  paymentLoanStatus: {
    open: 1,
    close: 5,
  },
  OTPLimit: 5,
  aadharVerification: {
    expirytime: 15,
    verified: 'Valid Aadhar Number',
    notverified: 'Invalid Aadhar Number',
  },
  razorpayAllowedEvents: [
    'payment.captured',
    'payment.failed',
  ],
  razorpayStatusMap: {
    'payment.captured': 'success',
    'payment.failed': 'failure',
  },
  unsecuredLender: 'rupeek',
  loantypemapping: {
    'N:1': 'N:1 with top up',
    'N:0': 'N:1 without top up',
    '1:1': '1:1 with top up',
    '1:0': '1:1 without top up',
    KGL: 'KGL',
  },
  telegram: {
    dev: '-1001063748362',
    support: '-1001064660883',
  },
  zohodesk: {
    techsupport: '398609000000221735',
    paymentsupport: '398609000000138205',
    backoffice: '398609000000206231',
  },
  ticket: {
    renewal: {
      techsupport: ['398609000000429083'],
      paymentsupport: ['398609000001746049', '398609000000297057'],
      backoffice: ['398609000022570347', '398609000000296365'],
    },
  },
  email: {
    renewal: {
      dev: {
        email: 'dhananjay.pathak@rupeek.com',
        cc: [
          'satya.rao@rupeek.com',
          'ankur.mazumder@rupeek.com',
          'abhinav.guleria@rupeek.com',
          'kanchi.sravanti@rupeek.com',
          'haripriya.trimbaki.cn@rupeek.com',
          'Mohit.Pandey@rupeek.com',
        ],
      },
      prod: {
        email: 'payment-alerts@rupeek.com',
        cc: [
          'support@rupeek.com',
        ],
      },
    },
  },
  slack: {
    default: 'C01GEB14JLT',
    production: 'G01GSSTRDS5',
  },
  repledgeType: {
    ENHANCE: 'ENHANCE',
    NONENHANCE: 'NONENHANCE',
    OUTSTANDING: 'OUTSTANDING',
    LOAN_ENHANCEMENT: 'LOAN_ENHANCEMENT',
  },
  charges: [
    {
      name: 'processingfee',
      type: 'processing-fee',
    },
  ],
  smsType: {
    SMS: 'sms',
    CALL: 'call',
  },
  accountVerification: {
    maxAccounEntryAttempts: 3,
    maxOtpRetriesPerAccount: 5,
  },
  mrs_verification_status_mapping: {
    verification_pending: {
      accountVerified: false, otpVerified: false, otpSent: false,
    },
    verification_failed: {
      accountVerified: false, otpVerified: false, otpSent: false,
    },
    verification_successful: {
      accountVerified: true, otpVerified: true, otpSent: true,
    },
    otp_sent: {
      accountVerified: true, otpVerified: false, otpSent: true,
    },
    otp_sending_failed: {
      accountVerified: true, otpVerified: false, otpSent: false,
    },
    otp_verified_successfully: {
      accountVerified: true, otpVerified: true, otpSent: true,
    },
    otp_verification_failed: {
      accountVerified: false, otpVerified: false, otpSent: true,
    },
  },
  caseCreationDetails: {
    partReleaseProcessType: 'partRelease',
    partPaymentProcessType: 'partPayment',
    productCategory: 'Gold Loan',
    oldGL: true,
  },
  workflowIds: {
    partrelease: {
      confirmSlot: 'partrelease-slot-confirmation-flow',
      caseCreation: 'part-release-case-creation',
    },
  },
  loanApplication: {
    loanType: 'FRESH',
    systemSource: 'salesforce',
    transactionPlaceType: 'DOOR_STEP',
  },
  loantype: {
    NON_KGL: '1:1',
    KGL: '1:0',
    secure: 'secure',
    unsecure: 'unsecure',
  },
  notification: {
    provider: {
      sms: {
        kaleyra: 'kaleyra',
        twofactor: 'twofactor',
      },
    },
  },
  lenderNameMapping: {
    federal: 'FEDBANK',
    kvb: 'KVBBANK',
    icici: 'ICICI BANK',
  },
  interest: {
    calculationType: {
      flat: 'flat',
      jumping: 'jumping',
      monthly: 'monthly',
    },
    type: {
      simple: 'simple',
      compounding: 'compounding',
    },
  },
  featureFlag: {
    renewalAutomation: 'fed:automation',
    renewalAutomationv2: 'federal:automationv2',
    fed2fa: 'fed:2fa',
  },
  redis: {
    countLimit: '1000',
  },
  tenureExtensionEnabledLenders: ['icici'],
  lenderSlugParser: {
    icici: 'icici-bank',
  },
  differentialScheme: {
    download: {
      loanToSchemeHeaders: ['GLId', 'scheme', 'uploadedBy', 'lastUploadedAt'],
      limit: 500,
    },
  },
  loantoschememap: {
    status: {
      active: 'ACTIVE',
      inactive: 'INACTIVE',
    },
  },
  differentialschemefileupload: {
    chunkSize: 10,
    fileUploadRowLimit: 1000,
    actionTypes: {
      edit: 'differentialSchemeActivation',
      delete: 'differentialSchemeDeactivation',
    },
    status: {
      created: 'CREATED',
      processing: 'PROCESSING',
      processed: 'PROCESSED',
    },
  },
  sqs: {
    differentialSchemaValidation: {
      differentialSchemeActivation: [
        {
          headername: 'GLId',
          validation: /^[a-zA-Z0-9]+$/,
          required: true,
        },
        {
          headername: 'scheme',
          validation: /^[a-zA-Z0-9]+$/,
          required: true,
        },
        {
          headername: 'uploadedBy',
          validation: /^[a-zA-Z0-9]+$/,
          required: true,
        },
        {
          headername: 'filename',
          validation: /.+/,
          required: true,
        },
        {
          headername: 'lastUploadedAt',
          validation: /\d\d_\d\d_\d\d_\d\d_\d\d_\d\d/,
          required: true,
        },
      ],
      differentialSchemeDeactivation: [
        {
          headername: 'GLId',
          validation: /^[a-zA-Z0-9]+$/,
          required: true,
        },
        {
          headername: 'uploadedBy',
          validation: /^[a-zA-Z0-9]+$/,
          required: true,
        },
        {
          headername: 'filename',
          validation: /.+/,
          required: true,
        },
        {
          headername: 'lastUploadedAt',
          validation: /\d\d_\d\d_\d\d_\d\d_\d\d_\d\d/,
          required: true,
        },
      ],
    },
  },
  tempFileStore: {
    excludeFeilds: ['_id', '__v', 'filename'],
    status: {
      success: 'SUCCESS',
      failure: 'FAILURE',
    },
  },
  iciciRenewal: {
    renewalLetter: {
      correlationId: 'icici',
    },
    lenderSlug: ['icici', 'icici-bank'],
  },
  fed2fa: {
    fedSecureClosingAmountLimit: 200000,
  },
  accountsSecureLenderList: ['federal', 'kvb'],
  defaultActiveOrderStatus: ['pending', 'processing'],
};
