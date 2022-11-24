<script>
import { mapGetters } from 'vuex';
import { sendEvent } from '../../utils/clevertap/EventTracker';
import events from '../../utils/clevertap/eventconstants';
import { resendOtpVerifiyAccount, verifiyAccountAPI } from '../../api/repledge.api';

export default {
  data() {
    return {
      // wrong otp flag
      isWrongOTP: false,
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
      // variable to store order id
      orderId: '',
      // variable to store pending OTP retry attempts
      pendingOtpRetryAttempts: null,
    };
  },
  computed: {
    ...mapGetters({
      selectedAccount: 'data/selectedAccount',
      userInfo: 'auth/loggedInUser',
    }),
  },
  watch: {
    userInfo(value) {
      this.customerNumber = value.phone;
    },
  },
  methods: {
    toBack() {
      this.$router.push({ name: 'bankDetails', params: { id: this.orderId } });
    },
    // function call for otp timer
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
    // API call to re-send otp to customer sms/call
    async resendOtpToCustomer(type) {
      this.isWrongOTP = false;
      try {
        const response = await resendOtpVerifiyAccount(
          { type, transactionId: this.selectedAccount.bankTransactionId },
        );
        this.otpTimer();
        this.$noty.success(response.data.message);
      } catch (error) {
        this.$noty.error(error.message);
      }
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
    // API call to verifiy OTP and update account status
    async verifiyAccount() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BANK_SUBMIT_OTP_PAGE_CLICKED,
      };
      sendEvent(events.screen.BANK_ACCOUNT_VERIFY, events.category.PAYMENT, properties);
      this.pendingOtpRetryAttempts = null;
      try {
        const response = await verifiyAccountAPI(
          this.selectedAccount.bankTransactionId, { otp: this.otp },
        );
        this.pendingOtpRetryAttempts = response.data.pendingOtpRetryAttempts;
        // function call to check account status based on status move to next screen
        this.checkStatus(response.data.accounts);
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // function call to check account status based on status move to next screen
    checkStatus(account) {
      if ((account.status).toLowerCase() === 'verification_successful'
      || +this.pendingOtpRetryAttempts <= 0) {
        this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
      } else {
        this.isWrongOTP = true;
      }
    },
  },
  mounted() {
    const properties = {
      [events.EVENT_NAME]: events.PAYMENT_BANK_OTP_PAGE,
    };
    sendEvent(events.screen.BANK_ACCOUNT_VERIFY, events.category.PAYMENT, properties);
    this.orderId = this.$route.params.id;
    // function call for otp timer
    this.otpTimer();
  },
};
</script>
