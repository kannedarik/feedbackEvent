<template>
  <div class="payments-body h-auto overflow-hidden">
    <Container :screenType="'body-new-bg'">
      <div class="header-main p-6 mt-2">
        <div class="md:flex md:items-center">
          <div>
            <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="backToHome()"/>
          </div>
          <div class="sm:mt-3 md:mt-0 md:ml-3">
            <h2 class="font-semibold text-lg">
              {{$t('pin_confirmation')}}
            </h2>
          </div>
        </div>
      </div>
      <div class="flex justify-center height-100vh sm:bg-white-color">
        <LoginPINContainer
          :validateInput="validateInput"
          @recover-pin="showRecoverPinScreen"
          v-on:backToPreviousScreen="backToHome()"
        />
      </div>
    </Container>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import LoginPINContainer from '@/components/LoginPINContainer/LoginPINContainer.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  name: 'PINConfirmation',
  components: {
    Container,
    LoginPINContainer,
  },
  data() {
    return {
      invalidInput: false,
    };
  },
  activated() {
    this.setHasPinKeyInStore();
  },
  computed: {
    ...mapGetters({
      aadhaarVerificationStatus: 'renewal/aadhaarVerificationStatus',
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
        this.$emit('show-login');
      } else if (this.aadhaarVerificationStatus
        && this.haspreviousURLName === 'statusCardComponent') {
        this.$router.push({ name: 'statusCardComponent' });
      } else if (this.haspreviousURLName === 'paymentStatus') {
        this.$router.push({ name: 'paymentStatus', params: { orderid: this.$route.params.id } });
      } else {
        this.$router.go(-1);
      }
    },
    showRecoverPinScreen() {
      const hasLoginFlow = this.$route.path === '/login';
      const eventProperties = {
        [events.EVENT_NAME]: events.PAYMENT_CLICKED_ON_FORGOT_PIN,
        [events.PAYMENT_ACTION]: hasLoginFlow ? 'login' : 'renewal',
      };
      sendEvent(events.screen.PIN_CONFIRMATION, events.category.PAYMENT, eventProperties);
      if (hasLoginFlow) {
        this.$emit('recover-pin');
      } else {
        store.dispatch('loans/reSetPIN', true);
        this.$router.push(`/identity-verification/${this.$route.params.id}`);
      }
    },
    setHasPinKeyInStore() {
      store.dispatch('loans/reSetPIN', false);
    },
  },
};
</script>
<style lang='scss'>
.height-100vh {
  height: 100vh;
}
</style>
