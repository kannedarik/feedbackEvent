<template>
  <div class="flex-1 sm:px-3 sm:py-4 md:px-4 md:py-6 current-loan inter-font-family">
    <h5 class="mb-3 text-center text-sm font-semibold type-secondary">
      {{$t(`${type}`)}}
    </h5>
    <div class="loan-amount-card sm:px-3 sm:py-4 md:p-7 shadow-none bg-white
      md:flex md:justify-between">
      <div>
        <p class="mb-2 type-tertiary">
          {{$t('total_loan_amount')}}
        </p>
        <h5 class="font-semibold text-sm">
          {{formatRupeeAmount(getLoanAmount(loanDetails))}}
        </h5>
      </div>
      <button class="btn btn-primary-rupeek mt-2" @click="modifyLoanAmt(getTopUpInfo)"
        v-if="checkShowGetTopUP">
        Get Top up
      </button>
    </div>
    <div class="loan-card sm:px-3 sm:py-4 w-100 md:p-7" v-if="totalJewelsCount">
      <label class="mb-2">
        {{$t('number_of_gold_jewels')}}
      </label>
      <div class="flex justify-between">
        <h5 class="font-semibold">
          {{totalJewelsCount}}
        </h5>
        <button class="btn-transparent" v-if="type === 'new_loan'"
          @click="viewRemaingGold()">
        {{ $t('view_gold') }}
      </button>
      </div>
    </div>
    <div class="loan-card sm:px-3 sm:py-4 w-100 md:p-7">
      <div v-for="(loan, loanIndex) in loanDetails" :key="loanIndex"
        class="clearfix">
        <div class="mb-3 border" v-if="loan.type === 'unsecure' && loan.loanAmount > 0"></div>
        <LenderLoanAmountCard :loan="loan" />
        <div
          v-if="loan.type === 'unsecure' || (loanDetails.length === 1 && loan.type === 'secure')">
          <label>{{$t('interest_rate_post_rebate')}}</label>
          <h5 class="font-semibold">
            {{
              toMonthlyInterestRate(_.get(loan, 'schemes.interestCalculation.interestRate'))
                || '--'
            }}% p.m.
            <br class="block md:hidden"/>
            <small class="normal-font interest-rate-text-small">
              ({{_.get(loan, 'schemes.interestCalculation.interestRate','-')}}% p.a.)
            </small>
          </h5>
           <span class="interest-rate-text" v-if="loan.schemeMessage">
             {{loan.schemeMessage}}
           </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { formatRupeeAmount, toMonthlyInterestRate } from '@/utils/string';
import LenderLoanAmountCard from './LenderLoanAmountCard.vue';

export default {
  name: 'LoanSummary',
  components: {
    LenderLoanAmountCard,
  },
  props: {
    loanDetails: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    totalJewelsCount: {
      type: Number,
    },
  },
  computed: {
    _() {
      return _;
    },
    getTopUpInfo() {
      let topUpLoanInfo = {};
      if (this.checkShowGetTopUP) {
        this.loanDetails.forEach((loan) => {
          if (loan.type === 'secure') {
            topUpLoanInfo = loan.items;
          }
        });
      }
      return topUpLoanInfo;
    },
    checkShowGetTopUP() {
      let hasShowGetTopUp = false;
      this.loanDetails.forEach((loan) => {
        if (loan.type === 'secure') {
          hasShowGetTopUp = _.get(loan, 'hasShowGetTopUp', false);
        }
      });
      return hasShowGetTopUp;
    },
  },
  methods: {
    formatRupeeAmount,
    toMonthlyInterestRate,
    // for getting total loan amount
    getLoanAmount(loan) {
      return _.sumBy(loan, (key) => key.loanAmount);
    },
    modifyLoanAmt(loan) {
      this.$emit('modifyLoanAmt', loan);
    },
    viewRemaingGold() {
      this.$emit('viewRemainingJewels', _.get(this.loanDetails[0], 'newLoanJewels', []));
    },
  },
};
</script>
