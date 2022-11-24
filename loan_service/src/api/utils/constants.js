module.exports = {
  redisKeys: {
    notification: {
      categories: 'ls:notify:categories',
      providers: 'ls:notify:providers',
      templates: 'ls:notify:templates',
      types: 'ls:notify:types',
    },
    lenderIdToSlugMap: 'ls:lenderIdToSlugMap',
  },
  reminder: {
    type: {
      renewal: 'repledge',
      interest: 'interest',
    },
    smstemplates: {
      renewal: {
        upcoming: 'renewalupcoming',
        due: 'renewaldue',
        overdue: 'renewaloverdue',
      },
    },
    renewalstages: {
      renewalupcoming: 35,
      renewaldue: 15,
      renewaloverdue: 0,
    },
    reminderdays: {
      interestdue: 2,
      interestoverdue: 2,
    },
    priorityorder: {
      renewaloverdue: 1,
      interestoverdue: 2,
      interestoverduemip: 3,
      renewaldue: 4,
      interestdue: 5,
      renewalupcoming: 6,
      nextinterestdue: 7,
      interestoverduejumping: 8,
    },
    loantype: {
      '1:1': '1:1',
    },
    groupby: {
      duedate: 'duedate',
    },
    filterby: {
      duedays: 'duedays',
    },
    repaymenttype: {
      interest: 'interest',
      repledge: 'repledge',
    },
    remindertype: {
      renewaloverdue: 'renewaloverdue',
      nextinterestdue: 'nextinterestdue',
      interestdue: 'interestdue',
      interestoverdue: 'interestoverdue',
      renewaldue: 'renewaldue',
      renewalupcoming: 'renewalupcoming',
      interestoverduemip: 'interestoverduemip',
      interestoverduejumping: 'interestoverduejumping',
      renewalpending: 'renewalpending',
      freshloan: 'freshloan',

    },
  },
  notification: {
    sms: {
      category: 'transactional',
      provider: 'kaleyra',
      type: 'sms',
    },
  },
  accounts: {
    interestremindertype: 'CASHBACK,MIP',
    loanstatus: {
      closed: 'CLOSED',
      soft_closed: 'SOFT_CLOSED',
      opened: 'OPENED',
    },
    loanType: {
      MIP: 'MIP',
      BULLET: 'BULLET',
      REPO: 'REPO',
      CLM: 'CLM',
    },
  },
  los: {
    productcategory: {
      goldloan: 'GOLD_LOAN',
    },
    orders: {
      partRelease: 'PART_RELEASE',
    },
    orderStatus: {
      inProgress: 'IN_PROGRESS',
    },
  },
  lendersList: {
    rupeek: 'rupeek',
    icici: 'icici',
  },
  applink: 'rupeek.app.link/home',
  app: {
    version: '306',
    useragent: 'Android',
  },
  timezone: {
    istoffset: '+05:30',
  },
  producttype: {
    CLM: 'CLM',
  },
  statuscode: {
    1: 'active',
    5: 'closed',
  },
  inProgress: {
    types: {
      renewal: 'renewal',
      freshLoan: 'freshloan',
      partRelease: 'partrelease',
    },
    renewal: {
      message: {
        outsideTat: 'It’s taking longer than usual. We have created a ticket to address your issue. Please reach out to customer support, if needed',
      },
      disclaimer: 'Loan is subject to change or cancellation at the lender bank',
      turnAroundTimes: {
        digital: 6,
        manualSigning: 10,
        manualBankVerification: 6,
      },
      reminderType: 'renewalpending',
      loanDisabledTip: {
        singleLoan: 'Your loan is temporarily inactive as it is being processed',
        multipleLoans: 'Your loans are temporarily inactive as they are being processed',
      },
    },
    freshloan: {
      message: {
        outsideTat: 'It’s taking longer than usual. We have created a ticket to address your issue. Please reach out to customer support, if needed',
      },
      disclaimer: 'Loan is subject to change or cancellation at the lender bank',
      turnAroundTime: 4,
      reminderType: 'freshloan',
      loanDisabledTip: {
        singleLoan: 'Your loan is temporarily inactive as it is being processed',
        multipleLoans: 'Your loans are temporarily inactive as they are being processed',
      },
    },
    partrelease: {
      message: {
        outsideTat: 'It’s taking longer than usual. We have created a ticket to address your issue. Please reach out to customer support, if needed',
      },
      disclaimer: 'Loan is subject to change or cancellation at the lender bank',
      turnAroundTimes: {
        digital: 6,
        manual: 10,
      },
      reminderType: 'partrelease',
      loanDisabledTip: {
        singleLoan: 'Your loan is temporarily inactive as it is being processed',
        multipleLoans: 'Your loans are temporarily inactive as they are being processed',
      },
    },
  },
  loanTypes: {
    active: 'ACTIVE',
    renewal: 'INPROGRESS_RENEWAL',
    freshLoan: 'INPROGRESS_FRESH',
    partRelease: 'INPROGRESS_PART_RELEASE',
  },
};
