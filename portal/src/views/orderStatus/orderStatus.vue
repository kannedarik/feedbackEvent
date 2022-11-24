<template>
  <div id="orderStatus" class="row d-flex justify-content-center align-items-center">
    <div class="col-8 text-center">
      <img src="@/assets/icons/loader.svg" class="m-auto" />
      <p class="color-white">{{pollerData.message}}</p>
      <p>Please don't press back button or reload , this process may take a while.</p>
    </div>
  </div>
</template>

<script>
import { getorderStatus } from '@/api/payment.api';

export default {
  data() {
    return {
      // to store orderID
      orderId: '',
      // to store poller data
      pollerData: {},
    };
  },
  methods: {
    async fetchStatus() {
      try {
        const response = await getorderStatus(this.orderId);
        this.pollerData = response.data && response.data.order;
        if (!this.pollerData.poll) {
          if (this.pollerData.signingmethod.name === 'esign' && this.pollerData.paymentstatus === 'success') {
            if (this.pollerData.signingstatus !== 'pending') {
              this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
            } else {
              this.$router.push({ name: 'esignStatus', params: { id: this.orderId } });
            }
          } else {
            this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
          }
        } else {
          setTimeout(() => { this.fetchStatus(); }, 5000);
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
  },
  activated() {
    this.orderId = this.$route.params.orderId;
    this.fetchStatus();
  },
};
</script>

<style lang="scss" scoped>
#orderStatus {
  height: 100vh;
  background: rgba(255, 103, 0, 0.5);
}
</style>
