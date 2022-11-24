<template>
<div>
  <div v-if="!showConfirmPIN" class="login-form-wrapper block p-8 sm:my-2 md:my-8 bg-white">
    <div class="block mb-24 sm:text-center md:text-left">
      <label for="set-pin">
        Setup 4 Digit PIN
      </label>
      <SequentialInput
        key="set-pin"
        uniqueId="set-pin"
        :length="4"
        @keypress="onKeyPress"
        @done="onPinSubmit"
        @incomplete-input="incompletePIN = true"
      />
      <InfoMessageWithTitle
        :infoMessage="infoMessage"
        class="mt-5 text-left info-message"
      />
    </div>
  </div>
  <div v-if="showConfirmPIN" class="login-form-wrapper block p-8 sm:my-2 md:my-8 bg-white">
    <div class="block mb-24 sm:text-center md:text-left">
      <label for="set-pin">
        Confirm 4 Digit PIN
      </label>
      <SequentialInput
        key="confirm-pin"
        uniqueId="confirm-pin"
        :length="4"
        @keypress="onKeyPress"
        @done="onConfirmPinSubmit"
        @incomplete-input="incompletePIN = true"
      />
      <InfoMessageWithTitle
        :infoMessage="infoMessage"
        class="mt-5 text-left info-message"
      />
    </div>
  </div>
  <b-modal id="exit-modal" no-close-on-esc no-close-on-backdrop
      v-model="invalidPIN" size="sm" centered hide-header hide-footer>
       PIN does not match. Please try again
    </b-modal>
</div>
</template>

<script>
import _ from 'lodash';
import { setPin } from '@/api/customerPIN.api';
import SequentialInput from '@/components/CommonComponents/SequentialInput.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import infoIcon from '@/assets/icons/info_icon.svg';

export default {
  components: {
    SequentialInput,
    InfoMessageWithTitle,
  },
  props: {
    validateInput: Function,
    getCodeBoxElement: Function,
  },
  data() {
    return {
      pin: [],
      validPIN: false,
      incompletePIN: false,
      showConfirmPIN: false,
      invalidPIN: false,
      timeout: 1000,
      timerId: null,
      infoMessage: {
        infoIcon,
        title: '',
        message: 'A 4-digit pin enables an additional level of security for our app\'s services',
        size: 'big',
        hasAuction: false,
      },
    };
  },
  watch: {
    invalidPIN(value) {
      if (value) {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
          this.showConfirmPIN = !value;
          this.$emit('showConfirmPIN', !value);
          this.invalidPIN = false;
        }, this.timeout);
      }
    },
  },
  methods: {
    setPIN(pin, token = null) {
      setPin({ pin, token })
        .then((response) => {
          if (response.status === 200) {
            this.showLoginPIN = true;
            this.$emit('pin-login');
          }
        })
        .catch(({ response: error }) => {
          this.$noty.error(error.data.UserMsg);
        });
    },
    onKeyPress(event) {
      this.validateInput(event);
      this.incompletePIN = false;
    },
    onPinSubmit(event, pin) {
      this.pin = pin;
      this.showConfirmPIN = true;
      this.$emit('showConfirmPIN', true);
    },
    onConfirmPinSubmit(event, confirmPin) {
      this.validPIN = this.pin.length && _.reduce(confirmPin, (prev, curr, idx) => (
        prev && curr === this.pin[idx]
      ), true);
      this.invalidPIN = !this.validPIN;
      if (this.validPIN) {
        this.setPIN(this.pin.join(''), localStorage.getItem('token') || null);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/scss/login.scss';
  .pin-set-wrapper {
    min-height: 50vh;
  }
</style>
