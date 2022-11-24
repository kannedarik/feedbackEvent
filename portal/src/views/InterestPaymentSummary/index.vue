<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div class="header-main p-6 mt-2">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
                class="cursor-pointer" @click="backToHome()"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-3">
              <h2 class="font-semibold text-lg">
                {{$t('interest_payment_summary')}}
              </h2>
            </div>
          </div>
        </div>
        <div class="sm:mx-4 sm:my-4 md:m-8 amount-details">
          <span class="text-sm">{{$t('total_payable_interest_Amt')}}</span>
          <h2 class="text-5xl font-bold mt-3">
            {{ formatRupeeAmount(populateAmounts.interestAmount) }}
          </h2>
        </div>
        <div class="discrepancyMessage sm:mx-4 sm:my-4 md:m-8" v-if="discrepancyMessage">
          <p>{{discrepancyMessage}}</p>
        </div>
        <LoansSummaryCard
          :selectedLoansList="selectedLoansList"
          :paymentOption="paymentOption"
          :discrepancy="discrepancy.interestRepayment" />
      </Container>
    </div>
    <LoansSummaryCardFooter :paymentOption="paymentOption" />
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import LoansSummaryCard from '@/components/LoansSummaryCard/summaryCard.vue';
import LoansSummaryCardFooter from '@/components/LoansSummaryCard/summaryCardFooter.vue';
import PaymentType from '@/mixins/PaymentType';
import { formatRupeeAmount } from '@/utils/string';
// eslint-disable-next-line
import backToHome from '@/utils/backToHome';

export default {
  name: 'InterestPaymentSummary',
  components: {
    Container,
    LoansSummaryCard,
    LoansSummaryCardFooter,
  },
  data() {
    return {
      discrepancyMessage: '',
    };
  },
  mixins: [PaymentType],
  computed: {
    ...mapGetters({
      populateAmounts: 'loans/populateAmounts',
      selectedLoansList: 'loans/selectedLoans',
      discrepancy: 'loans/discrepancyMessage',
      paymentOption: 'loans/paymentOption',
    }),
  },
  methods: {
    backToHome,
    formatRupeeAmount,
    discrepancyLoan() {
      const currentDate = moment().format('YYYY-MM-DD');
      let discrepanciesLevelArray = [];
      this.selectedLoansList.map((loans) => {
        loans.loans.map((loan) => {
          const resolvedDate = _.get(loan, 'discrepancy.discrepancyResolvedDate')
            && moment(loan.discrepancy.discrepancyResolvedDate).format('YYYY-MM-DD');
          const nextDayDate = moment(resolvedDate).add(1, 'day');
          if (_.get(this.discrepancy, 'interestRepayment.showFlag')
            && _.get(loan, 'discrepancy.prioritySlab') === 'SLAB2'
            && !_.get(loan, 'discrepancy.discrepancyResolvedDate')
          ) {
            discrepanciesLevelArray.push('discrepancy');
          } else if (_.get(this.discrepancy, 'interestRepayment.showFlag')
            && _.get(loan, 'discrepancy.prioritySlab') === 'SLAB2'
            && _.get(loan, 'discrepancy.discrepancyResolvedDate')
            && (moment(resolvedDate).isSame(currentDate)
            || moment(currentDate).isSame(nextDayDate))) {
            discrepanciesLevelArray.push('discrepancyResolved');
          }
          return true;
        });
        return true;
      });
      discrepanciesLevelArray = [...new Set(discrepanciesLevelArray)];
      if (discrepanciesLevelArray.includes('discrepancy')) {
        this.discrepancyMessage = _.get(this.discrepancy, 'interestRepayment.msg.SLAB2.app');
      } else {
        this.discrepancyMessage = discrepanciesLevelArray.includes('discrepancyResolved')
          ? _.get(this.discrepancy, 'interestRepayment.msg.SLAB2.resolved') : '';
      }
    },
  },
  mounted() {
    this.checkPaymentOption();
    this.discrepancyLoan();
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
  .discrepancyMessage p {
    font-size: 12px;
    color: #7e7e7e;
  }
</style>
