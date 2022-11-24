<template>
  <div class="block">
    <PublicHeader />
    <section class="payment-login-wrapper block
      section-seperator" :class="{'d-flex main-container' : showSignIn}">
      <div class="container margin-auto" v-if="showSignIn">
        <h1 class="text-center bold-font text-2xl
          page-title theme-gradient-title page-heading mb-5">
          Repay your Gold Loan <span>In 3 Simple Steps</span>
        </h1>
        <div class="display-flex flex-direction-column-mobile sign-in-wrapper">
          <div v-if="showSignIn" class="flex-1 d-none d-xs-none d-md-block">
            <section class="contact-support block display-flex">
              <div class="d-flex align-items-center otp-login-wrapper
                text-center payment-page-login-gif block">
                <h2 class="text-center bold-font text-uppercase mb-3
                  page-title theme-gradient-title">
                  STEPS TO SIGN in
                </h2>
                <img src="~@/assets/login-page/otp-login.gif"
                  class="img-responsive block" id="login-gif"
                />
              </div>
              <div class="enach-details margin-auto">
                <div class="enach-logo-wrapper text-center margin-bottom-15px">
                  <img
                    src="~@/assets/login-page/enach.svg"
                    class="img-responsive"
                    alt=""
                  />
                </div>
                <h2
                  class="
                    text-center
                    bold-font
                    section-padding-20px
                    page-title
                    theme-gradient-title
                  "
                >
                  <span>Introducing 1-Click Pay</span><br />
                  with E-NACH
                </h2>
                <div
                  class="
                    display-flex
                    flex-justify-content-space-between
                    margin-bottom-20px
                  "
                >
                  <div class="info text-center">
                    <img
                      src="~@/assets/login-page/1click.svg"
                      class="img-responsive"
                      alt=""
                    />
                    <h5>1 Click Pay</h5>
                  </div>
                  <div class="info text-center">
                    <img
                      src="~@/assets/login-page/NoPay.svg"
                      class="img-responsive"
                      alt=""
                    />
                    <h5>
                      No Payment<br />
                      Failures
                    </h5>
                  </div>
                  <div class="info text-center">
                    <img
                      src="~@/assets/login-page/Password.svg"
                      class="img-responsive"
                      alt=""
                    />
                    <h5>
                      No More<br />
                      Passwords
                    </h5>
                  </div>
                </div>
                <div class="know-more block text-center">
                  <router-link
                    to="/about/faq#enach"
                    class="transition"
                    target="_blank"
                  >
                    <span>Know More</span>
                    <font-awesome-icon
                      :icon="['fas', 'arrow-right']"
                    ></font-awesome-icon>
                  </router-link>
                </div>
              </div>
            </section>
          </div>
          <div class="flex-1 d-flex bg-white login-container">
            <section class="m-auto">
              <MobileContainer
                :validateInput="validateInput"
                @pin-login="showPinLoginScreen"
                @set-pin="showSetPinScreen"
              />
            </section>
          </div>
        </div>
      </div>
      <SetPINContainer
        v-if="showPINContainer"
        :validateInput="validateInput"
        @pin-login="showPinLoginScreen"
        @show-login="showLogin"
      />
      <LoginPINContainer
        v-if="showLoginPIN"
        :validateInput="validateInput"
        @recover-pin="showRecoverPinScreen"
        @show-login="showLogin"
      />
      <AadhaarContainer
        :validateInput="validateInput"
        v-if="showAadhaarContainer"
        @set-pin="showSetPinScreen"
        @pin-login="showPinLoginScreen"
      />
    </section>
    <Footer v-if="showSignIn" />
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';
import store from '@/store';

export default {
  name: 'Login',
  components: {
    AadhaarContainer: () => import('@/views/IdentityVerification/index.vue'),
    Footer: () => import('@/components/Footer/PublicFooter.vue'),
    LoginPINContainer: () => import('@/views/PINConfirmation/index.vue'),
    MobileContainer: () => import('@/components/MobileNumberContainer/MobileContainer.vue'),
    PublicHeader: () => import('@/components/header/PublicHeader.vue'),
    SetPINContainer: () => import('@/views/SetPIN/index.vue'),
  },
  data() {
    return {
      form: {},
      customer: {
        pin: [],
        confirmPin: [],
      },
      showSignIn: true,
      showPINContainer: false,
      invalidInput: false,
      haveActiveLoans: true,
      showLoginPIN: false,
      showAadhaarContainer: false,
      validPIN: false,
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      username: {
        required,
        minLength: minLength(3),
      },
      password: {
        required,
        minLength: minLength(4),
      },
    },
  },
  activated() {
    this.reSetData();
    store.dispatch('data/resetState');
    store.dispatch('loans/resetState');
    store.dispatch('jewels/resetState');
    store.dispatch('renewal/resetState');
    store.dispatch('quickLinks/resetState');
    store.dispatch('releaseSlotBooking/resetState');
  },
  methods: {
    validateInput(e) {
      this.invalidInput = false;
      const regex = new RegExp('^[0-9]+$');
      const str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (regex.test(str)) {
        return true;
      }
      e.preventDefault();
      return false;
    },
    showSigninScreen() {
      this.showSignIn = true;
      this.showPINContainer = false;
      this.showLoginPIN = false;
      this.showAadhaarContainer = false;
    },
    showSetPinScreen() {
      this.showSignIn = false;
      this.showPINContainer = true;
      this.showLoginPIN = false;
      this.showAadhaarContainer = false;
    },
    showPinLoginScreen() {
      this.showSignIn = false;
      this.showPINContainer = false;
      this.showLoginPIN = true;
      this.showAadhaarContainer = false;
    },
    showRecoverPinScreen() {
      this.showSignIn = false;
      this.showPINContainer = false;
      this.showLoginPIN = false;
      this.showAadhaarContainer = true;
    },
    showLogin() {
      this.showSignIn = true;
      this.showPINContainer = false;
      this.showLoginPIN = false;
      this.showAadhaarContainer = false;
    },
    reSetData() {
      this.form = {};
      this.customer = {
        pin: [],
        confirmPin: [],
      };
      this.showSignIn = true;
      this.showPINContainer = false;
      this.invalidInput = false;
      this.haveActiveLoans = true;
      this.showLoginPIN = false;
      this.showAadhaarContainer = false;
      this.validPIN = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/scss/login.scss";
</style>
