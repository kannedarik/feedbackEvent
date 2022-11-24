<template>
  <div class="excess-funding-alert py-3 mb-3 flex position-relative
    items-center justify-between cursor-pointer">
    <div class="flex items-center p-0">
      <div class="sm:mr-3 md:ml-2 pl-1 w-16">
        <img src="@/assets/excess_funding_alert.svg" alt="icon-info-colored" />
      </div>
      <div>
        <p class="bold-font mb-1">Immediate Attention Required!</p>
        <p class="small">
          Request you to pay back the extra amount to avoid additional charges.
          We apologise for the inconvenience.
        </p>
      </div>
    </div>
    <div class="col-3 text-center p-0">
      <button class="btn btn-primary-rupeek" @click="payExcessFunding">
        Pay Now
      </button>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex';

export default {
  name: 'listCustomerLoans',
  methods: {
    ...mapActions({
      setPaymentOption: 'loans/setPaymentOption',
    }),
    // function call for excess funding pay
    payExcessFunding() {
      this.setPaymentOption('hardrecovery');
      this.$router.push({ name: 'excessFunding' });
    },
  },
};
</script>
<style lang="scss">
@import "@/scss/components.scss";

.excess-funding-alert {
  background-color: #d1281e;
  color: $white-color;
  p {
    font-size: $base-font-size-mobile + px;
  }
  .small {
    font-size: $base-font-size-mobile - 3px;
  }
  .interest-percentage-pa {
    color: #d3d3d3;
  }
  .btn-excessfunding {
    font-size: $base-font-size-mobile + px;
    font-weight: $normal-font-weight;
    color: $light-blue-color;
    border-radius: 35px;
    background-color: $white-color;
    padding: 6px 9px;
    &:focus {
      box-shadow: none;
    }
  }
}
</style>
