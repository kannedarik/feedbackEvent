<script>
import { mapGetters } from 'vuex';
import {
  resendOtpToCustomer, verifyOtp, registerSignMethodBasedOnOrderId,
  fetchSignMethodsBasedOnOrderId, getUnsignedDocument,
  getorderDetails,
} from '../../api/repledge.api';
import { sendEvent } from '../../utils/clevertap/EventTracker';
import events from '../../utils/clevertap/eventconstants';

export default {
  data() {
    return {
      // variable to store orderid
      orderId: '',
      // variable to store customer mobile number
      customerNumber: '',
      // timer count
      count: 0,
      // timer flag
      timeRemaining: true,
      // flag to enable the resend otp option
      resendOtp: false,
      // variable to store otp
      otp: '',
      // offline verification flag
      OfflineVerification: false,
      // offline Verification data
      offlineVerificationObj: {},
      // flag for otp attempt exceed
      multipleOtpFailure: false,
      // flag to store order details
      orderDetails: {},
    };
  },
  computed: {
    ...mapGetters({
      userInfo: 'auth/loggedInUser',
    }),
  },
  methods: {
    toBack() {
      this.$router.push('/dashboard');
    },
    // to resend otp via call || sms
    async resendOtpToCustomer(provider) {
      try {
        await resendOtpToCustomer(this.orderId, { provider });
        this.otpTimer();
        this.$noty.success('OTP resent successfully');
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // to verify the entered otp
    async verifyEnteredOtp() {
      try {
        const response = await verifyOtp(this.orderId, { otp: this.otp });
        if (response.data && response.data.data && response.data.data.status && response.data.data.status.name === 'success') {
          this.$noty.success('OTP verified Successfully');
          this.fetchOrder('success');
        }
        if (response.data && response.data.data && response.data.data.status && response.data.data.status.name !== 'success') {
          if (!response.data.data.attempts) {
            this.fetchOrder('failure');
            this.$noty.error('You have exceeded your OTP attempts');
          } else {
            this.$noty.error('You have entered incorrect OTP');
          }
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // to payment redirection
    toPayments() {
      this.trackOTPFailureEvent();
      this.$router.push({ name: 'paymentOptions', params: { id: this.orderId } });
    },
    // for fetching sign methods based on orderid
    async fetchSignMethods(orderId) {
      try {
        const response = await fetchSignMethodsBasedOnOrderId(orderId);
        response.data.methods.map((signMethod) => {
          if (signMethod.name === 'physical') {
            this.OfflineVerification = true;
            this.offlineVerificationObj = signMethod;
          }
          this.otpTimer();
          return true;
        });
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    trackOfflineOTPVerification() {
      const properties = {
        [events.PAYMENT_ACTION]: events.CAPABILITY_REPLEDGE,
        [events.EVENT_NAME]: events.PAYMENT_OFFLINE_OTP_SCREEN_CLICKED,
      };
      sendEvent(events.screen.OTP_VERIFICATION, events.category.PAYMENT, properties);
    },
    trackOTPFailureEvent() {
      const properties = {
        [events.PAYMENT_ACTION]: events.CAPABILITY_REPLEDGE,
        [events.EVENT_NAME]: events.PAYMENT_CONTINUE_OTP_TROUBLE_CLICKED,
      };
      sendEvent(events.screen.OTP_VERIFICATION, events.category.PAYMENT, properties);
    },
    // registering the selected sign method
    async toOfflineVerification() {
      try {
        const response = await
        registerSignMethodBasedOnOrderId(this.orderId, this.offlineVerificationObj);
        if (response.status === 200) {
          this.$router.push({ name: 'paymentOptions', params: { id: this.orderId } });
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
      this.trackOfflineOTPVerification();
    },
    // function to restrict the special characters in part payment text box
    checkSpecialCharacters(evt) {
      const e = evt || window.event;
      const charCode = typeof e.which === 'undefined' ? e.keyCode : e.which;
      const charStr = String.fromCharCode(charCode);
      if (!charStr.match(/^[0-9]+$/)) {
        e.preventDefault();
      }
    },
    // for timer
    otpTimer() {
      this.otp = '';
      let countDown = 30;
      this.count = countDown;
      clearInterval(this.timer);
      this.timeRemaining = true;
      this.resendOtp = false;
      // Update the count down every 1 second
      this.timer = setInterval(() => {
        // If the count down is over
        if (countDown <= 0) {
          clearInterval(this.timer);
          this.resendOtp = true;
          this.timeRemaining = false;
        } else {
          this.count = countDown;
          this.count = (countDown < 10) ? `0${countDown}` : countDown;
          countDown -= 1;
        }
      }, 1000);
    },
    // to fetch unsigned doc
    async getDocument(orderid) {
      try {
        const response = await getUnsignedDocument(orderid);
        window.open(response.data && response.data.docurl, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,,width=100%,height=400');
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // to fetch order details
    async fetchOrder(status) {
      try {
        const response = await getorderDetails(this.orderId);
        this.orderDetails = response.data && response.data.order;
        if (this.orderDetails.hasLoanEnhancementLoans && this.orderDetails.paymentstatus === 'success' && this.orderDetails.signingstatus === 'success') {
          this.$router.push({ name: 'bankDetails', params: { id: this.orderId } });
        } else if (this.orderDetails.paymentstatus === 'success' && (status === 'failure' || status === 'success')) {
          this.$router.push({ name: 'orderStatus', params: { orderId: this.orderId, id: this.orderDetails.payment.requestId } });
        } else if (this.orderDetails.paymentstatus !== 'success' && status === 'failure') {
          this.multipleOtpFailure = true;
        } else {
          this.$router.push({ name: 'paymentOptions', params: { id: this.orderId } });
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
  },
  activated() {
    this.otp = '';
    this.orderId = this.$route.params.id;
    this.customerNumber = this.userInfo.phone;
    if (!this.$route.query.redirected) {
      this.fetchSignMethods(this.orderId);
    } else {
      this.otpTimer();
    }
  },
};
</script>
