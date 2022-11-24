<template>
  <div class="login-form-wrapper block">
    <h2 class="bold-font text-uppercase mb-2 page-title theme-gradient-title">
      <span>
        Sign In
      </span>
    </h2>
    <Input
      title="Enter your mobile number"
      inputId="phoneNumber"
      placeholder="99999 99999"
      inputMode="numeric"
      inputPattern="[0-9]*"
      :maxLength="10"
      :required="true"
      v-model="phone"
      :clearable="true"
      :autofocus="true"
      :onKeyPress="validateInput"
      :onBlur="onBlur"
      :checkInput="(phoneNumber) => phoneNumber.length === 10"
    >
      <template #input-title>
        <span class="text-nowrap">
          <span>Enter your mobile number</span>
        </span>
      </template>
      <template #input-label>+91</template>
      <template #footer v-if="showOTPContainer">
        <small class="form-text theme-secondary-color float-right cursor-pointer"
          @click="changeNumber()">
          Change Number
        </small>
      </template>
    </Input>
    <Input
      v-if="showOTPContainer"
      title="Enter OTP"
      inputId="OTP"
      placeholder="****"
      inputMode="numeric"
      inputPattern="[0-9]*"
      :maxLength="4"
      :required="true"
      v-model="otp"
      :onKeyPress="validateInput"
      :onBlur="onBlur"
      :checkInput="() => {}"
    >
      <template #input-title>
        <span class="text-nowrap ps-2">
          <span>Enter OTP</span>
        </span>
      </template>
      <template #footer>
        <small
          id="mobile-number"
          class="
            form-text
            theme-secondary-color
            float-right
            cursor-pointer
          "
          @click="resendOTP"
        >Resend OTP</small>
      </template>
    </Input>
    <div class="form-cta-wrapper">
      <input
        type="button"
        class="
          btn
          bold-font
          btn-sign-in
          text-uppercase
          block
          transition
          theme-background
          mt-3
        "
        value="Get OTP"
        :disabled="!phone || phone.length !== 10"
        @click="getOTP"
        v-if="!showOTPContainer"
      />
      <input
        type="button"
        class="
          btn
          bold-font
          btn-sign-in
          text-uppercase
          block
          theme-background
          mt-3
        "
        value="Sign in"
        @click="onSubmit"
        v-if="showOTPContainer"
        :disabled="!otp || otp.length < 4"
      />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import store from '@/store';
import { mapActions, mapGetters } from 'vuex';
import getCustomerOTP from '@/api/customerOTP.api';
import Input from '@/components/CommonComponents/Input.vue';

export default {
  components: {
    Input,
  },
  props: {
    validateInput: Function,
  },
  data() {
    return {
      phone: '',
      otp: '',
      showOTPContainer: false,
      invalidInput: false,
      hasPINSet: false,
    };
  },
  computed: {
    ...mapGetters({
      quickLinksInfo: 'quickLinks/quickLinksInfo',
      userObj: 'auth/loggedInUser',
      partReleaseFeatureFlag: 'loans/partReleaseFeatureFlag',
    }),
  },
  activated() {
    this.phone = '';
    this.otp = '';
    this.showOTPContainer = false;
    this.invalidInput = false;
    this.hasPINSet = false;
  },
  methods: {
    ...mapActions({
      login: 'auth/login',
      fetchQuickLinks: 'quickLinks/fetchQuickLinks',
      getPartReleaseFeatureFlag: 'loans/getPartReleaseFeatureFlag',
    }),
    getOTP() {
      const requestBodyObj = {};
      requestBodyObj.phone = this.phone;
      getCustomerOTP(requestBodyObj)
        .then((response) => {
          if (response.status === 200) {
            this.showOTPContainer = true;
            this.$noty.success(response.data.UserMsg);
          }
        })
        .catch(() => {
          this.$noty.error(
            'Your details were not found, please contact us at 08039515252 if you think this is a mistake',
          );
        });
      return true;
    },
    changeNumber() {
      this.showOTPContainer = false;
      this.phone = '';
    },
    resendOTP() {
      this.otp = '';
      this.getOTP();
    },
    onBlur(e) {
      this.invalidInput = (e.target.value.length !== 10);
    },
    onSubmit(evt) {
      evt.preventDefault();
      const enteredOTP = this.otp;
      if (!this.otp) {
        this.$noty.error('Please enter the OTP and try again');
      } else {
        const requestBodyObj = {};
        requestBodyObj.phone = this.phone;
        requestBodyObj.otp = enteredOTP;
        this.login(requestBodyObj)
          .then((response) => {
            if (response.status === 200) {
              this.fetchQuickLinks();
              this.getPartReleaseFeatureFlag();
              this.hasPinSet = response.data.user.isPinSet;
              setTimeout(() => { this.checkTheFlow(); }, 1350);
            }
          })
          .catch((error) => {
            this.$noty.error(error.response.data.UserMsg
                || 'Your details were not found, please contact us at 08039515252 if you think this is a mistake');
          });
      }
    },
    checkTheFlow() {
      if (_.get(this.quickLinksInfo, 'hasActiveLoans')
        && this.partReleaseFeatureFlag['login-2fa']) {
        if (this.hasPinSet) this.$emit('pin-login');
        else this.$emit('set-pin');
      } else {
        localStorage.setItem('isLoggedIn', !_.get(this.userObj, 'firstname'));
        store.dispatch('auth/tempLogin');
        this.$router.push('/dashboard');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/scss/login.scss';
</style>
