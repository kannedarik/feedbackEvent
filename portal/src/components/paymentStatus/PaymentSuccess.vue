<template>
  <div>
    <div>
      <div class="payment-status flex justify-center items-center">
        <div class="text-center">
          <div class="checkmark-circle">
            <div class="background"></div>
            <div class="checkmark-icon draw"></div>
          </div>
          <h4 class="font-bold my-2 white-color">
            {{ $t(`${paymentSuccess.title}`) }}!
          </h4>
          <p v-if="paymentSuccess.type === 'hardrecovery'" class="mb-3 px-6 white-color">
            Payment Successful! You have successfully
            repaid the excess funding amount on your loan
          </p>
        </div>
      </div>
      <div :class="{'bg-white rounded-b-md pb-8 mb-10':
        (paymentSuccess.type === 'closing' && closingMessage)
        || paymentSuccess.type === 'part-release'
        || paymentMessages.length }">
        <PaymentSummaryCard :paymentSummaryInfo="paymentSummaryInfo"/>
        <MessagesBox v-if="((paymentSuccess.type === 'closing' && closingMessage
          && securedLoanClosed)
          || (paymentSuccess.type === 'part-release'))"
          :message="closingMessage"
          :staticMessages="staticMessages"
          class="info-message"/>
        <OutlineMessagesBox :messages="paymentMessages"
          v-if="paymentMessages.length" />
      </div>
    </div>
    <div class="footer-new">
      <Container>
        <div class="py-2 px-4 md:p-7 flex justify-between">
          <button class="btn-rounded-secondary text-base px-4"
          @click="backToHome()">
            Back to Home
          </button>
          <button class="btn-primary-rupeek text-base rounded-full px-4"
          @click="backToHome()">
            Repay other Loans
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import { getStaticMessageAPI } from '@/api/partRelease.api';
import Container from '@/components/CommonComponents/Container.vue';
import MessagesBox from '@/components/InfoMessagesBoxs/MessagesBox.vue';
import OutlineMessagesBox from '@/components/InfoMessagesBoxs/OutlineMessagesBox.vue';
import PaymentSummaryCard from './PaymentSummaryCard.vue';

export default {
  name: 'paymentSuccess',
  components: {
    Container,
    PaymentSummaryCard,
    MessagesBox,
    OutlineMessagesBox,
  },
  props: {
    paymentSuccess: {
      type: Object,
      required: true,
    },
    paymentSummaryInfo: {
      type: Array,
      required: false,
    },
    paymentMessages: {
      type: Array,
      required: false,
    },
    securedLoanClosed: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      closingMessage: '',
      staticMessages: {},
    };
  },
  methods: {
    getStaticMessages(identifierType) {
      getStaticMessageAPI(identifierType)
        .then((responses) => {
          this.staticMessages = responses.data.data[0].content;
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    backToHome() {
      this.$router.push('/dashboard');
    },
  },
  mounted() {
    this.closingMessage = this.paymentSuccess.type === 'closing'
      ? this.paymentSuccess.loandata[0].loan.workingDayResult.message : '';
    if (this.paymentSuccess.type === 'part-release') {
      this.getStaticMessages('part-release-status-gold-release');
    }
  },
};
</script>
<style scoped lang='scss'>
@import '@/scss/payment-success/payment-success.scss';
 .footer-new {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
}
</style>
