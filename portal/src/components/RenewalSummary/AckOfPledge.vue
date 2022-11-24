<!-- eslint-disable max-len -->
<template>
  <Container class="information">
    <section class="block">
      <div>
        <div class="py-3 sm:mx-3 md:mx-8 flex justify-between items-center br">
          <h3 class="bold-font">Acknowledgement of pledge</h3>
          <img src="@/assets/close_icon_grey.svg" alt="close icon"
            @click="docVerificationModal">
        </div>
        <div class="sm:px-3 md:px-8 loan-selection__actions ack-image">
          <img v-if="signMethods.length === 1 && signMethods[0].name === 'physical'"
            src="@/assets/renewal_ack1.svg"
            alt="doc verification"
            class="w-full md:w-auto m-auto"
          />
          <img v-else
            src="@/assets/renewal_ack_2.png"
            alt="doc verification"
            class="w-full md:w-auto m-auto"
          />
        </div>
      </div>
      <div class="p-3 footer block text-right position-relative white-background d-flex"
        :class="{'justify-content-between': signMethods.length > 1, 'justify-content-end': signMethods.length === 1}">
        <button class="btn" v-for="(signMethod, index) in signMethods"
          :class="{'btn-light bold-font': signMethods.length > 1 && index === 0,
          'btn-primary-rupeek width-166 rounded': signMethods.length === 1 || index === 1}"
          :key="signMethod.id" @click="registerSignMethod(signMethod)">
          Sign via
          <span v-if="signMethod.name === 'digital'
            || signMethod.name === '2fa' ">OTP</span>
          <span v-else-if="signMethod.name === 'esign'">Esign</span>
          <span v-else>Offline</span>
        </button>
      </div>
    </section>
  </Container>
</template>
<script>
import {
  fetchSignMethodsBasedOnOrderIdStatusCard,
  registerSignMethodBasedOnOrderId,
} from '@/api/repledge.api';
import Container from '@/components/CommonComponents/Container.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  name: 'ackComponent',
  data() {
    return {
      signMethods: [],
    };
  },
  props: {
    orderId: {
      type: String,
    },
    from: {
      type: String,
    },
    paymentStatus: {
      type: Boolean,
    },
    statusCards: {
      type: Boolean,
    },
  },
  components: {
    Container,
  },
  methods: {
    // for fetching sign methods based on orderid
    fetchSignMethods(orderId) {
      const data = {
        orderId,
      };
      if (this.statusCards) {
        data.source = '?source=statuscard';
      }
      fetchSignMethodsBasedOnOrderIdStatusCard(data)
        .then((response) => {
          const methodsList = [];
          response.data.methods.forEach((element) => {
            methodsList.push(element.name);
          });
          if (response.data.methods[0].name !== 'physical' && !methodsList.includes('2fa')) {
            this.signMethods = response.data.methods.reverse();
          } else {
            this.signMethods = response.data.methods;
          }
          if (this.signMethods.length === 3 && this.signMethods[0].name === 'physical') {
            this.signMethods.shift();
          }
          if (methodsList.includes('2fa')) {
            this.eventTraking(true);
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    // registering the selected sign method
    registerSignMethod(selectedSignMethod) {
      this.docVerificationModal();
      if (selectedSignMethod.name === '2fa') {
        this.eventTraking(false);
      }
      if (this.from === 'statuscard' && this.paymentStatus && selectedSignMethod.name === 'physical') {
        this.$router.push(`/payment-status/${this.orderId}`);
      } else {
        registerSignMethodBasedOnOrderId(this.orderId, selectedSignMethod)
          .then((response) => {
            if (response.status === 200) {
              this.trackSigningMethodSelection(selectedSignMethod);
              if (selectedSignMethod.name === 'digital') {
                if (this.from === 'statuscard') {
                  this.$router.push(`/otp-verification/${this.orderId}?redirected=success`);
                } else {
                  this.$router.push(`/otp-verification/${this.orderId}`);
                }
              } else if (selectedSignMethod.name === 'physical') {
                this.$router.push(`/payment-options/${this.orderId}`);
              } else if (selectedSignMethod.name === '2fa') {
                this.$router.push(`/identity-verification/${this.orderId}`);
              } else {
                this.$router.push(`/esign-ack/${this.orderId}`);
              }
            }
          })
          .catch((error) => {
            this.$noty.error(error.message);
          });
      }
    },
    trackSigningMethodSelection(selectedSignMethod) {
      if (this.from === 'summary') {
        let eventProperty = '';
        if (selectedSignMethod.name === 'digital') {
          eventProperty = events.SIGNING_VIA_OTP_CLICKED;
        } else if (selectedSignMethod.name === 'esign') {
          eventProperty = events.SIGNING_VIA_ESIGN_CLICKED;
        } else {
          eventProperty = events.SIGNING_VIA_OFFLINE_CLICKED;
        }

        const properties = {
          [events.EVENT_NAME]: eventProperty,
          [events.PAYMENT_ACTION]: 'repledge',
        };
        sendEvent(events.screen.ACK_OF_PLEDGE, events.category.PAYMENT, properties);
      }
    },
    // hide doc verification modal
    docVerificationModal() {
      this.$emit('closedocVerificationModal', false);
    },
    eventTraking(hasViewd) {
      const eventProperties = {
        [events.EVENT_NAME]: hasViewd
          ? events.PAYMENT_VIA_OTP_REATTEMPT_VIEWED
          : events.PAYMENT_VIA_OTP_REATTEMPT_CLICKED,
      };
      sendEvent(events.screen.ACK_OF_PLEDGE, events.category.PAYMENT, eventProperties);
    },
  },
  mounted() {
    this.fetchSignMethods(this.orderId);
  },
};
</script>
<style lang="scss">
@import "@/scss/repledge/repledge.scss";
.information {
  position: fixed !important;
  z-index: 9999;
  width: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  .br {
    border-radius: 16px 16px 0px 0px;
  }
}
.rounded {
  border-radius: 60px !important;
}
</style>
