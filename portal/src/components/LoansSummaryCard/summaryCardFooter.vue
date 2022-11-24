<template>
  <div class="footer-new">
    <Container>
      <div class="saved-message text-center inter-font-family p-2"
        v-if="totalRebateAmount && paymentOption === 'closeLoan'">
        {{ `🎉  You saved on ${formatRupeeAmount(totalRebateAmount)} this transaction` }}
      </div>
      <div class="py-2 px-4 md:p-7">
        <div class="d-flex items-center sm:flex-column md:flex-row"
          v-if="paymentOption === 'closeLoan'">
          <div class="w-full md:w-1/2">
            <label class="container-checkbox pl-4 inter-font-family">
              <input type="checkbox" v-model="selectedFlag"/>
              <span class="checkmark cursor-pointer checkmark-info"></span>
                I confirm that I am the primary account holder
                and I have read all the loan closure details
            </label>
          </div>
          <div class="w-full md:w-1/2 text-right">
            <button class="btn-primary-rupeek w-full md:w-1/2 rounded-full"
              :class="{'disabled-btn' : hasDiscrepancy || !selectedFlag }"
              @click="continueToPay">
              {{ $t('pay')}} {{formatRupeeAmount(populateAmounts.closingAmount)}}
            </button>
          </div>
        </div>
        <button class="btn-primary-rupeek rounded-full w-1/2 md:w-1/4 disabled-btn float-right"
          v-else-if="(paymentOption === 'partPayment' && !partPaymentAmount)">
          Enter Amount
        </button>
        <button class="btn btn-primary-rupeek w-1/2 md:w-1/4 rounded-full float-right"
          :class="{'disabled-btn' : hasDiscrepancy }" @click="continueToPay" v-else>
          {{ $t('continue_to_pay')}}
        </button>
      </div>
    </Container>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import { getPaymentMethodsBasedOnLoansLender } from '@/utils/getPaymentMethods';
import { sendEvent, mapCleverTapProperty } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'LoansSummaryCardFooter',
  data() {
    return {
      isTakeover: false,
      selectedFlag: false,
    };
  },
  components: {
    Container,
  },
  props: {
    paymentOption: {
      type: String,
      required: true,
    },
    totalRebateAmount: {
      required: false,
    },
    partPaymentAmount: {
      required: false,
    },
  },
  computed: {
    ...mapGetters({
      populateAmounts: 'loans/populateAmounts',
      selectedLoansList: 'loans/selectedLoans',
      hasDiscrepancy: 'loans/hasDiscrepancy',
    }),
  },
  methods: {
    formatRupeeAmount,
    // function call to click continue to pay
    continueToPay() {
      if (this.paymentOption === 'partPayment'
        && (this.partPaymentAmount === '' || +(this.partPaymentAmount) <= 0)) {
        this.$noty.error('Please enter a valid part payment amount');
      } else if (this.paymentOption === 'partPayment'
        && (+(this.partPaymentAmount) < this.populateAmounts.interestAmount
        || +(this.partPaymentAmount) > this.populateAmounts.partPaymentClosingAmount)) {
        this.$noty.error(`Please enter a value between ${this.populateAmounts.interestAmount > 100
          ? this.populateAmounts.interestAmount : 100}
        and ${this.populateAmounts.partPaymentClosingAmount}`);
      } else if (this.paymentOption === 'partPayment' && (+(this.partPaymentAmount) < 100)) {
        this.$noty.error(`Please enter a value between 100 and
          ${this.populateAmounts.partPaymentClosingAmount}`);
      } else {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_CONTINUE_TO_PAY_SUMMARY_CLICKED,
          [events.PAYMENT_ACTION]: mapCleverTapProperty(this.paymentOption).action,
        };
        sendEvent(this.getEventsScreen(), events.category.PAYMENT, properties);
        getPaymentMethodsBasedOnLoansLender(
          this.selectedLoansList,
          this.paymentOption,
          this.isTakeover,
        );
      }
    },
    getEventsScreen() {
      let eventsScreen = '';
      if (this.paymentOption === 'interest') {
        eventsScreen = events.screen.INTEREST_PAYMENT_SUMMARY;
      } else {
        eventsScreen = this.paymentOption === 'partPayment'
          ? events.screen.PART_PAYMENT_SUMMARY : events.screen.CLOSE_LOAN_SUMMARY;
      }
      return eventsScreen;
    },
  },
};
</script>
<style scoped lang='scss'>
 .footer-new {
  position: fixed;
  bottom: 0;
  width: 100%;
  .saved-message {
    background: #F1F9E8;
    color: #5DA513;
    font-size: 12px;
  }
  .container-checkbox {
    font-size: 12px;
    line-height: 17px;
    color: #4B576F;
  }
}
</style>
