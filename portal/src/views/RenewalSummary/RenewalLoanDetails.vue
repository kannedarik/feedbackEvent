<template>
  <div class="summary-wrapper loan-details" ref="loanDetails">
    <Container>
      <div class="header sm:mt-4 md:mt-8 sm:px-3 sm:py-2 md:px-8 md:py-4 bg-white">
        <div class="md:flex md:items-center">
          <div>
            <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="backToSummary()"/>
          </div>
          <div class="sm:mt-2 md:mt-0 md:ml-4">
           <h2 class="font-semibold text-lg">
              {{$t('loan_update_details')}}
            </h2>
          </div>
        </div>
      </div>
      <div class="bg-white sm:px-3 md:px-8 interest-payment-summary repledge-summary">
        <div class="flex grey-bgnd">
          <LoanSummary
            :loanDetails="getCurrentLoanDetails"
            :type="'current_loan'"
          />
          <LoanSummary
            :loanDetails="getNewLoanDetails"
            :type="'new_loan'"
          />
        </div>
        <div class="rebate-message mt-4  p-2 d-inline-block medium-font-weight w-100 text-center"
          v-if="_.get(loanDetails[0], 'newLoan[0].kglText')">
          {{_.get(loanDetails[0], 'newLoan[0].kglText')}}
        </div>
        <div class="my-3">
          <div class="additional-info-container">
            <h3 class="medium-font-weight mb-2 flex">
              <img src="@/assets/icons/icon_info_Orange.svg" alt="info" class="pr-2">
              Additional Information
            </h3>
            <div class="additional-info pl-4">
              <p class="normal-font" v-for='(addInfo, index) of additionalInfo' :key='index'>
                {{addInfo}}
              </p>
              <p class="normal-font" v-if="additionalText.loandetailtext">
                {{additionalText.loandetailtext}}
              </p>
              <p class="normal-font" v-if="additionalText.schemedetailtext">
                {{additionalText.schemedetailtext}}
              </p>
            </div>
          </div>
        </div>
        <TermsConditions :terms="terms" v-if="terms.length"/>
      </div>
    </Container>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import TermsConditions from '@/components/RenewalSummary/TermsConditions.vue';
import LoanSummary from '@/components/LoanSummary/LoanSummary.vue';

export default {
  name: 'PartialReleaseSchemeInDetails',
  components: {
    Container,
    TermsConditions,
    LoanSummary,
  },
  data() {
    return {
      // variable for storing the additional info
      additionalInfo: [],
    };
  },
  computed: {
    ...mapGetters({
      paymentOption: 'loans/paymentOption',
    }),
    _() {
      return _;
    },
    getCurrentLoanDetails() {
      const currentLoanDatails = [];
      this.loanDetails.forEach((loan) => {
        const loanDatails = {
          type: loan.netweight ? 'secure' : 'unsecure',
          lender: loan.lenderid,
          loanAmount: loan.loanamount,
          loanDate: loan.loanstartedon,
          charges: loan.netweight ? loan.oldSecureCharges : loan.oldUnSecureCharges,
          schemes: loan.oldscheme,
          hasShowPerAnnum: true,
        };
        currentLoanDatails.push(loanDatails);
      });
      return currentLoanDatails;
    },
    getNewLoanDetails() {
      const newLoanDatails = [];
      this.loanDetails.forEach((loan) => {
        if (loan.netweight) {
          loan.newLoan.forEach((newLoan) => {
            const { type } = newLoan;
            const loanDatails = {
              type,
              loanAmount: this.getLoanAmt(newLoan, loan)[type],
              lender: newLoan.lender,
              loanDate: newLoan.loandate,
              charges: type === 'secure' ? newLoan.newSecureCharges : newLoan.newUnSecureCharges,
              schemes: newLoan.scheme,
              hasShowPerAnnum: true,
              schemeMessage: loan.isSelectedLELoan ? '*Applied as per repayments history'
                : 'Starting Interest Rate*',
            };
            if (loanDatails.loanAmount) {
              newLoanDatails.push(loanDatails);
            }
          });
        }
      });
      return newLoanDatails;
    },
  },
  props: {
    // recieving the repledge loan details from the summary page
    loanDetails: {
      type: Array,
      required: true,
    },
    terms: {
      type: Array,
    },
    additionalText: {
      type: Object,
    },
  },
  watch: {
    loanDetails(value) {
      if (!value) {
        this.$router.push('/dashboard');
      }
    },
  },
  methods: {
    backToSummary() {
      this.$router.go(-1);
    },
    showHideTermsAndConditions(terms) {
      this.$router.push({
        name: 'TermsAndConditions',
        params: { terms },
      });
    },
    // for additional info text based on selection of loan amount and lenders
    checkAdditionalInfo() {
      if (!_.get(this.loanDetails[0], 'replegeAmtUpdated')) {
        this.loanDetails[0].newLoan.forEach((key) => {
          if (_.get(this.loanDetails[0], 'defaultRepledge.currentDayRupeekPrinciple') > 0) {
            if (key.type === 'secure') {
              this.additionalInfo.push(key.defaultText);
            } else {
              this.additionalInfo.splice(1, 0, key.loandetailText);
              this.additionalInfo.splice(1, 0, key.schemedetailsText);
            }
          } else {
            this.additionalInfo.push(key.defaultText);
          }
        });
      } else {
        this.loanDetails[0].newLoan.forEach((key) => {
          if (_.get(this.loanDetails[0], 'moreRepledge.currentDayRupeekPrinciple') > 0) {
            if (key.type === 'secure') {
              this.additionalInfo.push(key.defaultText);
            } else {
              this.additionalInfo.splice(1, 0, key.loandetailText);
              this.additionalInfo.splice(1, 0, key.schemedetailsText);
            }
          } else {
            this.additionalInfo.push(key.defaultText);
          }
        });
      }
    },
    getLoanAmt(newLoan, loan) {
      const loanAmount = {};
      if (loan.isSelectedLELoan) {
        loanAmount[newLoan.type] = newLoan.type === 'secure'
          ? _.get(newLoan, 'loanEnhancement.currentDayLenderPrinciple')
          : _.get(newLoan, 'loanEnhancement.currentDayRupeekPrinciple');
      } else if (loan.replegeAmtUpdated) {
        loanAmount[newLoan.type] = newLoan.type === 'secure'
          ? _.get(newLoan, 'moreRepledge.currentDayLenderPrinciple')
          : _.get(newLoan, 'moreRepledge.currentDayRupeekPrinciple');
      } else {
        loanAmount[newLoan.type] = newLoan.type === 'secure'
          ? _.get(newLoan, 'defaultRepledge.currentDayLenderPrinciple')
          : _.get(newLoan, 'defaultRepledge.currentDayRupeekPrinciple');
      }
      return loanAmount;
    },
  },
  mounted() {
    this.checkAdditionalInfo();
    this.$refs.loanDetails.scrollIntoView();
  },
};
</script>
