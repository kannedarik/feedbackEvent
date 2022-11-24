<template>
  <div>
    <VueSlickCarousel v-bind="settings">
      <b-card header-tag="header" footer-tag="footer"
        class="loan-card loans-info mr-3 inter-font-family"
        v-for="(closedLoan, index) in loanDetails" :key="index">
        <template #header v-if="!closedLoan.hasShowHeader">
          <div class="d-flex justify-content-between">
            <div>
              <span class="text-xs label">
               {{$t('closure_amount')}}
              </span>
              <h6 class="font-semibold text-sm font-secondary">
                {{formatRupeeAmount(closedLoan.payableAmount)}}
              </h6>
            </div>
            <button class="btn-transparent" v-if="closedLoan.loanDetails"
              @click="moveToAmountBreakup(closedLoan)">
              {{$t('more_details')}}
            </button>
          </div>
        </template>
        <div class="text-left p-3">
          <div class="d-flex align-items-center">
            <div class="icon icon-small" v-for="lender in closedLoan.lendersInfo"
              :key="lender">
              <img :src="lendersConfig[lender].iconLink" :alt="lender">
            </div>
          </div>
          <p class="font-semibold text-sm font-secondary my-2">
            {{ _.join(
              _.map(closedLoan.lendersInfo, (loan) => lendersConfig[loan].name),
              ' & ')
            }}
          </p>
          <span class="bg-info p-2 text-xs">
            {{$t('loan_id')}}: {{ closedLoan.loanId }}
          </span>
          <div class="d-flex justify-content-between mt-4 pb-3 border-bottom">
            <div>
              <span class="text-xs new-label">
                {{$t('loan_date')}}
              </span>
              <p class="font-semibold text-sm font-secondary">
                {{ moment(closedLoan.loanDate).format('DD/MM/YYYY') }}
              </p>
            </div>
            <div>
              <span class="text-xs new-label">
                {{$t('loan_amount')}}</span>
              <p class="font-semibold text-sm font-secondary">
                {{formatRupeeAmount(closedLoan.loanAmount)}}
              </p>
            </div>
          </div>
          <div class="pt-3 d-flex align-items-center">
            <img src="@/assets/icons/jewels_icon.svg" alt="jewels_icon">
            <p class="text-xs ml-2 text-overflow-ellipsis">
              {{
                _.join(
                _.map(closedLoan.jewelsList, (ornament) => `${ornament.ornamentCount}
                ${ornament.ornamentType ? ornament.ornamentType : 'jewels'}`),
                ' , ')
              }}
            </p>
          </div>
        </div>
      </b-card>
    </VueSlickCarousel>
  </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import VueSlickCarousel from 'vue-slick-carousel';
import constants from '@/constant';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'totalLoansDetails',
  data() {
    return {
      settings: constants.closedLoansCarouselSettings,
    };
  },
  props: {
    loanDetails: {
      type: Array,
      required: true,
    },
  },
  components: {
    VueSlickCarousel,
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
    moment: (date) => moment(date),
    moveToAmountBreakup(closedLoan) {
      this.$router.push({
        name: 'AmountBreakup',
        params: {
          loansInfo: closedLoan,
        },
      });
    },
  },
};
</script>
<style scoped>
.label {
  color: #788193;
}
.new-label {
  color: #4B576F;
}
.bg-info {
  color: #0076D0;
}
</style>
