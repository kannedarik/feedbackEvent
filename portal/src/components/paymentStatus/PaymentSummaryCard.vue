<template>
  <div class="relative payment-details w-11/12 py-3 px-5 md:w-4/6 md:px-7 text-center">
    <div v-for="(summary, index) in paymentSummaryInfo" :key="index" class="py-2">
      <div class="text-sm pay-info" v-if="!summary.hasNotAmount">
        <p class="inter-font-family medium-font-weight">
          {{ $t(summary.type) }}
        </p>
        <p class="font-bold inter-font-family paid-amount mt-2">
          {{ formatRupeeAmount(summary.value) }}
        </p>
      </div>
      <div class="text-sm pay-info" v-else>
        <span class="inter-font-family"
          :class="{'paid-date' : summary.type === 'paid_on'}">
          {{ $t(summary.type) }}
        </span>
        <span class="ml-1 inter-font-family value medium-font-weight"
          :class="{'paid-date' : summary.type === 'paid_on'}">
          {{ summary.value }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'PaymentSummaryCard',
  props: {
    paymentSummaryInfo: {
      type: Array,
      required: true,
    },
  },
  methods: {
    formatRupeeAmount,
  },
};
</script>
<style scoped lang='scss'>
.payment-details {
  position: relative;
  margin: auto;
  top: -30px;
  background-color: #fff;
  box-shadow: 0px 3.4103px 11.3677px rgba(0, 0, 0, 0.0705882);
  border-color: #fff;
  border-radius: 12px;
  .pay-info {
    font-size: 14px;
    color: #788193;
    .paid-date {
      font-size: 12px;
    }
    .value {
      color: #4B576F;
      &.paid-date {
        color: #1E2D4B;
      }
    }
    .paid-amount {
      color: #5DA513;
      font-size: 24px;
    }
  }
}
</style>
