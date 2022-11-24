<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-new-bg'">
        <div class="header-main p-6 mt-2">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
                class="cursor-pointer" @click="backToHome()"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-3">
              <h2 class="font-semibold text-lg">
                {{$t('identity_verification')}}
              </h2>
            </div>
          </div>
        </div>
        <div class="flex justify-center height-100vh sm:bg-white-color">
          <AadhaarContainer
            :validateInput="validateInput"
            :hasRewenalFlow="hasRewenalFlow"
            @set-pin="showSetPinScreen"
            :showOTPContainer="showOTPContainerInner"
            v-on:aadhaarData="aadhaarData($event)"
            @:hasShowOTPContainerInner="hasShowOTPContainerInner($event)"
            v-on:backToPreviousScreen="backToHome()"
          />
        </div>
      </Container>
    </div>
     <div class="footer-new block md:hidden">
      <Container>
        <div class="py-2 px-4 md:p-7 text-center">
          <button class="btn btn-primary-rupeek w-10/12"
          @click="continuePinValidate"
          :disabled="!customer.aadhaar || customer.aadhaar.length < 4"
          v-if="hasRewenalFlow && !hasReSetPIN">
            {{ $t("continue") }}
          </button>
          <button class="btn btn-primary-rupeek w-10/12"
            :disabled="!customer.aadhaar || customer.aadhaar.length < 4"
            @click="getOTP('SMS')"
            v-else-if="!hasShowOTPContainer">
            Get OTP
          </button>
          <button class="btn btn-primary-rupeek w-10/12"
            @click="setPIN"
            v-else-if="hasShowOTPContainer"
            :disabled="!customer.otp || customer.otp.length < 4">
            Set PIN
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import AadhaarContainer from '@/components/AadharContainer/AadhaarContainer.vue';
import AadhaarVerification from '@/mixins/AadhaarVerification';

export default {
  name: 'IdentityVerification',
  components: {
    Container,
    AadhaarContainer,
  },
  data() {
    return {
      showOTPContainerInner: false,
      invalidInput: false,
      customer: {},
      hasRewenalFlow: false,
      hasShowOTPBtn: false,
    };
  },
  beforeRouteEnter(to, from, next) {
    store.dispatch('loans/haspreviousURLName', from.name);
    next();
  },
  mixins: [AadhaarVerification],
  activated() {
    this.hasRewenalFlow = this.$route.path !== '/login';
    if (this.hasRewenalFlow) {
      this.getAadharVerificationStatus();
    }
  },
  computed: {
    hasShowOTPContainer() {
      return this.hasShowOTPBtn || this.showOTPContainerInner;
    },
    ...mapGetters({
      userInfo: 'auth/loggedInUser',
      hasReSetPIN: 'loans/hasReSetPIN',
      haspreviousURLName: 'loans/haspreviousURLName',
    }),
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
    backToHome() {
      if (this.$route.path === '/login') {
        this.$emit('pin-login');
      } else if (this.haspreviousURLName === 'statusCardComponent') {
        this.$router.push({ name: 'statusCardComponent' });
      } else {
        this.$router.go(-1);
      }
    },
    aadhaarData(data) {
      this.customer = data;
    },
    showSetPinScreen() {
      this.$emit('set-pin');
    },
    hasShowOTPContainerInner(data) {
      this.hasShowOTPBtn = data;
    },
  },
};
</script>
<style lang='scss'>
.height-100vh {
  height: 100vh;
}
.footer-new {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
