<template>
  <div class="login-form-wrapper block p-8 my-3 bg-white">
    <h5 class="page-subtitle mb-4 inter-font-family info-sub">
      Complete your renewal by verifying your Aadhar number
    </h5>
    <Input
      inputId="aadhaar-number"
      :errorMessage="`${_.get(aadhaarInValidMessage, 'message')} <br />
        Please Try again ( ${_.get(aadhaarInValidMessage, 'remainingAttempts')} remaining )`"
      placeholder="****"
      inputMode="numeric"
      inputPattern="[0-9]*"
      :maxLength="4"
      :required="true"
      v-model="customer.aadhaar"
      :clearable="true"
      :autofocus="true"
      :onKeyPress="validateInput"
      :onBlur="onBlur"
      :hasShowErrorMessage="_.get(aadhaarInValidMessage, 'hasInvalidAadhaar')"
      :checkInput="(aadhaar) => aadhaar && aadhaar.length === 4"
    >
      <template #input-title>
        <span class="text-nowrap inter-font-family info-sub">
          <span>Enter
            <span class="highlighted">last 4 digits</span>
            of your Aadhar number
          </span>
        </span>
      </template>
      <template #input-label>
        <div class="text-nowrap ps-2 d-flex align-items-center">
          <span class="aadhaar-label">**** ****</span>
        </div>
      </template>
    </Input>
    <Input
      class="my-4"
      v-if="hasShowOTPContainer"
      title="Enter OTP"
      inputId="otp"
      :errorMessage="`${_.get(aadhaarOTPInValidMessage, 'message')} <br />
        Please Try again ( ${_.get(aadhaarOTPInValidMessage, 'remainingAttempts')} remaining )`"
      placeholder="****"
      inputMode="numeric"
      inputPattern="[0-9]*"
      :maxLength="4"
      :required="true"
      v-model="customer.otp"
      :autofocus="true"
      :onKeyPress="validateInput"
      :onBlur="onBlur"
      :hasShowErrorMessage="_.get(aadhaarOTPInValidMessage, 'hasInvalidOTP')"
      :checkInput="() => {}"
    >
      <template #input-title>
        <span class="text-nowrap ps-2">
          <span>Enter OTP</span>
        </span>
      </template>
      <template #footer>
        <div class="mt-3">
          <small id="mobile-number"
            class="form-text theme-secondary-color btn-sms-outline cursor-pointer"
            @click="getOTP('SMS')">
            Resend another OTP
          </small>
           <small class="form-text theme-secondary-color
           btn-sms-outline cursor-pointer mt-3"
           v-if="hasRewenalFlow"
            @click="getOTP('CALL')">
            Get OTP on call
          </small>
        </div>
      </template>
    </Input>
    <div class="form-cta-wrapper hidden md:block">
      <button class="btn bold-font btn-sign-in text-uppercase
        block theme-background mt-3" @click="continuePinValidate"
        :disabled="!customer.aadhaar || customer.aadhaar.length < 4"
        v-if="hasRewenalFlow && !hasReSetPIN">
          {{ $t("continue") }}
      </button>
      <button class="btn bold-font btn-sign-in text-uppercase
        block transition theme-background mt-3"
        :disabled="!customer.aadhaar || customer.aadhaar.length < 4"
        @click="getOTP('SMS')"
        v-else-if="!hasShowOTPContainer">
        Get OTP
      </button>
      <button class="btn bold-font btn-sign-in text-uppercase
        block theme-background mt-3"
        @click="setPIN"
        v-else-if="hasShowOTPContainer"
        :disabled="!customer.otp || customer.otp.length < 4">
        Set PIN
      </button>
    </div>
    <b-modal id="exit-modal" no-close-on-esc no-close-on-backdrop
      v-model="hasShowExitModal" size="sm" centered hide-header>
      Please try again
      <template #modal-footer>
        <div class="d-flex justify-content-end">
          <button class="btn-outline py-2 px-5" @click="moveToBack()">
            Yes
          </button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import Input from '@/components/CommonComponents/Input.vue';
import AadhaarVerification from '@/mixins/AadhaarVerification';

export default {
  components: {
    Input,
  },
  props: {
    validateInput: Function,
    hasRewenalFlow: Boolean,
    showOTPContainer: Boolean,
  },
  data() {
    return {
      customer: {},
      invalidAadhaar: false,
      invalidOTP: false,
      showOTPContainerInner: false,
      aadhaarFocus: false,
    };
  },
  mixins: [AadhaarVerification],
  activated() {
    this.customer = {};
  },
  watch: {
    customer(value) {
      this.$emit('aadhaarData', value);
    },
    showOTPContainerInner(value) {
      this.$emit('hasShowOTPContainerInner', value);
    },
  },
  computed: {
    hasShowOTPContainer() {
      return this.showOTPContainer || this.showOTPContainerInner;
    },
    ...mapGetters({
      aadhaarInValidMessage: 'renewal/aadhaarInValidMessage',
      aadhaarOTPInValidMessage: 'renewal/aadhaarOTPInValidMessage',
      hasReSetPIN: 'loans/hasReSetPIN',
      userInfo: 'auth/loggedInUser',
      hasShowExitModal: 'renewal/hasShowExitModal',
    }),
    _() {
      return _;
    },
  },
  methods: {
    onBlur(e, type) {
      e.stopPropagation();
      if (!e.target.value || e.target.value.length < 4) {
        if (type === 'aadhaar') {
          this.invalidAadhaar = true;
          this.aadhaarFocus = false;
        } else if (type === 'otp') this.invalidOTP = true;
      } else if (type === 'aadhaar') {
        this.invalidAadhaar = false;
        this.aadhaarFocus = false;
      } else if (type === 'otp') {
        this.invalidOTP = false;
      }
    },
    moveToBack() {
      store.dispatch('renewal/hasShowExitModal', false);
      this.$emit('backToPreviousScreen');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/scss/login.scss';

.aadhaar-label {
  font-size: 27px;
  height: 20px;
  letter-spacing: 2px;
  color: #A5ABB7;
}

.btn-sms-outline {
  font-weight: 600;
  font-size: 14px;
  text-decoration: underline;
}

.page-subtitle {
  color: #788193;
}
.info-sub {
  font-weight: 600;
  font-size: 14px;
}
.highlighted {
  color: $theme-color;
}
.login-form-wrapper {
  max-width: 450px;
  height: 400px;
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
</style>
