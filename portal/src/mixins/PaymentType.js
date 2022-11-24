export default {
  methods: {
    checkPaymentOption() {
      if (!this.paymentOption) {
        this.$router.push('/dashboard');
      }
    },
  },
};
