<template>
  <div class="block md:flex md:justify-between">
    <div class="mb-3">
      <label>{{ $t('lender')}}</label>
      <h5>
        <span class="lenders flex">
          <span class="icon icon-small mr-2">
            <img :src="lendersConfig[loan.lender].iconLink" :alt="loan.lender"/>
          </span>
          <span>{{lendersConfig[loan.lender].name}}</span>
        </span>
      </h5>
    </div>
    <div class="mb-3">
      <label>{{$t('loan_amount')}}</label>
      <h5 class="font-semibold">
        {{ loan.loanAmount ? formatRupeeAmount(loan.loanAmount) : "0" }}
      </h5>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'LenderLoanAmountCard',
  props: {
    loan: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  methods: {
    formatRupeeAmount,
  },
};
</script>
