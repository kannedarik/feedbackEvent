<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div class="header p-6 mt-2 bg-white">
          <div class="md:flex md:items-center">
            <div>
             <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="backToHome()"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-4">
              <h3 class="font-semibold">
                {{$t('part_payment_summary')}}
              </h3>
            </div>
          </div>
        </div>
        <div class="part-payment sm:mx-4 sm:my-4 md:m-8">
          <h3>{{$t('enter_part_payment_amount')}}</h3>
          <div class="part-payment-amount">
            <span class="rupee-symbol">₹</span>
            <input type="number" id="part-payment-amount"
              class="form-control part-payment-input w-full sm:text-right md:text-left"
              min="100" :max="populateAmounts.partPaymentClosingAmount"
              autofocus v-model="partPaymentAmount"
              @keypress="checkSpecialCharacters"
              @keyup="emitPartPaymenValue"
            />
          </div>
          <div>
            <span class="font-bold">
              {{$t('min_amt')}}
                {{(_.get(populateAmounts, 'interestAmount') >= 100)
                  ? toRupeeAmount(populateAmounts.interestAmount).amount : '100'
                }}
              | {{$t('max_amt')}}
                {{(_.get(populateAmounts, 'partPaymentClosingAmount') > 0)
                  ? toRupeeAmount(populateAmounts.partPaymentClosingAmount).amount : '0'
                }}
            </span>
          </div>
        </div>
        <LoansSummaryCard
          :selectedLoansList="selectedLoansList"
          :paymentOption="paymentOption"
          :partPaymentAmount="partPaymentAmount"
          :discrepancy="discrepancy" />
      </Container>
    </div>
    <LoansSummaryCardFooter
      :paymentOption="paymentOption"
      :partPaymentAmount="partPaymentAmount" />
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import LoansSummaryCard from '@/components/LoansSummaryCard/summaryCard.vue';
import LoansSummaryCardFooter from '@/components/LoansSummaryCard/summaryCardFooter.vue';
import PaymentType from '@/mixins/PaymentType';
import { toRupeeAmount } from '@/utils/string';
// eslint-disable-next-line
import backToHome from '@/utils/backToHome';

export default {
  name: 'PartPaymentSummary',
  data() {
    return {
      partPaymentAmount: null,
    };
  },
  mixins: [PaymentType],
  components: {
    Container,
    LoansSummaryCard,
    LoansSummaryCardFooter,
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      populateAmounts: 'loans/populateAmounts',
      selectedLoansList: 'loans/selectedLoans',
      discrepancyMessage: 'loans/discrepancyMessage',
      paymentOption: 'loans/paymentOption',
    }),
    discrepancy() {
      return this.discrepancyMessage.release;
    },
  },
  activated() {
    this.partPaymentAmount = null;
  },
  methods: {
    toRupeeAmount,
    backToHome,
    // fucntion to restrict the special characters in part payment text box
    checkSpecialCharacters(evt) {
      const e = evt || window.event;
      const charCode = typeof e.which === 'undefined' ? e.keyCode : e.which;
      const charStr = String.fromCharCode(charCode);
      if (!charStr.match(/^[0-9]+$/)) {
        e.preventDefault();
      }
    },
    // fucntion to emit the entered part payment amount (to display the entered amount)
    emitPartPaymenValue() {
      const minInterestAmount = _.get(this.populateAmounts, 'interestAmount') >= 100
        ? _.get(this.populateAmounts, 'interestAmount') : 100;
      const hasSplitResponse = (this.partPaymentAmount >= minInterestAmount
      && this.partPaymentAmount <= this.populateAmounts.partPaymentClosingAmount);
      if (hasSplitResponse) {
        store.dispatch('loans/partPaymentData', {
          selectedLoans: this.selectedLoansList,
          partPaymentAmount: this.partPaymentAmount,
          closingAmount: this.populateAmounts.partPaymentClosingAmount,
        });
      } else {
        store.dispatch('loans/updatedSelectedLoan');
      }
      store.dispatch('loans/partPaymentAmount', this.partPaymentAmount);
    },
  },
  mounted() {
    this.checkPaymentOption();
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
  .part-payment-input {
    padding-left: 3rem;
    @media (min-width: 768px) {
      padding-left: 4rem;
    }
  }
</style>
