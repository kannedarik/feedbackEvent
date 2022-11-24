<template>
  <div class="w-1/2 sm:px-3 sm:py-3 md:p-5 current-loan">
    <h4 class="ml-2 mb-4 font-semibold">
      {{$t(`${type}`)}}
    </h4>
    <div class="loan-card sm:px-3 sm:py-3 md:p-4 shadow-none">
      <label>{{$t('total_loan_amount')}}</label>
      <h5 class="font-bold">
        {{formatRupeeAmount(getLoanAmount(loanDetails))}}
      </h5>
    </div>
    <div class="loan-card sm:px-3 sm:py-3 md:p-4 shadow-none" v-if="totalJewelsCount">
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
    <div class="loan-card">
      <div v-for="(loan, index) in loanDetails" :key="index"
        :class="[`${type === 'current_loan'? 'old-loan' : 'new-loan'}`]">
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <div class="border mb-4 loan" v-if="loan.type === 'unsecure'"></div>
          <label>{{$t('lender')}}</label>
          <h5 class="font-semibold">
            <span class="lenders flex">
              <span class="icon icon-small">
                <img :src="lendersConfig[loan.lender].iconLink" :alt="loan.lender"/>
              </span>
              <span>{{lendersConfig[loan.lender].name}}</span>
            </span>
          </h5>
        </div>
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <label>{{$t('loan_amount')}}</label>
          <h5 class="font-semibold">
            {{ loan.loanAmount ? formatRupeeAmount(loan.loanAmount) : '0'}}
          </h5>
        </div>
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <label>{{$t('loan_date')}}</label>
          <h5 class="font-semibold">
            {{moment(loan.loanDate).format('DD/MM/YYYY')}}
          </h5>
        </div>
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <label>{{ $t('Tenure')}}</label>
          <h5 class="font-semibold">
            {{ loan.schemes.tenure }} {{ $t('months')}}
          </h5>
        </div>
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <label>{{$t('scheme_name')}}</label>
          <h5 class="font-semibold">
            {{getSchemeName(loan.schemes.baseSchemes, loan.type) }}
          </h5>
        </div>
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <label>{{$t('interest_rate')}}</label>
          <h5 class="font-semibold">
            {{ toMonthlyInterestRate(_.get(loan, 'schemes.interestCalculation.interestRate')) }}%
            <small v-if="!loan.hasShowPerAnnum">
              {{$t('per_month')}}
            </small>
            <small class="normal-font interest-rate-text-small" v-else>
              P.M ({{_.get(loan, 'schemes.interestCalculation.interestRate', '-')}}% P.A)
            </small>
            <br />
            <span class="font-small interest-rate-text"
              v-if="_.get(loan, 'schemes.interestCalculation.type') === 'jumping'">
              {{  _.get(loan, 'schemeMessage')
                ? _.get(loan, 'schemeMessage') : 'Starting interest Rate*'
              }}
            </span>
          </h5>
        </div>
        <div class="sm:px-3 sm:py-3 md:p-4 loan">
          <label>{{$t('interest_type')}}</label>
          <h5 class="font-semibold text-capitalize">
            {{loan.schemes.interestCalculation.interestType}} Interest
          </h5>
        </div>
        <div class="slab-container d-table w-full loan"
          v-if="getJumpingSchedule(loan.schemes.baseSchemes, loan.type).length !== 0">
          <p class="sm:px-3 sm:py-3 md:p-4 text-center">
            *Slab applied if interest paid within every
          </p>
          <div class="flex sm:px-3 sm:py-3 md:p-4 slab-rate font-semibold slab-header">
            <div class="w-1/3 sm:px-2 md:px-6">Days</div>
            <div class="w-1/3">ROI P.M</div>
            <div class="w-1/3">ROI P.A</div>
          </div>
          <div class="flex sm:px-3 sm:py-3 md:p-4 slab-rate"
            v-for='(scheme, sIndex) of getJumpingSchedule(loan.schemes.baseSchemes, loan.type)'
            :key='sIndex'>
            <div class="w-1/3 sm:px-2 md:px-6 days">
              <span>
                {{scheme.toDay ? scheme.toDay : scheme.formDay}}
              </span>
            </div>
            <div class="w-1/3 font-bold interest-percent">
              {{toMonthlyInterestRate(scheme.interestRate)}}%
            </div>
            <div class="w-1/3 font-bold interest-percent">
              {{scheme.interestRate}}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import { formatRupeeAmount, toMonthlyInterestRate } from '@/utils/string';

export default {
  name: 'LoanSummary',
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
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  methods: {
    formatRupeeAmount,
    toMonthlyInterestRate,
    moment: (date) => moment(date),
    // for getting total loan amount
    getLoanAmount(loan) {
      let totalLoanAmount = 0;
      loan.map((key) => {
        totalLoanAmount += key.loanAmount;
        return true;
      });
      return totalLoanAmount;
    },
    // function call to get the scheme name
    getSchemeName(baseSchemes, type) {
      let schemeName = '--';
      baseSchemes.map((scheme) => {
        if (scheme.type === type) {
          schemeName = scheme.legalName;
        }
        return true;
      });
      return schemeName;
    },
    // function call tie get jumping schedule details
    getJumpingSchedule(baseSchemes, type) {
      let jumpingSchedule = [];
      baseSchemes.map((schemes) => {
        if (schemes.type === 'secure' && type === 'secure' && schemes.addons.length !== 0) {
          schemes.addons.map((addons) => {
            if (addons.type === 'jumping') {
              jumpingSchedule = addons.interestSlabs;
            }
            return true;
          });
        } else if (schemes.interestCalculation.type === 'jumping' && type === 'unsecure') {
          jumpingSchedule = schemes.interestCalculation.interestSlabs;
        }
        return true;
      });
      return jumpingSchedule;
    },
    viewRemaingGold() {
      this.$emit('viewRemainingJewels', _.get(this.loanDetails[0], 'newLoanJewels', []));
    },
  },
};
</script>
<style scoped lang='scss'>
.old-loan {
  .loan {
    &:nth-child(even) {
      background: #FAFAFA;
    }
    &:last-child() {
      border-radius: 7px;
    }
  }
}
.new-loan {
  .loan:nth-child(even) {
    background: #FFF6EC;
  }
}
.slab-container {
  .slab-rate {
    &:nth-child(odd) {
      background: #FFFF;
    }
  }
}
</style>
