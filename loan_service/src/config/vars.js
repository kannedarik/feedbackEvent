const path = require('path');
const appPackage = require('../../package.json');
// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  appName: appPackage.name,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  urls: {
    core: {
      endpoint: process.env.CORE_URI,
      maploans: '/api/v3/repledge/maploans',
      supportmaploans: '/api/v3/repledge/maploanssupport',
      maploansV4: '/api/v4/repledge/maploans',
      supportmaploansV4: '/api/v4/repledge/maploanssupport',
      maploansV5: '/api/v5/repledge/maploans',
      supportmaploansV5: '/api/v5/repledge/maploanssupport',
      operationalMetrics: '/api/operationalmetrics',
      operationalMetricsSupport: '/api/operationalmetricsSupport',
      loanmapuser: '/api/v1/account/loanmapuser',
    },
    los: {
      endpoint: process.env.LOS_URI,
      jewellist: '/api/v2/pb/jewellist',
      orders: '/api/v2/pb/orders',
    },
    payments: {
      endpoint: process.env.PAYMENT_URI,
      userloans: '/api/V4/getuserloans',
      loans: '/api/search',
      customerloans: '/api/search/v3/getcustomerloans',
      supportuserloans: '/api/support/userloans',
      loandetails: '/api/loandetails',
      aggregateloanjewels: '/api/support/aggregateloansjewels',
      getUserLoansStatus: '/api/user/loans/status',
      renewalLoans: '/api/renewal/loans',
      listPaymentTransactions: '/api/payment/transactions',
    },
    rupeek: {
      endpoint: process.env.RUPEEK_URI,
      jwtvalidate: '/api/account/jwtvalidate',
    },
    accounts: {
      endpoint: process.env.ACCOUNTS_URI,
      customerrupeekview: '/api/discrepancy/customerRupeekViews',
      loan: '/api/loan',
      charges: '/api/charges',
      dashboardloan: '/api/dashboardLoan',
    },
    lendingmds: {
      endpoint: process.env.LENDINGMDS_URI,
      lenderinfo: '/api/v1/lendingBranches',
      lendingpartners: '/api/v1/lendingPartners',
    },
    notification: {
      endpoint: process.env.NOTIFICATION_URI,
      sendSMS: '/api/v1/notifications/sms',
      listCategories: '/api/v1/categories',
      listProviders: '/api/v1/providers',
      listTemplates: '/api/v1/templates',
      listTypes: '/api/v1/types',
    },
    cis: {
      endpoint: process.env.CIS_URI,
      clientid: process.env.CIS_URI_CLIENT_ID,
      basicdetails: '/customer/basicDetails',
    },
    oms: {
      endpoint: process.env.OMS_URI,
      orderdetails: '/api/v1/orders/orderdetails',
    },
    schemeengine: {
      endpoint: process.env.SCHEMEENGINE_URI,
      schemedetails: '/api/v1/masterschemes',
    },
  },
  redisUrl: process.env.REDIS_CACHE_URL,
  redisPort: process.env.REDIS_PORT,
  redisDbIndex: process.env.REDIS_DB_INDEX,
  lendingMDS: {
    basic_auth: process.env.LENDINGMDS_AUTH,
  },
  schemeengine: {
    basic_auth: process.env.SCHEMEENGINE_AUTH,
  },
  notificationService: {
    auth: {
      client: process.env.NOTIFICATION_CLIENT_ID,
      token: process.env.NOTIFICATION_TOKEN,
    },
  },
  discrepancyInfo: {
    level: {
      low: 'LEVEL0',
      medium: 'LEVEL1',
      high: 'LEVEL2',
    },
    slabParser: {
      LEVEL0: 'SLAB0',
      LEVEL1: 'SLAB1',
      LEVEL2: 'SLAB2',
    },
  },
  redisInfo: {
    keys: {
      lenderBranches: 'ls:lenderBranches',
      unblockRelease: 'ls:unblockRelease:loanId',
    },
    loanGatewayRoutingKeys: {
      account: 'account',
      payment: 'payment',
    },
  },
  groupColors: ['#00A2E4', '#B9DE00', '#55619C', '#CB843C', '#5F7065', '#13406C', '#FF0D8E', '#863E98', '#00BCBB', '#1A7EA0', '#6F3000', '#8D7965', '#FF6388', '#B21035', '#A74EBE', '#002F88', '#5B7FAB', '#00CCFF', '#FF9260', '#3356A0', '#FFAE00', '#4D62E8', '#FF6300', '#55BB7D'],
  repledgeMessage: 'Your Payment is under process and shall be updated within 48 hours',
  newRelicKey: process.env.NEW_RELIC,
  redisDiscrepancyKey: 'discrepancy_msg',
  loanFilterActions: {
    REPLEDGE: 'repledge',
    PART_RELEASE: 'part-release',
    PART_PAYMENT: 'part_payment',
    CLOSE_LOAN: 'close_loan',
    PAY_INTEREST: 'interest',
  },
  loanStatus: {
    ACTIVE: 1,
  },
  quickLinks: {
    imageUrl: process.env.QUICK_LINKS_IMAGE_URL,
  },
  renewalreminderstages: {
    upcoming: parseInt(process.env.SEND_SMS_DUEDAYS.split(',')[0], 10),
    due: parseInt(process.env.SEND_SMS_DUEDAYS.split(',')[1], 10),
    overdue: parseInt(process.env.SEND_SMS_DUEDAYS.split(',')[2], 10),
  },
  lenders: {
    kvb: 'kvb',
    federal: 'federal',
    rupeek: 'rupeek',
    axis: 'axis',
    indianbank: 'indianbank',
  },
  rupeekLenderId: process.env.RUPEEK_LENDER_ID,
  schemetypes: {
    jumping: 'jumping',
    flat: 'flat',
    mip: 'monthly',
  },
  paymentTransaction: {
    rtlmFields: ['paidamount', 'cashback', 'utrnumber', 'loan', 'request'],
    requestFields: ['amount', 'cashback', 'recordedon', 'provider', 'status', 'type', 'requestid', 'pgresponse', 'user'],
  },

};
