import getEnv from './utility/env';

export default {
  urls: {
    login: `${getEnv('VUE_APP_CORE_URI')}/api/account/login`,
    data: `${getEnv('VUE_APP_LEDGER_URI')}/api/v1/data`,
    files: `${getEnv('VUE_APP_LEDGER_URI')}/api/v1/files`,
    processors: `${getEnv('VUE_APP_LEDGER_URI')}/api/v1/fileprocessors`,
    getcustomerloans: '/api/search/v2/getcustomerloans',
    validatingLoans: '/api/txnattribute/validate',
    updatePaymentCustomer: '/api/txnattribute/update',
    getUnsuccesfulTransfers: '/api/transfers/getUnsuccesfulTransfers',
    paymentsfetch: '/api/txnattribute/fetch',
    checkUserLoanAttributable: '/api/checkUserLoanAttributable',
    createMultiLenderTransfers: '/api/transfers/createMultiLenderTransfers',
    getUnlinkedVanPayment: '/api/transfers/getUnlinkedVanPayment',
    getTempVanPayment: '/api/transfers/getTempVanPayment',
    getPaymentStageInfo: '/api/txnstate/pre',
    lendingPartnersAPI: `${getEnv('VUE_APP_KONG_URL')}/lendingmdsapi/api/v1/lendingPartners`,
  },
  deepstream: {
    url: 'wss://ws.rupeek.com',
    topic: {
      processor: `ledger-${getEnv('NODE_ENV')}/processor`,
    },
  },
  links: [
    {
      key: 'processor',
      icon: 'file-upload',
      roles: [''],
      link: 'processor',
    },
    {
      key: 'vanattribution',
      icon: ['fas', 'receipt'],
      roles: ['admin', 'support'],
      link: 'vanattribution',
    },
  ],
  filePurposes: [
    {
      text: 'MIS Report',
      value: 'MIS',
    },
    {
      text: 'Transaction file',
      value: 'TRANSACTION',
    },
    {
      text: 'Closing A/C file',
      value: 'CLOSING',
    },
    {
      text: 'Recovery file',
      value: 'RECOVERY',
    },
    {
      text: 'Auction file',
      value: 'AUCTION',
    },
  ],
  taskList: [
    {
      text: 'Loan Reconciliation',
      value: 'loan.recon',
    },
    {
      text: 'Transaction Reconciliation',
      value: 'transaction.recon',
    },
  ],
  paymentsTypes: [
    {
      name: 'Partial',
      type: 'partial',
    },
    {
      name: 'Interest',
      type: 'interest',
    },
    {
      name: 'Partinterest',
      type: 'partinterest',
    },
    {
      name: 'Closing',
      type: 'closing',
    },
    {
      name: 'Repledge',
      type: 'repledge',
    },
    {
      name: 'Hardrecovery',
      type: 'hardrecovery',
    },
  ],
  // Pending Table Columns for the consolidated Dashboard
  consolidatedPendingColumns: [
    {
      label: 'Actions',
      field: 'actions',
    },
    {
      label: 'Loan ID',
      field: 'loanid',
    },
    {
      label: 'LOS ID',
      field: 'losid',
    },
    {
      label: 'Lender',
      field: 'lenderid',
    },
    {
      label: 'Loan Amount',
      field: 'loanamount',
    },
    {
      label: 'Balance Amount',
      field: 'balanceamount',
    },
    {
      label: 'Interest Amount',
      field: 'interestamount',
    },
    {
      label: 'Closing Amount',
      field: 'closingamount',
    },
    {
      label: 'Net Weight gm(s)',
      field: 'netweight',
    },
  ],
  unsuccesfulTransfers: [
    {
      label: 'Payment Request Id',
      field: 'paymentrequestid',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Pay Id',
      field: 'payid',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Customer Name',
      field: 'customername',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Phone Number',
      field: 'phoneNumber',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Date of Payments',
      field: 'dateofpayments',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Pay Amount',
      field: 'payamount',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Payment Type',
      field: 'paymenttype',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Actions',
      field: 'actions',
      thClass: 'text-capitalize text-center',
      tdClass: 'text-center',
    },
  ],
  vanPayment: [
    {
      label: 'Pay Id',
      field: 'payid',
      thClass: 'text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Date of Payments',
      field: 'dateofpayments',
      thClass: 'text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Pay Amount',
      field: 'payamount',
      thClass: 'text-center',
      tdClass: 'text-center',
    },
    {
      label: 'Actions',
      field: 'actions',
      thClass: 'text-center',
      tdClass: 'text-center',
    },
  ],
};
