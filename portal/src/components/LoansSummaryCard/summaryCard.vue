<template>
  <div class="mb-20">
    <div class="loan-summary-card sm:mx-4 sm:my-4 md:m-8"
      v-for='(item, index) in selectedLoansList' :key="index">
      <div class="header flex justify-between items-baseline sm:px-3 sm:py-3 md:px-8 md:py-6"
        :class="{'opacity-50': discrepancyLoan(item.loans)}">
        <div class="w-32 md:w-auto">
          <h6 class="font-normal">{{$t('lender')}}</h6>
          <h4 class="lender-name font-bold">
            {{ _.join(
                _.map(lendersInfo(item.loans), (loan) => lendersConfig[loan].name), ' & ')
            }}
          </h4>
        </div>
        <div>
          <h6 class="font-normal">{{$t('loan_date')}}</h6>
          <h4 class="font-bold">
            {{moment(item.bookedDate).format('DD/MM/YYYY')}}
          </h4>
        </div>
        <div class="flex justify-end items-baseline"
          :class="{'w-28 md:w-36' : item.loans.length > 1}">
          <div>
            <h6 class="font-normal">
              {{$t('loan_amount')}}
            </h6>
            <h4 class="text-right font-bold">
              {{formatRupeeAmount(getLoanAmount(item.loans))}}
            </h4>
          </div>
          <b-dropdown right text="Right align" variant="link" no-caret
            class="download-pledge-card" v-if="item.loans.length>1"
            :disabled="discrepancyLoan(item.loans)">
            <template slot="button-content">
              <span class="dots"></span>
            </template>
            <b-dropdown-item target="_blank" @click="editLoanSelection(index)">
              <span v-if="paymentOption === 'interest'">
                {{$t('edit_interest_selection')}}
              </span>
              <span v-else>
                {{ paymentOption === 'partPayment'
                  ? $t('edit_part_pay_selection')
                  : $t('edit_loan_selection')
                }}
              </span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <div class="loan-body" :class="{'opacity-50': discrepancyLoan(item.loans)}">
        <div class="loan-details sm:px-3 sm:py-3 md:px-8 md:py-6"
          :class="[index === selectedIndex && (expandFlag || editFlag) ? 'h-auto' : 'hidden']">
          <div class="flex justify-between loan py-3"
            v-for="(loan, loanIndex) in item.loans" :key="loanIndex">
            <div class="w-1/3 text-left flex items-center">
              <div class="text-left mr-2" v-if="index === selectedIndex && editFlag">
                <div v-if="!loan.netweight">
                  <img src="@/assets/img/info_icons/tick.svg"
                    class="img-fluid" alt="preselected" />
                </div>
                <div class="checkbox__container" v-else>
                  <label class="container-checkbox">
                    <input type="checkbox"
                      :checked="loan.active"
                      @change='onLoanSelectChange(loan.active, loan.netweight, loan.loanid)'
                    />
                    <span class="checkmark"></span>
                  </label>
                </div>
              </div>
              <div>
                <h6>{{$t('scheme')}}</h6>
                <p class="text-capitalize">
                  {{_.get(loan, 'schemedata.name', '--')}}
                </p>
              </div>
            </div>
            <div class="w-1/4 text-center">
              <h6>
                {{ $t('loan_amount') }}
              </h6>
              <p>
                {{ formatRupeeAmount(loan.loanamount) }}
              </p>
            </div>
            <div class="w-1/4 text-right">
              <h6>
                {{
                  paymentOption === 'interest' ? $t('interest_amt')
                  : paymentOption === 'partPayment' ? $t('part_pay_amt')
                  : $t('closure_amt')
                }}
              </h6>
              <p>
                {{ loan.active
                ? formatRupeeAmount(paymentOption === 'interest' ? loan.interest
                  : paymentOption === 'partPayment'
                  ? (loan.partPaymentAmount - loan.recovery)
                  : loan.closingamount)
                  : '--' }}
              </p>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center sm:px-3 sm:py-3 md:px-8 md:py-6"
          v-if="(getRebateAmount(item.loans) && paymentOption !== 'partPayment')
            || (checkPartpaymentAmount && getPartPaymentRebateAmount(item.loans))">
          <div>
            <h5>
              {{ paymentOption === 'interest' ? $t('accrued_interest_amount')
                : paymentOption === 'partPayment' ? $t('actual_part_payment_amt')
                : $t('accrued_closure_amount')
              }}
            </h5>
          </div>
          <div class="text-right">
            <span class="font-bold text-xl">
              {{
                formatRupeeAmount(paymentOption === 'interest' ? getLoanInterest(item.loans)
                : paymentOption === 'partPayment'
                ? checkPartpaymentAmount
                  ? (getPartpaymentAmount(item.loans) - getExcessFunding(item.loans)): 0
                : (getLoanClosingAmount(item.loans) - getExcessFunding(item.loans)))
              }}
            </span>
          </div>
        </div>
        <div class="flex justify-between items-center sm:px-3 sm:py-3 md:px-8 md:py-6"
          v-if="(getRebateAmount(item.loans) && paymentOption !== 'partPayment')
          || (checkPartpaymentAmount && getPartPaymentRebateAmount(item.loans))">
          <div>
            <h5>{{ $t('rebate_amount')}}</h5>
          </div>
          <div class="text-right"
            :class="{'rebate-minus':checkPartpaymentAmount || paymentOption !== 'partPayment'}">
            <span class="font-bold text-xl">
              {{
                checkPartpaymentAmount || paymentOption === 'partPayment'
                ? formatRupeeAmount(getPartPaymentRebateAmount(item.loans))
                : paymentOption !== 'partPayment'
                ? formatRupeeAmount(getRebateAmount(item.loans)) : '--'
              }}
            </span>
          </div>
        </div>
        <div class="flex justify-between items-center sm:px-3 sm:py-3 md:px-8 md:py-6"
          v-if="((getExcessFunding(item.loans) && paymentOption === 'partPayment'
            && checkPartpaymentAmount)
            || getExcessFunding(item.loans) && paymentOption === 'closeLoan')">
          <div>
            <h5>{{ $t('excess_funding')}}</h5>
          </div>
          <div class="text-right">
            <span class="font-bold text-xl">
              {{
                (checkPartpaymentAmount || paymentOption !== 'partPayment')
                  ? formatRupeeAmount(getExcessFunding(item.loans))
                  : '--'
              }}
            </span>
          </div>
        </div>
        <div class="flex justify-between items-center sm:px-3 sm:py-3 md:px-8 md:py-6 yellow-bgnd">
          <div>
            <h5 class="font-bold">
              {{ paymentOption === 'interest' ? $t('payable_interest_amt')
                : paymentOption === 'partPayment' ? $t('payable_payment_amt')
                : $t('payable_closure_amt')
              }}
            </h5>
          </div>
          <div class="text-right">
            <span class="font-bold text-xl">
              {{
                formatRupeeAmount(paymentOption === 'interest'
                ? (getLoanInterest(item.loans) - getRebateAmount(item.loans))
                : paymentOption === 'partPayment'
                ? checkPartpaymentAmount ? (getPartpaymentAmount(item.loans)
                  - getPartPaymentRebateAmount(item.loans)) : 0
                : (getLoanClosingAmount(item.loans) - getRebateAmount(item.loans)))
              }}
            </span>
          </div>
        </div>
      </div>
      <footer :class="['p-3', discrepancyLoan(item.loans) ? 'yellow-bgnd': 'flex justify-end']">
        <div v-if="item.loans.length > 1 && !discrepancyLoan(item.loans)">
          <div class="loan-details-expand">
            <p class="cursor-pointer" >
              <span class="flex items-center" @click="expand(index, false)"
                v-if="index === selectedIndex && (expandFlag || editFlag)">
                Less
                <img src="@/assets/img/info_icons/up_arrow.svg"
                alt="up_arrow" />
              </span>
              <span class="flex items-center" v-else @click="expand(index, true)">
                More
                <img src="@/assets/img/info_icons/down_arrow.svg"
                alt="down_arrow" />
              </span>
            </p>
          </div>
        </div>
        <div v-if="discrepancyLoan(item.loans)" class="flex items-center">
          <div class="mr-2">
            <img src="@/assets/img/info_icons/renewal_pending.svg"
              alt="info" class="w-10" />
          </div>
          <p class="text-sm">
            {{_.get(discrepancy, 'msg.SLAB2.app')}}
          </p>
        </div>
      </footer>
    </div>
    <OutlineMessagesBox v-if="selectedLoansList.length > 0
      && _.get(selectedLoansList[0], 'loans[0].workingDayResult.message')
      && paymentOption === 'closeLoan' && goldReleaseMessageFlag"
      :width="'w-full'" class="sm:mx-4 md:mx-8"
      :messages="[{message: _.get(selectedLoansList[0], 'loans[0].workingDayResult.message')}]"/>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import store from '@/store';
import { formatRupeeAmount } from '@/utils/string';
import OutlineMessagesBox from '@/components/InfoMessagesBoxs/OutlineMessagesBox.vue';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'InterestPaymentSummary',
  data() {
    return {
      expandFlag: false,
      editFlag: false,
      selectedIndex: null,
      goldReleaseMessageFlag: false,
    };
  },
  components: {
    OutlineMessagesBox,
  },
  props: {
    partPaymentAmount: {
      required: false,
    },
    selectedLoansList: {
      required: false,
    },
    paymentOption: {
      required: true,
    },
    discrepancy: {
      required: true,
    },
  },
  watch: {
    selectedLoansList() {
      this.checkGoldReleaseMessage();
    },
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      populateAmounts: 'loans/populateAmounts',
      lendersConfig: 'loans/lendersConfig',
    }),
    checkPartpaymentAmount() {
      return this.partPaymentAmount <= this.populateAmounts.partPaymentClosingAmount
        && this.partPaymentAmount >= this.populateAmounts.interestAmount;
    },
  },
  methods: {
    formatRupeeAmount,
    moment: (date) => moment(date),
    // for getting total loan amount
    getLoanAmount(loan) {
      let totalLoanAmount = 0;
      loan.forEach((key) => {
        if (this.paymentOption === 'closeLoan' && key.active) {
          totalLoanAmount += key.loanamount;
        } else {
          totalLoanAmount += key.loanamount;
        }
      });
      return totalLoanAmount;
    },
    // for calculating the rebate amount
    getRebateAmount(loan) {
      let totatRebate = 0;
      let prevLoan = {};
      loan.forEach((key, index) => {
        if (_.get(key, 'schemedata.cashback') && key.active
          && ((prevLoan && (_.get(prevLoan, 'schemedata.cashback') && prevLoan.active))
          || index === 0)
        ) {
          totatRebate += key.cashbackamount;
        }
        prevLoan = key;
      });
      return totatRebate;
    },
    getPartPaymentRebateAmount(loan) {
      return loan.reduce((amount, item) => amount + item.partPaymentCashback, 0);
    },
    getPartpaymentAmount(loan) {
      return loan.reduce((amount, item) => amount + item.partPaymentAmount, 0);
    },
    // for calculating the excess amount
    getExcessFunding(loan) {
      let excessFunding = 0;
      loan.map((key) => {
        if (key.recovery && key.active && this.paymentOption === 'partPayment') {
          excessFunding += key.recovery;
        } else if (key.reconrecovery && key.active) {
          excessFunding += key.reconrecovery;
        }
        return true;
      });
      return excessFunding;
    },
    // for calculating the loan interest amount
    getLoanInterest(loan) {
      let totatLoanInterest = 0;
      loan.forEach((key) => {
        if (key.active) {
          totatLoanInterest += key.interest;
        }
      });
      return totatLoanInterest;
    },
    // for getting total closure amount
    getLoanClosingAmount(loan) {
      let totalClosingAmount = 0;
      loan.map((key) => {
        if (key.active) {
          totalClosingAmount += key.closingamount;
        }
        return true;
      });
      return totalClosingAmount;
    },
    // funnction call to show edit the loan checkbox
    editLoanSelection(index) {
      this.editFlag = this.selectedIndex === index ? !this.editFlag : true;
      this.selectedIndex = index;
    },
    // function call loan select changes
    onLoanSelectChange(active, netweight, loanId) {
      const data = {
        selectedLoans: this.selectedLoansList,
        loanId,
      };
      store.dispatch('loans/selectedLoanChanges', data);
      if (netweight > 0 && active) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_SECURED_COMPONENT_DESELECTED,
          [events.PAYMENT_ACTION]: this.getEventsCapaility(),
        };
        sendEvent(this.getEventsScreen(), events.category.PAYMENT, properties);
      }
    },
    // function call to view more details
    expand(index, flag) {
      this.selectedIndex = index;
      if (this.editFlag) {
        this.expandFlag = false;
        this.editFlag = false;
      } else {
        this.expandFlag = flag;
      }
      if (flag) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_MORE_SUMMARY_CLICKED,
          [events.PAYMENT_ACTION]: this.getEventsCapaility(),
        };
        sendEvent(this.getEventsScreen(), events.category.PAYMENT, properties);
      }
    },
    // function call to get events capaility
    getEventsCapaility() {
      let eventsCapaility = '';
      if (this.paymentOption === 'interest') {
        eventsCapaility = events.CAPABILITY_INTEREST;
      } else {
        eventsCapaility = this.paymentOption === 'partPayment'
          ? events.CAPABILITY_PART_PAYMENT : events.CAPABILITY_CLOSURE;
      }
      return eventsCapaility;
    },
    // function call to get events screen
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
    // function call to check discrepancy loan
    discrepancyLoan(loan) {
      let isLoanHasDiscrepancy = false;
      loan.map((key) => {
        isLoanHasDiscrepancy = _.get(this.discrepancy, 'showFlag') && key.loanHasDiscrepancy;
        return true;
      });
      return this.checkPaymentOption(isLoanHasDiscrepancy);
    },
    // function call to check payment option with discrepancy loan
    checkPaymentOption(isLoanHasDiscrepancy) {
      let isDiscrepancy = false;
      if (this.paymentOption === 'partPayment') {
        const hasSame = +this.partPaymentAmount === +this.populateAmounts.partPaymentClosingAmount;
        isDiscrepancy = isLoanHasDiscrepancy && hasSame;
      } else {
        isDiscrepancy = this.paymentOption === 'closeLoan' ? isLoanHasDiscrepancy : false;
      }
      store.dispatch('loans/hasDiscrepancy', (isDiscrepancy && this.selectedLoansList.length === 1));
      return isDiscrepancy;
    },
    // method to show/hide gold release message
    checkGoldReleaseMessage() {
      this.goldReleaseMessageFlag = false;
      this.selectedLoansList.map((key) => {
        key.loans.map((loan) => {
          if (loan.netweight > 0) {
            this.goldReleaseMessageFlag = loan.active && !this.goldReleaseMessageFlag
              ? true : this.goldReleaseMessageFlag;
          }
          return true;
        });
        return true;
      });
    },
    lendersInfo(loansArray) {
      const lenders = [];
      _.map(loansArray, (loan) => _.map(loan.lenders, (lender) => lenders.push(lender)));
      return [...new Set(lenders)];
    },
  },
  mounted() {
    this.checkGoldReleaseMessage();
  },
};
</script>
