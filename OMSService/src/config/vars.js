const path = require('path');
const appPackage = require('../../package');

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  appName: appPackage.name,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  secretkey: process.env.SECRET_KEY,
  newRelicKey: process.env.NEW_RELIC,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  services: {
    rupeek: {
      endpoint: process.env.RUPEEK_URI,
      jwtvalidate: '/api/account/jwtvalidate',
      fetchActiveTransaction: '/api/citymgr/fetchactivetraxbyid',
      createLoanRequest: '/api/v2/support/createsupportqueue',
      markLoanForPartrelease: '/api/admin/markloansforpartrelease',
      resetTransactionStatus: '/api/v2/support/approverequest',
    },
    FeedbackService: {    
      createFeedbackEvent: '/api/v1/pr/feedback/event',
      getFeedbackForms: '/api/v1/pr/feedback/form',  
    },
    aaa: {
      endpoint: process.env.AAA_URI,
      jwtvalidate: '/api/v1/auth/jwtvalidate',
    },
    masterdata: {
      endpoint: process.env.MASTER_DATA_URI,
      getCities: '/api/v1/cities',
    },
    core: {
      auth: {
        username: process.env.CORE_AUTH_USERNAME,
        password: process.env.CORE_AUTH_PASSWORD,
      },
      bypassKongEndpoint: process.env.CORE_DIRECT_URI,
      endpoint: process.env.CORE_URI,
      getLenderInfo: '/api/public/getlenderinfo',
      getNewLoans: '/api/v3/repledge/getnewloan',
      getNewLoansV4: '/api/v4/repledge/getnewloan',
      getNewLoansV5: '/api/v5/repledge/getnewloan',
      renewLoans: '/api/v3/repledge/create',
      renewLoansV4: '/api/v4/repledge/create',
      generatePhysicalPC: '/api/v3/repledge/generatepcs',
      generateSignedDigiPC: '/api/v3/repledge/generatesignedpc',
      generateUnSignedEPC: '/api/v3/repledge/generateunsignedpc',
      generateSummaryPC: '/api/v3/repledge/summary',
      viewUnSignedPC: '/api/v3/repledge/generateviewpc',
      updateRenewalStatus: '/api/v3/repledge/updatestatus',
      getSignedPC: '/api/v3/repledge/getsignedpc',
      loanEnhancementOptions: '/api/v1/repledge/loanEnhancementOptions',
      restoreLoans: '/api/v1/repledge/revert',
      loanrequests: '/api/v1/partrelease/loanrequest',
      cleanHistory: '/api/v1/repledge/history/clean',
      sendLenderNotification: '/api/v2/repledge/sendlendernotif',
      getcustomerprofile: '/api/v3/repledge/getcustomerprofile',
      supportmaploansV5: '/api/v5/repledge/maploanssupport',
    },
    las: {
      endpoint: process.env.LAS_URI,
      create: '/v1/loan-application/partReleaseLoan/',
    },
    insight: {
      endpoint: process.env.INSIGHT_URI,
      confirmSlot: '/api/v1/slots/:id/confirm',
    },
    docsign: {
      endpoint: process.env.DOCSIGN_URI,
      credentials: {
        client: process.env.DOCSIGN_CLIENTID,
        token: process.env.DOCSIGN_TOKEN,
      },
      listProviders: {
        digiSign: '/api/v1/providers/digital',
        eSign: '/api/v1/providers/esign',
      },
      listTypes: '/api/v1/types',
      digiSignRequest: '/api/v1/requests/digital',
      eSignRequest: '/api/v1/requests/esign',
      signRequest: '/api/v1/requests',
    },
    money_routing: {
      endpoint: process.env.MONEY_ROUTING_URI,
      credentials: {
        username: process.env.MONEY_ROUTING_CLIENT_USERNAME,
        password: process.env.MONEY_ROUTING_CLIENT_PASSWORD,
      },
      listBankAccounts: '/api/v1/cust-bank-account',
      initiatePennyTesting: '/api/v1/account-verification/init',
      resendOTP: '/api/v1/account-verification/otp/resend',
      verifyOTP: '/api/v1/account-verification/otp/verification',
      transactionStatus: '/api/v1/account-verification/status/',
    },
    notification: {
      endpoint: process.env.NOTIFY_URI,
      credentials: {
        client: process.env.NOTIFY_CLIENTID,
        token: process.env.NOTIFY_TOKEN,
      },
      listCategories: '/api/v1/categories',
      listProviders: '/api/v1/providers',
      listTemplates: '/api/v1/templates',
      listTypes: '/api/v1/types',
      sendEmail: '/api/v1/notifications/email',
      sendPush: '/api/v1/notifications/push',
      sendSMS: '/api/v1/notifications/sms',
      sendTicket: '/api/v1/notifications/ticket',
      partPaymentCaseCreation: '/api/v1/notification/',
      notificationDetails: '/api/v1/notifications',
      status: {
        success: 'success',
        failure: 'failure',
      },
    },
    support: {
      endpoint: process.env.SUPPORT_URI,
      credentials: {
        client: process.env.SUPPORT_CLIENTID,
        token: process.env.SUPPORT_TOKEN,
      },
      ticket: '/api/v1/ticket',
      notifyOnSlotConfirmation: '/api/v1/ticket/partrelease/slot/notify',
    },
    payment: {
      auth: {
        username: process.env.PAYMENT_AUTH_USERNAME,
        password: process.env.PAYMENT_AUTH_PASSWORD,
      },
      bypassKongEndpoint: process.env.PAYMENTS_DIRECT_URI,
      endpoint: process.env.PAYMENT_URI,
      getPaymentOptions: '/api/getPaymentOptions',
      getPaymentLink: '/api/getpaymentlink',
      getPaymentStatus: '/api/payment/status',
      createRenewalVan: '/api/createRenewalVan',
      updateLoanStatus: '/api/admin/updatestatusofloan',
      updateCurrentSlab: '/api/support/updateCurrentSlab',
      restorePaymentData: '/api/renewal/revert',
      fetchLoanPaymentData: '/api/v1/partrelease/loanpaymentdata',
      checkRazorpayPaymentStatus: '/api/razorpay/paymentdetails',
      resetCurrentSlab: '/api/support/resetCurrentSlab',
    },
    account: {
      endpoint: process.env.ACCOUNT_URI,
      updateloanstatus: '/api/loan',
    },
    portal: {
      endpoint: process.env.PORTAL_URI,
      esign: '/esign-status',
      otp: '/otp-verification',
    },
    webhook: {
      endpoint: process.env.WEBHOOK_URI,
      docsign: '/api/v1/oms/docsign',
    },
    zeebe: {
      uiendpoint: process.env.ZEEBE_UI,
      endpoint: process.env.ZEEBE_ADDRESS,
      port: process.env.ZEEBE_GATEWAY_PORT,
    },
    orion: {
      baseURI: process.env.ORION_URI,
      renewRCPLLoanPath: '/api/v1/renewal/rcplloan',
      closeRCPLLoanPath: '/api/v1/repayment/rcpl',
      clientID: process.env.ORION_CLIENT_ID,
      password: process.env.ORION_TOKEN,
    },
    lendingMDS: {
      endpoint: process.env.LENDING_MDS_URI,
      username: process.env.LENDING_MDS_USERNAME,
      password: process.env.LENDING_MDS_PASSWORD,
      getBranchByCoreID: '/api/v1/lendingBranches',
      operation: 'BRANCH_WALKIN',
    },
    mis: {
      credentials: {
        clientID: process.env.MIS_CLIENT_ID,
        token: process.env.MIS_TOKEN,
      },
      endpoint: process.env.MIS_URI,
      getCustomerDetails: '/api/renewal/getcustomerdetails',
    },
    kyc: {
      xClientId: process.env.KYC_CLIENT_ID,
      endpoint: process.env.KYC_URI,
      customer: '/api/v1/kyc/customer',
      validateAadharLast4Digits: '/validateAadharLast4Digits',
    },
  },
  redis: {
    endpoint: process.env.REDIS_URI,
    port: process.env.REDIS_PORT,
    key: {
      docsign: {
        digiSignProviders: 'oms:sign:digisignproviders',
        eSignProviders: 'oms:sign:esignproviders',
        types: 'oms:sign:types',
      },
      notification: {
        categories: 'oms:notify:categories',
        providers: 'oms:notify:providers',
        templates: 'oms:notify:templates',
        types: 'oms:notify:types',
      },
      core: {
        lenders: 'oms:core:lenders',
        cities: 'oms:core:cities',
      }
    },
    expiry: {
      docsign: process.env.REDIS_DOCSIGN_EXPIRATION_MINUTES,
      notification: process.env.REDIS_NOTIFY_EXPIRATION_MINUTES,
      core: process.env.REDIS_CORE_EXPIRATION_MINUTES,
      payment: process.env.REDIS_PAYMENT_EXPIRATION_SECONDS,
    },
  },
  SNS: {
    bulkFileUploadSNSurl: process.env.BULK_FILE_UPLOAD_SNS,
    region: 'ap-south-1',
  },
  sqs: {
    docsign: process.env.DOCSIGN_QUEUE,
    payment: process.env.PAYMENT_QUEUE,
    misRecords: process.env.MIS_RECORDS_QUEUE,
    partpayment: process.env.PART_PAYMENT_QUEUE,
    bulkfileupload: process.env.BULK_FILE_UPLOAD_SQS,
    loanevent: process.env.LOAN_EVENT_QUEUE,
  },
  firebase: {
    key: process.env.FIREBASE_KEY,
    domain: process.env.FDL_DOMAIN,
  },
  awsConfig: {
    region: 'ap-south-1',
  },
  differentialScheme: {
    uploadFolder: `${process.env.NODE_ENV}/differentialschemes`,
    differentialSchemeS3Bucket: process.env.AWS_FILE_BUCKET,
  },
  testing: {
    DISABLE_DOC_SIGNING_STATUS_CHECK: process.env.DISABLE_DOC_SIGNING_STATUS_CHECK === 'true',
    DISABLE_PG_RESPONSE_ID_CHECK: process.env.DISABLE_PG_RESPONSE_ID_CHECK === 'true',
  },
  supportJwtToken: process.env.SUPPORT_JWT_TOKEN,
  deepLinks: {
    endpoint: 'https://rupeek.com',
    pendingActionScreen: '/loans/pending',

  },
  isNewrelicEnabled: process.env.NEW_RELIC_ENABLED === 'true',
  authorizedPaymentExpiryInMinutes: process.env.AUTHORIZED_PAYMENT_EXPIRY_IN_MINUTES,
};
