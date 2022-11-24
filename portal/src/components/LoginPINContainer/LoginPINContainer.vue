<template>
  <div  class="login-form-wrapper block p-8 sm:my-2 md:my-8 bg-white">
    <div class="form-group block mb-2">
      <div class="user-container my-4 sm:text-center md:text-left">
        <div class="flex sm:justify-center mb-3 md:hidden">
          <img src="@/assets/icons/Avatar.svg" alt="user avatar" />
        </div>
        <h4>
          Welcome {{_.get(customer, 'firstname')}} {{_.get(customer, 'lastname')}}
        </h4>
      </div>
      <div class="pin-container sm:text-center md:text-left">
        <label class="title position-relative mb-3 inter-font-family"
          :class="{ 'invalid-input': incompletePIN }"
          for="mobile-number">
          Enter PIN
        </label>
        <SequentialInput
          uniqueId="pin"
          :length="4"
          :inputHidden="true"
          :inValidPIN="inValidPIN"
          @keypress="onKeyPress"
          @done="onSubmit"
          @incomplete-input="incompletePIN = true"
          ref="confirmationPIN"
        />
        <p v-if="inValidPIN" class="my-3 error-text">
          Incorrect PIN. Please try again.
        </p>
        <small class="form-text forgot-pin my-2 cursor-pointer"
          @click="$emit('recover-pin')">
          Forgot PIN?
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import { loginWithPin } from '@/api/customerPIN.api';
import { pinVerificationWithOrderID } from '@/api/repledge.api';
import SequentialInput from '@/components/CommonComponents/SequentialInput.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  props: {
    validateInput: Function,
    getCodeBoxElement: Function,
  },
  data() {
    return {
      incompletePIN: false,
      inValidPIN: false,
      inValidPINCount: 3,
    };
  },
  components: {
    SequentialInput,
  },
  computed: {
    ...mapGetters({
      customer: 'auth/loggedInUser',
      pinToken: 'auth/pinToken',
      aadhaarVerificationStatus: 'renewal/aadhaarVerificationStatus',
    }),
    _() {
      return _;
    },
  },
  watch: {
    aadhaarVerificationStatus(value) {
      if (value && this.$route.path !== '/login') {
        this.pinVerificationWithOrderID();
      }
    },
  },
  methods: {
    onKeyPress(event) {
      this.validateInput(event);
      this.incompletePIN = false;
    },
    onSubmit(event, pin) {
      const hasLoginFlow = this.$route.path === '/login';
      this.eventTraking(hasLoginFlow ? 'login' : 'renewal');
      loginWithPin({ pin: pin.join('') })
        .then((response) => {
          if (response.status === 200) {
            localStorage.setItem('isLoggedIn', true);
            const eventProperties = {
              [events.EVENT_NAME]: events.PAYMENT_PIN_SETUP_SUCCESSFUL,
            };
            sendEvent(events.screen.PIN_CONFIRMATION, events.category.PAYMENT, eventProperties);
            this.$noty.success('Pin successfully verified');
            store.dispatch('auth/tempLogin', response);
            if (hasLoginFlow) {
              this.$router.push('/dashboard');
            } else {
              this.pinVerificationWithOrderID();
            }
          }
        })
        .catch(({ response: error }) => {
          this.inValidPIN = error.data.Error === 'E_INVALID_PIN';
          this.$refs.confirmationPIN.reSetPIN();
          this.inValidPINCount -= 1;
          if (this.inValidPINCount <= 0) {
            const eventProperties = {
              action: hasLoginFlow ? 'login' : 'renewal',
              eventName: events.PAYMENT_INVALID_PIN_ENTERED,
            };
            sendEvent(events.screen.PIN_CONFIRMATION, events.category.PAYMENT, eventProperties);
            if (!hasLoginFlow) {
              this.$emit('backToPreviousScreen');
            }
          }
        });
    },
    pinVerificationWithOrderID() {
      const orderId = this.$route.params.id;
      pinVerificationWithOrderID(orderId)
        .then((response) => {
          if (_.get(response, 'data.code') === 200
            && _.get(response, 'data.message') === 'Aadhar and PIN are Verified') {
            const path = `/otp-verification/${orderId}?redirected=success`;
            if (this.$route.path !== path) this.$router.push(path);
          }
        })
        .catch((error) => {
          this.$notify.error(error.message);
        });
    },
    eventTraking(type) {
      const eventProperties = {
        [events.EVENT_NAME]: events.PAYMENT_VALID_OVD_ENTERED,
        [events.PAYMENT_ACTION]: type,
      };
      sendEvent(events.screen.PIN_CONFIRMATION, events.category.PAYMENT, eventProperties);
    },
    reSetData() {
      this.incompletePIN = false;
      this.inValidPIN = false;
      this.inValidPINCount = 3;
      if (this.aadhaarVerificationStatus && this.$route.path !== '/login') {
        this.pinVerificationWithOrderID();
      }
    },
  },
  activated() {
    this.reSetData();
  },
};
</script>

<style lang="scss" scoped>
@import '@/scss/login.scss';
.user-container h4 {
  font-weight: 700;
}
.pin-login-wrapper {
  min-height: 50vh;
}
.pin-container {
  label.title {
    font-weight: 600;
    &.invalid-input {
      color: $theme-color;
    }
  }
}
.login-form-wrapper {
  max-width: 450px;
  height: 350px;
  &::v-deep .input-wrapper {
    input{
      position: relative;
      &::placeholder {
        position: absolute;
        top: 50%;
        height: 20px;
        font-size: 27px;
        transform: translateY(-40%);
        color: #788193;
      }
    }
  }
}
.forgot-pin {
  color: #EA5518;
  font-weight: 600;
  font-size: 12px;
}
</style>
