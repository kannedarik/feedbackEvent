<template>
  <div>
    <div class="leadform z-index-999" v-if="hasShowJewelsInfo"></div>
    <div class="payments-body mb-24">
      <Container :screenType="'body-bg'">
        <div class="header-main sm:px-4 sm:py-4 md:p-8 mt-4 bg-white">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg"
                alt="back_arrows" class="cursor-pointer"
                @click="backToPreviousScreen()" />
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-4">
              <h2 class="font-semibold text-lg">
                {{$t('loan_closure_summary')}}
              </h2>
            </div>
          </div>
        </div>
        <TotalLoansDetails
          :totalLoansDetails="totalLoansDetails"
          :totalInfoMessage="totalInfoMessage"
          v-on:openJewelsInfo="hasShowJewelsInfo = true"
          v-on:openChargesInfo="openChargesInfo($event)"
          v-if="loanDetails.length"
        />
        <div class="sm:px-3 sm:py-3 md:p-8 closed-loans"
          v-if="loanDetails.length">
          <h4 class="text-lg mb-3 font-bold">
            {{$t('closure_loan_details')}}
          </h4>
          <ClosureLoanDetails :loanDetails="loanDetails" />
        </div>
        <InfoMessageWithTitle class="mb-5 sm:mx-3"
          :infoMessage="infoMessage"
          v-if="loanDetails.length"
        />
      </Container>
      <transition
        name="custom-classes-transition"
        enter-active-class="animated slideInUp"
        leave-active-class="animated slideOutDown">
        <CustomerAddressJewels
          :hasChangeAddress="false"
          :goldRelease="goldRelease"
          :additionalCharges="charges"
          :hasShowCharges="hasShowCharges"
          :hasUpdateSelectedAddress="false"
          v-on:closeOnboarding="closeOnboarding()"
          v-if="hasShowJewelsInfo"
        />
      </transition>
    </div>
    <LoansSummaryCardFooter
      :totalRebateAmount="totalRebateAmount"
      :paymentOption="paymentOption"
    />
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import TotalLoansDetails from '@/components/CommonComponents/totalLoansDetails.vue';
import ClosureLoanDetails from '@/components/CommonComponents/closureLoanDetails.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitleImge.vue';
import LoansSummaryCardFooter from '@/components/LoansSummaryCard/summaryCardFooter.vue';
import CustomerAddressJewels from '@/components/CommonComponents/CustomerAddressJewelsInfo.vue';
import { getAdditionalChargesAPI } from '@/api/customer.api';
import PaymentType from '@/mixins/PaymentType';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import { formatRupeeAmount } from '@/utils/string';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import infoIcon from '@/assets/icons/info_icon.svg';

export default {
  name: 'CloseLoanSummary',
  data() {
    return {
      loanDetails: [],
      goldRelease: [],
      hasShowJewelsInfo: false,
      totalLoansDetails: {},
      additionalCharges: {},
      hasShowCharges: false,
      charges: [],
      selectedLoansWithOutDiscrepancy: [],
      totalRebateAmount: 0,
    };
  },
  components: {
    Container,
    LoansSummaryCardFooter,
    TotalLoansDetails,
    ClosureLoanDetails,
    InfoMessageWithTitle,
    CustomerAddressJewels,
  },
  mixins: [PaymentType, ReleaseSlotBookingMixins],
  computed: {
    ...mapGetters({
      populateAmounts: 'loans/populateAmounts',
      selectedLoansList: 'loans/selectedLoans',
      paymentOption: 'loans/paymentOption',
      jewelsList: 'jewels/jewelsList',
    }),
    infoMessage() {
      const messageInfo = {
        size: 'big',
      };
      const noteInfo = this.staticMessage['closure-summary-account-holder-note'];
      const content = noteInfo && noteInfo.content ? noteInfo.content : {};
      return { ...messageInfo, ...content };
    },
    totalInfoMessage() {
      const messageInfo = {
        size: 'very-big',
      };
      const noteInfo = this.staticMessage['closure-summary-expected-delivery-note'];
      const content = noteInfo && noteInfo.content ? noteInfo.content : {};
      return { ...messageInfo, ...content };
    },
  },
  watch: {
    jewelsList(value) {
      this.loanDetails = [];
      this.goldRelease = [];
      if (value && value.loans) {
        value.loans.forEach((loan) => {
          this.goldRelease.push(
            {
              loanDate: loan.loanStartDate,
              totalLoanAmount: this.getLoanAmount(loan.loanId),
              releaseJewelsList: loan.jewels,
            },
          );
          const data = this.getPayableAmount(loan.loanId);
          this.loanDetails.push(
            {
              payableAmount: data.payAmount,
              lendersInfo: loan.lender,
              loanId: loan.loanId,
              loanDate: loan.loanStartDate,
              loanAmount: this.getLoanAmount(loan.loanId),
              jewelsList: this.getOrnamentList(loan.jewels),
              excessFunding: data.efAmount,
              interestAmt: data.interestAmt,
              rebateAmount: data.rebateAmount,
              loanDetails: data.loanDetails,
            },
          );
        });
      }
      const principalAmt = this.loanDetails.reduce((amount, item) => amount + item.loanAmount, 0);
      const efAmount = this.loanDetails.reduce((amount, item) => amount + item.excessFunding, 0);
      const interestAmt = this.loanDetails.reduce((amount, item) => amount + item.interestAmt, 0);
      const rebateAmount = this.loanDetails.reduce((amount, item) => amount + item.rebateAmount, 0);
      this.totalRebateAmount = rebateAmount;
      this.totalLoansDetails = {
        totalSelectedLoans: this.selectedLoansWithOutDiscrepancy.length,
        totalPayableAmount: this.populateAmounts.closingAmount,
        details: [
          { key: 'total_principal_amount', amount: principalAmt },
          { key: 'total_interest_amount', amount: interestAmt },
          { key: 'excess_funding', amount: efAmount },
          { key: 'total_rebate_amount', amount: rebateAmount },
          {
            key: 'additional_charges',
            amount: _.get(this.additionalCharges, 'totalCharges', 0),
            charges: _.get(this.additionalCharges, 'totalCharges', 0)
              ? this.totalCharges(this.additionalCharges.charges) : [],
            infoIcon,
          },
        ],
      };
    },
  },
  methods: {
    formatRupeeAmount,
    ...mapActions({
      getJewelsDetails: 'jewels/getJewelsDetails',
      resetState: 'jewels/resetState',
    }),
    backToPreviousScreen() {
      this.resetState();
      this.$router.go(-1);
    },
    openChargesInfo(data) {
      this.charges = data;
      this.hasShowCharges = true;
      this.hasShowJewelsInfo = true;
    },
    closeOnboarding() {
      this.charges = [];
      this.hasShowCharges = false;
      this.hasShowJewelsInfo = false;
    },
    totalCharges(charges) {
      const result = Object.values(charges.reduce((change, { type, value }) => {
        const data = change;
        const key = type;
        data[key] = data[key] || { type, value: 0 };
        data[key].value += value;
        return data;
      }, {}));
      return result;
    },
    // api to fetch jewels details based on loan id
    getJewelsInfo() {
      const coreIds = [];
      this.selectedLoansWithOutDiscrepancy.forEach((mainLoan) => {
        mainLoan.loans.forEach((loan) => {
          coreIds.push(loan.coreid);
        });
      });
      const tempObj = {
        productCategory: 'GOLD_LOAN',
        fetchUnselectedLoans: false,
        loanIds: coreIds.join(','),
      };
      this.getJewelsDetails(tempObj);
    },
    getLoanAmount(coreId) {
      let loanAmount = 0;
      this.selectedLoansWithOutDiscrepancy.forEach((mainLoan) => {
        mainLoan.loans.forEach((loan) => {
          if (loan.coreid === coreId) {
            loanAmount = loan.totalLoanamount;
          }
        });
      });
      return loanAmount;
    },
    getPayableAmount(coreId) {
      const loanAmount = {
        payAmount: 0,
        efAmount: 0,
        interestAmt: 0,
        rebateAmount: 0,
      };
      this.selectedLoansWithOutDiscrepancy.forEach((mainLoan) => {
        const { loans } = mainLoan;
        loans.forEach((loan) => {
          if (loan.coreid === coreId) {
            const closingAmount = loans.reduce((amount, item) => amount + item.closingamount, 0);
            const cashbackAmount = loans.reduce((amount, item) => amount + item.cashbackamount, 0);
            loanAmount.rebateAmount = cashbackAmount;
            loanAmount.payAmount = !loan.loanHasDiscrepancy ? (closingAmount - cashbackAmount) : 0;
            loanAmount.efAmount = loans.reduce((amount, item) => amount + item.reconrecovery, 0);
            loanAmount.interestAmt = loans.reduce((amount, item) => amount + item.interest, 0);
            loanAmount.loanDetails = this.getLoanDetails(loans);
          }
        });
      });
      return loanAmount;
    },
    getLoanDetails(loans) {
      const loanDetails = [];
      loans.forEach((loan) => {
        loanDetails.push(
          {
            lender: loan.lenderid,
            details: [
              { key: 'principal_amount', amount: loan.loanamount },
              { key: 'interest_amount', amount: loan.interest },
              { key: 'excess_funding', amount: loan.reconrecovery },
              { key: 'rebate_amount', amount: loan.cashbackamount },
              {
                key: 'additional_charges',
                amount: this.chargesAmount(loan.loanid),
                charges: this.chargesAmount(loan.loanid)
                  ? this.loansCharges(loan.loanid) : [],
                infoIcon,
              },
            ],
          },
        );
      });
      return loanDetails;
    },
    loansCharges(lmsId) {
      const loansCharge = _.get(this.additionalCharges, 'charges', []);
      return loansCharge && loansCharge.filter((change) => change.lmsId === lmsId);
    },
    chargesAmount(lmsId) {
      const changes = this.loansCharges(lmsId);
      return changes.reduce((amount, item) => amount + item.value, 0);
    },
    getOrnamentList(jewelsList) {
      const result = Object.values(jewelsList.reduce((jewels, { ornamentType, noOfItems }) => {
        const data = jewels;
        const key = ornamentType;
        data[key] = data[key] || { ornamentType, ornamentCount: 0 };
        data[key].ornamentCount += noOfItems;
        return data;
      }, {}));
      return result;
    },
    // api to fetch additional charges
    getAdditionalCharges() {
      const lmsIds = [];
      this.selectedLoansList.forEach((mainLoan) => {
        mainLoan.loans.forEach((loan) => {
          lmsIds.push(loan.loanid);
        });
      });
      getAdditionalChargesAPI(lmsIds.join(','))
        .then((response) => {
          this.additionalCharges = response.data;
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
  },
  activated() {
    this.selectedLoansWithOutDiscrepancy = [];
    this.selectedLoansList.forEach((mainLoan) => {
      const { loans } = mainLoan;
      loans.forEach((loan) => {
        if (loan.netweight && !loan.loanHasDiscrepancy) {
          this.selectedLoansWithOutDiscrepancy.push(mainLoan);
        }
      });
    });
    if (_.isEmpty(this.jewelsList) && !_.get(this.jewelsList, 'loans', []).length) {
      this.checkPaymentOption();
      this.getJewelsInfo();
      // this.getAdditionalCharges();
      this.getStaticMessages('closure-summary');
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_PART_RELEASE_CLOSURE_SUMMARY_PAGE,
      };
      sendEvent(events.screen.CLOSE_LOAN_SUMMARY, events.category.PAYMENT, properties);
    }
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
</style>
