import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import getEnv from '@/utils/env';

Vue.use(VueRouter);
const ifAuthenticated = (to, from, next) => {
  const { isAuthenticated } = store.state.auth;
  if (isAuthenticated) {
    return next();
  }
  return from.path !== '/login' ? next('/login') : '';
};
const ifNotAuthenticated = (to, from, next) => {
  const { isAuthenticated } = store.state.auth;
  if (!isAuthenticated) {
    return next();
  }
  return next('/');
};

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/login.vue'),
    beforeEnter: ifNotAuthenticated,
    meta: {
      title: 'Rupeek | Repay your gold loan online',
      description: 'Rupeek Payments | Repay your gold loan online',
    },
  },
  {
    path: '/app/health',
    component: () => import('../views/HealthCheck/HealthCheck.vue'),
    meta: {
      title: 'Rupeek Payments',
      description: 'Rupeek Payments | Repay your gold loan online',
    },
  },
  {
    path: '/',
    redirect: { name: 'Home' },
  },
  {
    path: '/dashboard',
    name: 'Home',
    component: () => import('../views/Home/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Repay your gold loan online',
      description: 'Rupeek Payments | Repay your gold loan online',
    },
  },
  {
    path: '/status-card',
    name: 'statusCardComponent',
    component: () => import('../views/StatusCard/index.vue'),
    props: true,
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Status Card',
      description: 'Rupeek Payments | View the renewal | part release | track your gold delivery status',
    },
  },
  {
    path: '/loan-details',
    name: 'LoanDetails',
    component: () => import('../views/LoanDetails/index.vue'),
    props: true,
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Loan Details',
      description: 'Rupeek Payments | View the loan details | scheme details | jewels list',
    },
  },
  {
    path: '/pay-excess-funding',
    name: 'excessFunding',
    component: () => import('../views/excessFunding/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Repay your excess funding',
      description: 'Rupeek Payments | Repay your excess funding online',
    },
  },
  {
    path: '/interest-payment-summary',
    name: 'InterestPaymentSummary',
    component: () => import('../views/InterestPaymentSummary/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Repay your interest amount',
      description: 'Rupeek Payments | Repay your interest amount online',
    },
  },
  {
    path: '/part-payment-summary',
    name: 'PartPaymentSummary',
    component: () => import('../views/PartPaymentSummary/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Pay sum of amount part payment',
      description: 'Rupeek Payments | Pay sum of amount part payment online',
    },
  },
  {
    path: '/close-loan-summary',
    name: 'CloseLoanSummary',
    component: () => import('../views/CloseLoanSummary/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Close you gold loan',
      description: 'Rupeek Payments | Close you gold loan online',
    },
  },
  {
    path: '/new-payment-options',
    name: 'paymentMethod',
    component: () => import('../views/PaymentMethods/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Select Payment Method',
      description: 'Rupeek Payments | Select payment method',
    },
  },
  {
    path: '/jewels-selection',
    name: 'JewelsSelection',
    component: () => import('../views/PartRelease/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Select jewels for part release',
      description: 'Rupeek Payments | Select jewels for part release online',
    },
  },
  {
    path: '/partial-release-summary',
    name: 'PartialReleaseSummary',
    component: () => import('../views/PartRelease/PartialReleaseSummary.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Partial Release Summary',
      description: 'Rupeek Payments | View Partial Release Summary',
    },
  },
  {
    path: '/partial-release-scheme-Details',
    name: 'PartialReleaseDetails',
    component: () => import('../views/PartRelease/PartialReleaseSchemeDetails.vue'),
    props: true,
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Partial Release Details',
      description: 'Rupeek Payments | View Partial Release Details',
    },
  },
  {
    path: '/selected-jewels-list',
    name: 'SelectedJewelsList',
    component: () => import('../views/selectedJewelsList/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Selected Jewels List',
      description: 'Rupeek Payments | View Selected Jewels List',
    },
  },
  {
    path: '/renewal-summary',
    name: 'RenewalSummary',
    component: () => import('../views/RenewalSummary/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Renewal Summary',
      description: 'Rupeek Payments | View Renewal Summary',
    },
  },
  {
    path: '/renewal-loan-details',
    name: 'RenewalLoanDetails',
    component: () => import('../views/RenewalSummary/RenewalLoanDetails.vue'),
    props: true,
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Renewal Indetails',
      description: 'Rupeek Payments | View Renewal Indetails',
    },
  },
  {
    path: '/terms-conditions',
    name: 'TermsAndConditions',
    component: () => import('../views/TermsAndConditions/index.vue'),
    props: true,
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Terms And Conditions',
      description: 'Rupeek Payments | View Lenders Terms And Conditions',
    },
  },
  {
    path: '/pay-now/:id',
    name: 'GeneratePaymentLink',
    component: () => import('../views/PaymentGateway/GeneratePaymentLink.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Payments',
      description: 'Rupeek Payments | Please enter your card details',
    },
  },
  {
    path: '/m-pay-now/:id',
    name: 'web_pay_link_mob',
    component: () => import('../views/PaymentGateway/GeneratePaymentLink.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Payments',
      description: 'Rupeek Payments | Please enter your card details',
    },
  },
  {
    path: '/v2/m-pay-now/:id',
    name: 'v2_web_pay_link_mob',
    component: () => import('../views/PaymentGateway/GeneratePaymentLink.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Payments',
      description: 'Rupeek Payments | Please enter your card details',
    },
  },
  {
    path: '/new-payment-status',
    name: 'PaymentStatus',
    component: () => import('../views/paymentStatus/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Payments Success',
      description: 'Rupeek Payments | Repay your gold loan online | Payments Success',
    },
  },
  {
    path: '/esign-ack/:id',
    name: 'ackEsign',
    component: () => import('../views/esign/esignAck/esignAck.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | ackEsign',
      description: 'Rupeek Payments | Please enter your card details',
    },
  },
  {
    path: '/esign-status/:id',
    name: 'esignStatus',
    component: () => import('../views/esign/esignStatus/esignStatus.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Esign Status',
      description: 'Rupeek Payments | View Esign Status online',
    },
  },
  {
    path: '/payment-options/:id',
    name: 'paymentOptions',
    component: () => import('../views/PaymentMethods/RenewalMethod.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Payment Options',
      description: 'Rupeek Payments | Please select a payment option',
    },
  },
  {
    path: '/otp-verification/:id',
    name: 'otpVerification',
    component: () => import('../views/otpbasedRenewal/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | OTP Verification',
      description: 'Rupeek Payments | Verify OTP Online',
    },
  },
  {
    path: '/generate-payment-link/:orderid/:rpkid',
    name: 'paymentLink',
    component: () => import('../views/paymentLink/paymentLink.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Generate Payment Link',
      description: 'Rupeek Payments | Payment Link Generating for Paying Amount Online',
    },
  },
  {
    path: '/m-generate-payment-link/:orderid/:rpkid',
    name: 'paymentLinkMobile',
    component: () => import('../views/paymentLink/paymentLink.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Mobile Generate Payment Link',
      description: 'Rupeek Payments | Payment Link in Mobile Generating for Paying Amount Online',
    },
  },
  {
    path: '/payment-status/:orderid',
    name: 'paymentStatus',
    component: () => import('../views/paymentStatus/paymentStatus.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Payments Success',
      description: 'Rupeek Payments | Payments Success | Repay your gold loan online',
    },
  },
  {
    path: '/order-status/:orderId/:id',
    name: 'orderStatus',
    component: () => import('../views/orderStatus/orderStatus.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Renewl Order Status',
      description: 'Rupeek Payments | Renewl Order Status | Repay your gold loan online',
    },
  },
  {
    path: '/bank-details/:id',
    name: 'bankDetails',
    component: () => import('../views/bankDetails/bankDetails.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Add Bank Details',
      description: 'Rupeek Payments | Add Bank Details | Repay your gold loan online',
    },
  },
  {
    path: '/bank-account-verify/:id',
    name: 'bankAccountVerify',
    component: () => import('../views/bankDetails/bankAccountVerifyMweb.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Verify Added Bank Account',
      description: 'Rupeek Payments | Verify Added Bank Account | Repay your gold loan online',
    },
  },
  {
    path: '/release-tracker/:id',
    component: () => import('@/views/ReleaseTracker/releaseTracker.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Track Your Gold Delivery Status',
      description: 'Rupeek Payments | Track Your Gold Delivery Status | Repay your gold loan online',
    },
  },
  {
    path: '/release-slot-booking',
    component: () => import('@/views/ReleaseSlotBooking/ReleaseSlotBooking.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Book Slot For Gold Delivery',
      description: 'Rupeek Payments | Book Slot For Gold Delivery Online | Repay your gold loan online',
    },
  },
  {
    path: '/add-new-address',
    name: 'AddNewDeliveryAddress',
    component: () => import('@/views/AddNewDeliveryAddress/AddNewDeliveryAddress.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Add New Delivery Address',
      description: 'Rupeek Payments | Add New Delivery Address online | Repay your gold loan online',
    },
  },
  {
    path: '/release-confirmation',
    name: 'ReleaseConfirmation',
    component: () => import('@/views/ReleaseConfirmation/ReleaseConfirmation.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Gold Delivery Initiated',
      description: 'Rupeek Payments | Gold Delivery Initiated | Repay your gold loan online',
    },
  },
  {
    path: '/identity-verification/:id',
    name: 'IdentityVerification',
    component: () => import('@/views/IdentityVerification/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Identity Verification',
      description: 'Rupeek Payments | Identity Verification | Repay your gold loan online',
    },
  },
  {
    path: '/PIN-Confirmation/:id',
    name: 'PINConfirmation',
    component: () => import('@/views/PINConfirmation/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | PIN Confirmation',
      description: 'Rupeek Payments | PIN Confirmation | Repay your gold loan online',
    },
  },
  {
    path: '/set-pin/:id',
    name: 'SetPIN',
    component: () => import('@/views/SetPIN/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Set PIN',
      description: 'Rupeek Payments | Set PIN | Repay your gold loan online',
    },
  },
  {
    path: '*',
    name: 'NotFound',
    component: () => import('@/views/NotFound/index.vue'),
    meta: {
      title: 'Rupeek',
      description: 'Rupeek Payments | Not Found',
    },
  },
  {
    path: '/loan-amount-breakup',
    name: 'AmountBreakup',
    props: true,
    component: () => import('@/views/AmountBreakup/index.vue'),
    beforeEnter: ifAuthenticated,
    meta: {
      title: 'Rupeek Payments | Loan Amount Breakup',
      description: 'Loan Amount Breakup | Repay your gold loan online !!!',
    },
  },
  // {
  //   path: '/pdf-viewer/:id',
  //   name: 'pdfViewer',
  //   component: () => import('../views/pdfViewer/pdfViewer.vue'),
  // },
];

const router = new VueRouter({
  mode: 'history',
  base: getEnv('BASE_URL'),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  document.querySelector('meta[name="description"]').setAttribute('content', `${to.meta.description}
    | Avail an online gold loan with
    Rupeek gold loan. Get gold loan online at your doorstep with instant money transfer
    at just 0.55%, lowest in the market.`);
  next();
});

export default router;
