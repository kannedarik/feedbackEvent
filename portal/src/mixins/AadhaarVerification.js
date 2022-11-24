import store from '@/store';
import { recoverPin } from '@/api/customerPIN.api';
import { aadharValidationWithOrderID, getAadharValidationWithOrderID } from '@/api/repledge.api';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  data() {
    return {
      renewlFlowCount: 3,
      recoverPINFlowCount: 3,
      recoverPINOTPCount: 3,
    };
  },
  activated() {
    this.renewlFlowCount = 3;
    this.recoverPINFlowCount = 3;
    this.recoverPINOTPCount = 3;
  },
  methods: {
    getOTP(type) {
      this.eventTraking({
        action: 'Reset PIN',
        eventName: events.PAYMENT_VALID_OVD_ENTERED,
      });
      recoverPin({
        params: { step: 'OVD', mode: type },
        data: { challenge: this.customer.aadhaar || '' },
      })
        .then((response) => {
          if (response.status === 200) {
            this.updatedAadhaarInValidMessage({
              message: '',
              remainingAttempts: 0,
              hasInvalidAadhaar: false,
            });
            this.showOTPContainerInner = true;
          }
        })
        .catch((error) => {
          this.recoverPINFlowCount -= 1;
          this.updatedAadhaarInValidMessage({
            message: error.response.data.UserMsg,
            remainingAttempts: this.recoverPINFlowCount,
            hasInvalidAadhaar: true,
          });
          if (this.recoverPINFlowCount <= 0) {
            this.eventTraking({
              action: 'Reset PIN',
              eventName: events.PAYMENT_INVALID_OVD_ENTERED,
            });
            this.updatedAadhaarInValidMessage({
              message: '',
              remainingAttempts: 0,
              hasInvalidAadhaar: false,
            });
            store.dispatch('renewal/hasShowExitModal', true);
          }
        });
    },
    setPIN() {
      recoverPin({
        params: { step: 'OTP' },
        data: { challenge: this.customer.otp || '' },
      })
        .then((response) => {
          if (response.status === 200) {
            store.dispatch('renewal/aadhaarOTPInValidMessage',
              {
                message: '',
                remainingAttempts: 0,
                hasInvalidOTP: false,
              });
            localStorage.setItem('token', response.data.token);
            if (this.hasReSetPIN) {
              this.$router.push(`/set-pin/${this.$route.params.id}`);
            } else {
              this.$emit('set-pin');
            }
          }
        })
        .catch((error) => {
          this.recoverPINOTPCount -= 1;
          store.dispatch('renewal/aadhaarOTPInValidMessage',
            {
              message: error.response.data.UserMsg,
              remainingAttempts: this.recoverPINOTPCount,
              hasInvalidOTP: true,
            });
          if (this.recoverPINOTPCount <= 0) {
            this.eventTraking({
              action: 'Reset PIN',
              eventName: events.PAYMENT_INVALID_OTP_ENTERED,
            });
            store.dispatch('renewal/aadhaarOTPInValidMessage',
              {
                message: '',
                remainingAttempts: 0,
                hasInvalidOTP: false,
              });
            store.dispatch('renewal/hasShowExitModal', true);
          }
        });
    },
    continuePinValidate() {
      const orderId = this.$route.params.id;
      this.eventTraking({
        action: 'Renewal',
        eventName: events.PAYMENT_VALID_OVD_ENTERED,
      });
      aadharValidationWithOrderID(
        orderId,
        { aadharNumberSuffix: this.customer.aadhaar },
      )
        .then((response) => {
          if (response.data.verificationstatus && this.userInfo.isPinSet) {
            this.renewlFlowCount = 3;
            this.updatedAadhaarInValidMessage({
              message: '',
              remainingAttempts: 0,
              hasInvalidAadhaar: false,
            });
            store.dispatch('renewal/aadhaarVerificationStatus', response.data.verificationstatus);
            this.$router.push(`/PIN-Confirmation/${this.$route.params.id}`);
          } else if (!this.userInfo.isPinSet) {
            this.renewlFlowCount = 3;
            this.updatedAadhaarInValidMessage({
              message: '',
              remainingAttempts: 0,
              hasInvalidAadhaar: false,
            });
            this.$router.push(`/set-pin/${this.$route.params.id}`);
          } else {
            this.renewlFlowCount -= 1;
            this.updatedAadhaarInValidMessage({
              message: response.data.message,
              remainingAttempts: this.renewlFlowCount,
              hasInvalidAadhaar: true,
            });
            if (this.renewlFlowCount <= 0) {
              this.eventTraking({
                action: 'Renewal',
                eventName: events.PAYMENT_INVALID_OVD_ENTERED,
              });
              this.updatedAadhaarInValidMessage({
                message: '',
                remainingAttempts: 0,
                hasInvalidAadhaar: false,
              });
              store.dispatch('renewal/hasShowExitModal', true);
            }
          }
        })
        .catch((error) => {
          this.$notify.error(error.message);
        });
    },
    updatedAadhaarInValidMessage(data) {
      store.dispatch('renewal/aadhaarInValidMessage', data);
    },
    eventTraking(data) {
      const eventProperties = {
        [events.EVENT_NAME]: data.eventName,
        [events.PAYMENT_ACTION]: data.action,
      };
      sendEvent(events.screen.AADHAAR_VERIFICATION, events.category.PAYMENT, eventProperties);
    },
    getAadharVerificationStatus() {
      const orderId = this.$route.params.id;
      getAadharValidationWithOrderID(orderId)
        .then((response) => {
          if (response.data.verificationstatus) {
            store.dispatch('renewal/aadhaarVerificationStatus', response.data.verificationstatus);
            this.$router.push(`/PIN-Confirmation/${this.$route.params.id}`);
          }
        })
        .catch((error) => {
          this.$notify.error(error.message);
        });
    },
  },
};
