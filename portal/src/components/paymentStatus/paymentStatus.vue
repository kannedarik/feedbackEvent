<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { getorderStatus } from '@/api/payment.api';
import {
  getSignedDocument,
  registerSignMethodBasedOnOrderId,
  fetchSignMethodsBasedOnOrderId,
} from '@/api/repledge.api';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import { formatRupeeAmount } from '@/utils/string';

export default {
  data() {
    return {
      // to store orderID
      orderId: '',
      // to store payment data
      paymentData: {},
      // signed documents
      signedDoc: {},
      signMethods: [],
      googleFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLScwJ7nRFDLr-DE8sFyh8EQhf4qVjWWe4IvjMroQ9yR_Jzz-wg/viewform?vc=0&c=0&w=1&flr=0&usp=mail_form_link',
      otpSignMethodsList: ['digital', '2fa'],
    };
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  methods: {
    formatRupeeAmount,
    trackDigitalVerificationAndRenewalSuccessOrFailure() {
      const verificationStatus = _.get(this.paymentData, 'bankAccount.verificationStatus', '-');
      if (this.paymentData.hasLoanEnhancementLoans && this.paymentData.signingstatus === 'success') {
        if (verificationStatus !== '-') {
          const eventName = verificationStatus.toLowerCase() !== 'verification_successful' ? events.PAYMENT_LE_DIGITAL_VERIFICATION_SUCCESS : events.PAYMENT_LE_DIGITAL_VERIFICATION_FAILED;
          const properties = {
            [events.EVENT_NAME]: eventName,
          };
          sendEvent(events.screen.PAYMENT_STATUS, events.category.PAYMENT, properties);
        }
      }
      if (this.paymentData.paymentstatus === 'success') {
        const event = this.paymentData.signingstatus === 'success' ? events.category.PAYMENT_RENEWAL_SUCCESS : events.category.PAYMENT_RENEWAL_PENDING;
        const properties = {
          [events.PAYMENT_LE_BANK_VERIFICATION_STATUS]: this.paymentData.status,
          [events.PAYMENT_LE_LOAN]: this.paymentData.hasLoanEnhancementLoans,
          [events.PAYMENT_ORDER_ID]: this.paymentData.orderId,
          [events.PAYMENT_RPK_ID]: this.paymentData.payment.requestId,
          [events.PAYMENT_SIGNING_METHOD]: this.paymentData.signingmethod.name,
        };
        sendEvent(events.screen.PAYMENT_STATUS, event, properties);
        properties[events.EVENT_NAME] = this.paymentData.signingstatus === 'success' ? events.PAYMENT_RENEWAL_SUCCESS : events.PAYMENT_RENEWAL_PENDING;
        sendEvent(events.screen.PAYMENT_STATUS, events.category.PAYMENT, properties);
      }
    },
    // for getting the renewal status
    async fetchStatus() {
      try {
        const response = await getorderStatus(this.orderId);
        this.paymentData = response.data && response.data.order;
        if (this.paymentData && this.paymentData.paymentstatus === 'success'
         && this.paymentData.signingstatus === 'success'
         && this.paymentData.signingmethod.name !== 'physical') {
          this.fetchSignedDocument(this.orderId);
        }
        if (this.paymentData && this.paymentData.paymentstatus === 'success'
        && this.paymentData.signingstatus !== 'success') {
          this.fetchSignMethods(this.orderId);
        }
        this.trackDigitalVerificationAndRenewalSuccessOrFailure();
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    trackAckReattempt(signMethod) {
      const properties = {
        [events.EVENT_NAME]: signMethod === 'digital' ? events.PAYMENT_VIA_OTP_REATTEMPT_CLICKED : events.PAYMENT_VIA_ESIGN_REATTEMPT_CLICKED,
      };
      sendEvent(events.screen.PAYMENT_STATUS, events.category.PAYMENT, properties);
    },
    trackDownLoadPCEvent({
      summary, isLE, lender,
    }) {
      const properties = {};
      if (summary) {
        properties[events.EVENT_NAME] = isLE
          ? events.PAYMENT_DOWNLOAD_LE_SUMMARY_PC_CLICKED
          : events.PAYMENT_DOWNLOAD_SUMMARY_PC_CLICKED;
      } else {
        properties[events.EVENT_NAME] = lender !== 'rupeek' ? events.PAYMENT_DOWNLOAD_PC_LENDER_CLICKED : events.PAYMENT_DOWNLOAD_PC_RUPEEK_CLICKED;
      }
      sendEvent(events.screen.PAYMENT_STATUS, events.category.PAYMENT, properties);
    },
    // for fetching sign methods based on orderid
    async fetchSignMethods(orderId) {
      try {
        const response = await fetchSignMethodsBasedOnOrderId(orderId);
        this.signMethods = response.data.methods
          .filter((key) => key.name !== 'physical')
          .reverse();
        const methodsList = [];
        response.data.methods.forEach((element) => {
          methodsList.push(element.name);
        });
        if (methodsList.includes('2fa')) {
          this.eventTraking(true);
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // registering the selected sign method
    async registerSignMethod(obj) {
      if (obj.name === '2fa') {
        this.eventTraking(false);
      } else {
        this.trackAckReattempt(obj);
      }
      try {
        const response = await
        registerSignMethodBasedOnOrderId(this.orderId, obj);
        if (response.status === 200) {
          if (obj.name === 'digital') {
            this.$router.push({
              name: 'otpVerification',
              params: { id: this.orderId },
              query: { redirected: true },
            });
          } else if (obj.name === '2fa') {
            this.$router.push(`/identity-verification/${this.orderId}`);
          } else {
            this.$router.push({ name: 'ackEsign', params: { id: this.orderId } });
          }
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // for fetching signed document
    async fetchSignedDocument() {
      try {
        const response = await getSignedDocument(this.orderId);
        this.signedDoc = response.data.docurl;
        this.signedDoc.lender = response.data.lender;
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // to redirect customer to dashboard
    toDashboard() {
      this.$router.push('/dashboard');
    },
    openGoogleFormLink() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_LE_LINK_VERIFICATION_FAILED_CLICKED,
      };
      sendEvent(events.screen.PAYMENT_SUCCESS, events.category.PAYMENT, properties);
      window.open(this.googleFormLink, '_blank');
    },
    eventTraking(hasViewd) {
      const eventProperties = {
        [events.EVENT_NAME]: hasViewd
          ? events.PAYMENT_VIA_OTP_REATTEMPT_VIEWED
          : events.PAYMENT_VIA_OTP_REATTEMPT_CLICKED,
      };
      sendEvent(events.screen.PAYMENT_SUCCESS, events.category.PAYMENT, eventProperties);
    },
  },
  activated() {
    this.orderId = this.$route.params.orderid;
    this.fetchStatus();
  },
};
</script>
