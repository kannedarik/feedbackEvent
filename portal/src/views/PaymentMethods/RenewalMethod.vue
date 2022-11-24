<template>
  <div>
    <paymentMethod
      v-on:makePayment="makePayment()">
    </paymentMethod>
  </div>
</template>

<script>
import _ from 'lodash';
import store from '@/store';
import { getPaymentMethods, getRpkId } from '@/api/payment.api';
import paymentMethod from './index.vue';

export default {
  name: 'paymentOptions',
  data() {
    return {
      // for storing available payment methods details
      paymentOptionDetails: [],
      // for storing VAN cards
      vanCards: [],
    };
  },
  components: { paymentMethod },
  methods: {
    // to send otp to the customer
    async fetchpaymentOptions(data) {
      try {
        const response = await getPaymentMethods(data);
        this.paymentOptionDetails = response.data;
        if (this.paymentOptionDetails && this.paymentOptionDetails.order
        && this.paymentOptionDetails.order.amount < 100) {
          this.makePayment();
        }
        const vanCardsList = this.paymentOptionDetails.methods.filter((key) => key.name === 'neft');
        this.vanCards = vanCardsList.length && vanCardsList[0].vandetails;
        const renewalFlow = {
          hasRenewalFlow: true,
          payableAmount: _.get(this.paymentOptionDetails, 'order.amount', 0),
          virtualAccount: this.vanCards.length ? this.vanCards : [],
          methods: [],
        };
        _.get(this.paymentOptionDetails, 'methods', []).forEach((method) => {
          renewalFlow.methods.push(method.name);
        });
        store.dispatch('renewal/hasSetRenewalFlow', renewalFlow);
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    async makePayment() {
      try {
        const response = await getRpkId(this.orderId);
        if (this.paymentOptionDetails && this.paymentOptionDetails.order
        && this.paymentOptionDetails.order.amount < 100) {
          if (this.paymentOptionDetails.order.hasLoanEnhancementLoans && this.paymentOptionDetails.order.signingstatus === 'success') {
            this.$router.push({ name: 'bankDetails', params: { id: this.orderId } });
          } else if (this.paymentOptionDetails.order.signingmethod.name === 'physical') {
            this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
          } else if (this.paymentOptionDetails.order.signingstatus === 'pending' && this.paymentOptionDetails.order.signingmethod.name === 'esign') {
            this.$router.push({ name: 'esignStatus', params: { id: this.$route.params.id } });
          } else if (this.paymentOptionDetails.order.signingstatus !== 'pending') {
            this.$router.push({ name: 'orderStatus', params: { orderId: this.orderId, id: response.data.data.link } });
          } else {
            this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
          }
        } else {
          this.$router.push({ name: 'paymentLink', params: { orderid: this.orderId, rpkid: response.data.data.link } });
        }
      } catch (error) {
        this.$noty.error(error.response.data.message);
      }
    },
  },
  mounted() {
    this.orderId = this.$route.params.id;
    this.fetchpaymentOptions(this.orderId);
  },
};
</script>
