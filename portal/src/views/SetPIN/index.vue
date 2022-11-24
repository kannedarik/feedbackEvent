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
              {{ hasShowConfirmPIN
                ? $t('pin_confirm')
                : $t('pin_setup')
              }}
            </h2>
          </div>
        </div>
      </div>
      <div class="flex justify-center height-100vh sm:bg-white-color">
        <SetPINContainer
          :validateInput="validateInput"
          :hasRewenalFlow="hasRewenalFlow"
          @pin-login="showPinLoginScreen"
          @showConfirmPIN="showConfirmPIN($event)"
        />
      </div>
    </Container>
  </div>
</template>
<script>
import Container from '@/components/CommonComponents/Container.vue';
import SetPINContainer from '@/components/SetPinContainer/SetPINContainer.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  name: 'SetPIN',
  components: {
    Container,
    SetPINContainer,
  },
  data() {
    return {
      showOTPContainer: false,
      invalidInput: false,
      customer: {},
      hasRewenalFlow: false,
      hasShowConfirmPIN: false,
    };
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
        this.$emit(this.hasShowConfirmPIN ? 'set-pin' : 'show-login');
      } else {
        this.$router.go(-1);
      }
    },
    showPinLoginScreen() {
      if (this.$route.path === '/login') {
        this.$emit('pin-login');
      } else {
        this.$router.push(`/PIN-Confirmation/${this.$route.params.id}`);
      }
    },
    showConfirmPIN(data) {
      this.hasShowConfirmPIN = data;
    },
    eventTraking() {
      const eventProperties = {
        [events.EVENT_NAME]: events.PAYMENT_PIN_SETUP_INITIATED,
      };
      sendEvent(events.screen.SET_PIN, events.category.PAYMENT, eventProperties);
    },
  },
  activated() {
    this.eventTraking();
    this.hasRewenalFlow = this.$route.path !== '/login';
  },
};
</script>
<style lang='scss'>
.height-100vh {
  height: 100vh;
}
</style>
