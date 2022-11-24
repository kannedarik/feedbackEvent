<!-- eslint-disable max-len -->
<template>
  <div>
    <Container :screenType="'body-bg'">
      <div class="bg-white sm:px-4 sm:py-3 md:px-8 md:py-6 my-3">
        <div class="md:flex md:items-center">
          <div>
            <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="goBackPreviousScreen()"/>
          </div>
          <div class="sm:mt-3 md:mt-0 md:ml-3">
            <h2 class="font-semibold text-lg">
              Renewal Summary
            </h2>
          </div>
        </div>
      </div>
      <div class="repledge-summary" v-if="nonKglSelectedLoans.length || repledgeLoans.length">
        <div class="renewal-summary bg-white sm:px-3 md:px-8" v-if="kglLoan">
          <RenewalSummaryCard :summaryOptions="summaryOptions" />
        </div>
        <div class="p-0 col-6 lender-summary" v-else-if="rupeekSecure">
          <div class="amount-details" v-if="populateAmounts.repledgeAmount >= 100">
            <h3>Total Renewal Amount</h3>
            <h5 class="bold-font">
              {{ _.get(populateAmounts, 'repledgeAmount')
                  ? formatRupeeAmount(_.get(populateAmounts, 'repledgeAmount'))
                  : "No Cost"
              }}
              <img src="@/assets/icon_info_grey.svg" alt="info icon"
                class="ml-2" id="amount-tooltip-1">
              <b-popover
                :aria-hidden="isHideTooltips"
                target="amount-tooltip-1"
                custom-class="repledge-hint"
                placement="bottom">
                <div class="flex justify-between items-start">
                  <img src="@/assets/icons/icon_info_Orange.svg" alt="info icon" />
                  <p class="ml-2">
                    Amount Payable is dependent on the new loan amount eligible basis prevailing per gram rate. It is not a fee charged by Rupeek.
                  </p>
                </div>
              </b-popover>
            </h5>
          </div>
          <div class="amount-details mb-3" v-if="populateAmounts.repledgeAmount < 100">
            <h3>Renew at</h3>
            <h5 class="bold-font">No Cost</h5>
          </div>
        </div>
        <div class="summary-loans" v-if="kglLoan">
          <div class="bg-white">
            <div>
              <div class="mb-4 sm:px-3 md:px-8" v-for="(item, index) in repledgeLoans" :key="index">
                <div class="flex justify-between items-center">
                  <h1 class="mb-3 medium-font-weight pt-4">
                    {{index+1}}. Loan Update
                  </h1>
                  <div class="flex items-center mb-3 medium-font-weight pt-5 top-up" v-if="loanEnhancements(item)">
                    <p class="eligible-loan">Eligible for Loan Top Up</p>
                    <img src="@/assets/icon_info_grey.svg" alt="info icon" class="ml-2" :id="`tooltip-topup-${index}`">
                    <b-popover :target="`tooltip-topup-${index}`" custom-class="topup-eligible"
                      placement="bottom" :aria-hidden="isHideTooltips">
                      <div class="flex justify-between items-start">
                        <img src="@/assets/icons/icon_info_Orange.svg" alt="info icon" />
                        <p class="ml-2">
                          Check Top up amount by clicking Get Top Up amount button
                        </p>
                      </div>
                    </b-popover>
                  </div>
                </div>
                <InfoMessageWithTitle v-if="item.loans[0].type === 'N:1' && item.loans.length>1"
                  :infoMessage="{
                    infoIcon: '@/assets/icons/icon_info_Orange.svg',
                    title: '',
                    message: getMessage(item.loans)
                }"/>
                <div class="flex grey-bgnd">
                  <LoanSummary
                    :loanDetails="setLoanDetails(item.loans)"
                    :type="'current_loan'"
                  />
                  <LoanSummary
                    :loanDetails="setNewLoanDetails(item)"
                    :type="'new_loan'"
                    v-on:modifyLoanAmt="modifyLoanAmt($event)"
                  />
                </div>
                <div class="renewal-footer row items-center m-0 py-2 sm:px-3 md:px-4">
                  <div :class="[loanEnhancements(item) ? 'col-4' : 'col-8']">
                    <p class="normal-font">Amount Payable</p>
                    <h4 class="bold-font">
                      {{formatRupeeAmount(getPayableAmount(item))}}
                    </h4>
                  </div>
                  <div class="col-4" v-if="loanEnhancements(item)">
                    <p class="normal-font">Top up Amount</p>
                    <h4 class="bold-font">
                      {{formatRupeeAmount(_.get(item, 'loans[0].topUpAmount', 0))}}
                    </h4>
                  </div>
                  <div class="col-4 normal-font">
                    <h3 class="text-right" @click="viewRepledgeLoanDetails(item)">
                      Loan Details >
                    </h3>
                  </div>
                </div>
                <div class="next-day-interest">
                  <div class="flex py-3">
                    <img src="@/assets/icons/info_grey_icon.svg" alt="info_grey_icon"
                      class="mr-2"/>
                    <div>
                    <p> {{nextWorkingDaysText}}</p>
                    <p v-if="renewalForICICILender" class="mt-2">
                      {{icicMessage}}
                    </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="sm:px-3 md:px-8 pt-3 mb-24 bg-white">
            <TermsConditions :terms="terms" v-if="terms.length"/>
          </div>
        </div>
        <div class="summary-loans lender-summary" v-else-if="rupeekSecure">
          <div class="summary-loans loans bg-white" v-for="(item, index) in nonKglSelectedLoans" :key="item.id"
            :class="{ 'mb-3': nonKglSelectedLoans.length !== index + 1 }">
            <div class="summary-loans loans basic-details part-payment display-flex">
              <div class="flex-1">
                <h4 class="mb-3 bold-font">Current Loan Details</h4>
                <div class="block mb-3">
                  <label>Lender</label>
                  <h5>
                    {{ lendersConfig[item.loans[0].lenderid].name }}
                  </h5>
                </div>
                <div class="block mb-3">
                  <label>Loan Date</label>
                  <h5>{{ moment(item.bookedDate).format("MMM DD, `YY") }}</h5>
                </div>
                <div class="block">
                  <label>Loan Amount</label>
                  <h5>
                    {{ formatRupeeAmount(item.loans[0].loanamount) }}
                  </h5>
                </div>
              </div>
              <div class="flex-1">
                <h4 class="mb-3 bold-font">New Loan Details</h4>
                <div class="block mb-3">
                  <label>New Lender</label>
                  <h5>{{ lendersConfig[item.loans[0].lenderid].name }}</h5>
                </div>
                <div class="block mb-3">
                  <label>New Loan Date</label>
                  <h5>{{ moment().format("MMM DD, YYYY") }}</h5>
                </div>
                <div class="block">
                  <label>New Loan Amount</label>
                  <h5>
                    {{
                      formatRupeeAmount(item.loans[0].loanamount)
                    }}
                    <sup>*</sup>
                  </h5>
                </div>
              </div>
            </div>
            <div class="summary-loans loans selected-loan-amount d-flex justify-between items-center bg-white"
              v-if="_.get(item, 'loans[0].reconrecovery')">
              <h5>Renewal Amount</h5>
              <h6 class="bold-font" >
                {{
                  formatRupeeAmount(item.loans[0].repledgeamount - item.loans[0].reconrecovery)
                }}
              </h6>
            </div>
            <div class="summary-loans loans selected-loan-amount d-flex justify-between itmes-center bg-white"
              v-if="_.get(item, 'loans[0].reconrecovery')">
              <h5>Excess Funding</h5>
              <h6 class="bold-font">
                {{ formatRupeeAmount(item.loans[0].reconrecovery) }}
              </h6>
            </div>
            <div class="summary-loans loans selected-loan-amount d-flex justify-between itmes-center theme-bgcolor">
              <h5>Payable Renewal Amount</h5>
              <h6 class="bold-font">
                {{ formatRupeeAmount(item.loans[0].repledgeamount)}}
              </h6>
            </div>
          </div>
        </div>
        <!--  doc verification model  -->
        <div>
          <transition name="custom-classes-transition" enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
            <ackComponent :orderId='orderId' :from="'summary'" v-if="showDocVerification" v-on:closedocVerificationModal="showDocVerification = false"></ackComponent>
          </transition>
          <div class="payment-options-wrapper-back-drop" v-if="showDocVerification" @click="showDocVerification = !showDocVerification"></div>
        </div>
      </div>
    </Container>
    <div class="sticky-footer-wraper" v-if="nonKglSelectedLoans.length || repledgeLoans.length">
      <Container>
        <div class="py-2 sm:px-4 md:p-7 flex items-center">
          <div class="flex-1 loan-selection-info-wrapper">
            <label class="container-checkbox pl-4" v-if="kglLoan">
              <input type="checkbox" v-model="selectedFlag"/>
              <span class="checkmark cursor-pointer"></span>
                I agree to the above Terms and Conditions.
            </label>
            <p v-else-if="rupeekSecure">
              * The new Loan Amount and Tenure are subject to change.
            </p>
          </div>
          <div class="flex-1 text-right">
            <button :class="[`btn-primary-rupeek text-sm md:text-base
              rounded-full px-5 py-3
              ${!selectedFlag && 'opacity-50'}`]"
              :disabled="!selectedFlag" @click="fetchOrderId" v-if="kglLoan">
                {{ $t('continue')}}
              </button>
              <button class="btn btn-primary-rupeek"
                @click="openPaymentsOption" v-else-if="rupeekSecure">
                <span v-if="populateAmounts.renewalamount >= 100">Request</span>
                <span v-else>Confirm</span>
              </button>
          </div>
        </div>
      </Container>
    </div>
    <!--
      If we open the modal from the summary screen, then we are viewing a single loan.
      Otherwise, we view all the selected loans in the modal.
    -->
    <LoanAmountSelectionModal
      v-if="showLoanSelectionModal"
      @hidden="showLoanSelectionModal = false"
      @completed="onLoanSelectionModalCompleted"
      :viewingSummaryScreen="showHidePaymentSummary"
    />
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters, mapActions } from 'vuex';
import { getPaymentLink } from '@/api/paymentGateways.api';
import Container from '@/components/CommonComponents/Container.vue';
import RenewalSummaryCard from '@/components/RenewalSummary/RenewalSummaryCard.vue';
import ackComponent from '@/components/RenewalSummary/AckOfPledge.vue';
import LoanSummary from '@/components/PartReleaseSummary/LoanSummary.vue';
import TermsConditions from '@/components/RenewalSummary/TermsConditions.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import LoanAmountSelectionModal from '@/components/LoanAmountSelection/LoanAmountSelectionModal.vue';
import { fetchOrderId } from '@/api/repledge.api';
import { secureComponent } from '@/utils/loan';
// eslint-disable-next-line
import { getPaymentMethodsBasedOnLoansLender } from '@/utils/getPaymentMethods';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import assetsFromFirebase from '@/mixins/assetsFromFirebase';
import { toMonthlyInterestRate, formatRupeeAmount } from '@/utils/string';
import PaymentType from '@/mixins/PaymentType';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';

export default {
  name: 'RenewalSummary',
  components: {
    RenewalSummaryCard,
    LoanSummary,
    ackComponent,
    Container,
    TermsConditions,
    InfoMessageWithTitle,
    LoanAmountSelectionModal,
  },
  data() {
    return {
      repledgeLoans: [],
      terms: [],
      showDocVerification: false,
      repledgeLoanDetails: {},
      selectedFlag: false,
      // var to store the new loans
      newLoansArray: [],
      // flag to store the loantype i.e., kgl or non kgl
      kglLoan: false,
      // orderid
      orderId: '',
      totalRenewalAmount: null,
      show: false,
      // to show selected t&c on details page
      selectedLoanTerms: [],
      // flag is used to check selected Loan is LE are not
      isSelectedLELoan: false,
      // flag is used to hide the tooltips if open any tooltip
      isHideTooltips: false,
      showLoanSelectionModal: false,
      // flag to show/hide the payment summary
      showHidePaymentSummary: false,
      repledgeType: 'ESIGN',
      rupeekSecure: false,
      icicMessage: '',
    };
  },
  mixins: [assetsFromFirebase, PaymentType, ReleaseSlotBookingMixins],
  computed: {
    ...mapGetters({
      nonKglSelectedLoans: 'loans/selectedLoans',
      populateAmounts: 'loans/populateAmounts',
      paymentOption: 'loans/paymentOption',
      selectedScheme: 'renewal/renewalScheme',
      newLoansData: 'renewal/confirmedNewLoansData',
      selectedLoans: 'renewal/selectedLoansForSummaryScreen',
      lendersConfig: 'loans/lendersConfig',
    }),
    _() {
      return _;
    },
    renewalForICICILender() {
      const lenders = [];
      this.repledgeLoans.forEach((repledgeLoan) => {
        repledgeLoan.loans.map((loanComponent) => {
          lenders.push(loanComponent.lenderid);
          return true;
        });
      });
      return lenders.includes('icici');
    },
    nextWorkingDaysText() {
      if (!this.newLoansData) return '';
      const secureComponentOfNewLoan = this.newLoansData.loans[0].find((loanComponent) => loanComponent.type === 'secure');
      const workingDays = this.renewalForICICILender
        ? secureComponentOfNewLoan.daysinnwd + 1 : secureComponentOfNewLoan.daysinnwd;
      const days = workingDays === 1 ? 'next' : `next ${workingDays}`;
      return `Renewal of this loan(s) will be done on the ${days} business day
              and hence amount payable includes the interest till the ${days}
              business day.`;
    },
    summaryOptions() {
      let totalCurrentLoanAmount = 0;
      let totalNewLoanAmount = 0;
      let totalTopUpAmount = 0;
      let totalDifferenceAmount = 0;
      let totalInterestAmount = 0;
      let isTopupOptionSelected = false;
      let processingFee = 0;
      let excessFundingAmount = 0;
      let lenderRenewalCharges = 0;
      const selectedLoans = [];
      this.repledgeLoans.forEach((repledgeLoan) => {
        const secureComponentOfLoan = secureComponent(repledgeLoan);
        const { newLoan } = secureComponentOfLoan;
        const secureComponentOfNewLoan = newLoan.find((loanComponent) => loanComponent.type === 'secure');
        const lenders = [];
        const loanDate = moment(repledgeLoan.bookedDate).format('DD/MM/YYYY');
        let loanAmount = 0;
        repledgeLoan.loans.map((loanComponent) => {
          lenders.push(this.lendersConfig[loanComponent.lenderid].name);
          totalTopUpAmount += loanComponent.topUpAmount ? loanComponent.topUpAmount : 0;
          if (loanComponent.active) {
            loanAmount += loanComponent.loanamount;
          }
          if (loanComponent.isEligibleLE) {
            isTopupOptionSelected = loanComponent.isEligibleLE;
          }
          return true;
        });
        if (this.kglLoan) {
          totalCurrentLoanAmount += loanAmount;
        } else {
          totalCurrentLoanAmount += secureComponentOfLoan.loanamount;
        }
        selectedLoans.push({ lenders: lenders.join(' & '), loanDate, loanAmount });
        excessFundingAmount += _.get(secureComponentOfNewLoan, 'reconrecovery', 0);
        if (secureComponentOfLoan.isSelectedLELoan) {
          totalNewLoanAmount += this.kglLoan ? _.get(secureComponentOfNewLoan, 'loanEnhancement.currentDayPrincipleAmount', 0) : secureComponentOfLoan.loanamount;
        } else if (!secureComponentOfLoan.isSelectedLELoan) {
          if (!secureComponentOfLoan.replegeAmtUpdated) {
            totalNewLoanAmount += this.kglLoan ? _.get(secureComponentOfNewLoan, 'defaultRepledge.currentDayPrincipleAmount', 0) : secureComponentOfLoan.loanamount;
            processingFee += _.get(secureComponentOfNewLoan, 'defaultRepledge.totalCharges', 0);
            totalDifferenceAmount += _.get(secureComponentOfNewLoan, 'defaultRepledge.differenceAmount', 0);
            totalInterestAmount += _.get(secureComponentOfNewLoan, 'defaultRepledge.interestPayable', 0);
            excessFundingAmount += _.get(secureComponentOfNewLoan, 'defaultRepledge.unsecSoftRecoveryComponent', 0);
            if (this.renewalForICICILender) {
              lenderRenewalCharges += _.get(secureComponentOfNewLoan, 'defaultRepledge.lenderRenewalCharges', 0);
            }
          } else {
            totalNewLoanAmount += this.kglLoan ? _.get(secureComponentOfNewLoan, 'moreRepledge.currentDayPrincipleAmount', 0) : secureComponentOfLoan.loanamount;
            processingFee += _.get(secureComponentOfNewLoan, 'moreRepledge.totalCharges', 0);
            totalDifferenceAmount += _.get(secureComponentOfNewLoan, 'moreRepledge.differenceAmount', 0);
            totalInterestAmount += _.get(secureComponentOfNewLoan, 'moreRepledge.interestPayable', 0);
            excessFundingAmount += _.get(secureComponentOfNewLoan, 'moreRepledge.unsecSoftRecoveryComponent', 0);
            if (this.renewalForICICILender) {
              lenderRenewalCharges += _.get(secureComponentOfNewLoan, 'moreRepledge.lenderRenewalCharges', 0);
            }
          }
        }
      });
      const sources = this.assets.map((asset) => ({
        type: asset.assetType,
        src: asset.assetUrl,
      }));
      const {
        assetUrl = '',
        title = '',
        description = '',
        duration = '',
        thumbnailUrl = '',
      } = this.assets.length && this.assets[0];
      return {
        loans: {
          numberOfLoans: this.selectedLoans.length,
          selectedLoans,
        },
        totalCurrentLoanAmount,
        totalNewLoanAmount,
        totalTopUpAmount,
        totalDifferenceAmount,
        lenderRenewalCharges,
        renewalForICICILender: this.renewalForICICILender,
        nextWorkingDaysText: this.nextWorkingDaysText,
        totalInterestAmount,
        excessFundingAmount,
        processingFee,
        totalAmountPayable: this.totalRenewalAmount,
        isTopupOptionSelected,
        assets: {
          showGoldPriceAdjustmentThumbnail: assetUrl.length > 0,
          title,
          description,
          duration,
          thumbnailImageUrl: thumbnailUrl,
          sources,
        },
      };
    },
  },
  watch: {
    selectedLoans: {
      immediate: true,
      handler(newval) {
        const data = newval;
        this.repledgeLoans = JSON.parse(JSON.stringify(data));
        if (!this.newLoansData) {
          this.newLoansArray = [];
        } else {
          this.newLoansArray = this.newLoansData.loans;
        }
        this.validateLoans();
        this.calculateRenewalAmount();
        this.updateTermsAndConditions();
      },
    },
    renewalForICICILender(value) {
      if (value) {
        this.getStaticMessages('renewal-summary');
      }
    },
    staticMessage(data) {
      this.icicMessage = _.get(data, 'icici_renewal_calculation_summary.content.message');
    },
  },
  methods: {
    toMonthlyInterestRate,
    formatRupeeAmount,
    ...mapActions({
      setCurrentLPLoanID: 'renewal/setCurrentLPLoanID',
    }),
    moment: (date) => moment(date),
    goBackPreviousScreen() {
      this.$router.go(-1);
    },
    getMessage(loanDetails) {
      return `The loan you have selected consists of both "${this.lendersConfig[loanDetails[0].lender].name}} 6M" and "${this.lendersConfig[loanDetails[1].lender].name}} SGL" loan components`;
    },
    // for getting total loan amount
    getLoanAmount(loan) {
      let totalLoanAmount = 0;
      loan.map((key) => {
        if (key.active) {
          totalLoanAmount += key.loanamount;
        }
        return true;
      });
      return totalLoanAmount;
    },
    // for viewing the repledge loan details
    viewRepledgeLoanDetails(loandata) {
      this.repledgeLoanDetail = loandata.loans;
      this.selectedLoanTerms = [];
      loandata.loans.map((loan) => {
        if (loan.netweight > 0) {
          loan.newLoan.map((key) => {
            const newloanObj = key;
            // eslint-disable-next-line
            if ((!loan.replegeAmtUpdated && (loan.defaultRepledge && (newloanObj.type === 'secure') || loan.defaultRepledge.currentDayRupeekPrinciple > 0)) || (loan.replegeAmtUpdated && (loan.moreRepledge && (newloanObj.type === 'secure') || loan.moreRepledge.currentDayRupeekPrinciple > 0)) || (loan.isSelectedLELoan && (loan.loanEnhancement && (newloanObj.type === 'secure') || loan.loanEnhancement.currentDayRupeekPrinciple > 0))) {
              if (!this.selectedLoanTerms.length) {
                this.selectedLoanTerms.push({ terms: newloanObj.type === 'secure' ? this.newLoansData.secureterms : this.newLoansData.unsecureterms, lenderName: this.lendersConfig[newloanObj.lender].name, lender: newloanObj.lender });
              } else if (this.selectedLoanTerms.length < 2) {
                this.selectedLoanTerms.map((key1) => {
                  if (key1.lender !== newloanObj.lender) {
                    this.selectedLoanTerms.push({ terms: newloanObj.type === 'secure' ? this.newLoansData.secureterms : this.newLoansData.unsecureterms, lenderName: this.lendersConfig[newloanObj.lender].name, lender: newloanObj.lender });
                  }
                  return true;
                });
              }
            }
            return true;
          });
        }
        return true;
      });
      this.$router.push({
        name: 'RenewalLoanDetails',
        params: {
          loanDetails: this.repledgeLoanDetail,
          additionalText: this.newLoansData,
          terms: this.selectedLoanTerms,
        },
      });
      this.isHideTooltips = true;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_RENEWAL_DETAILS_LINK_CLICKED,
      };
      sendEvent(events.screen.REPLEDGE_LOAN_SUMMARY, events.category.PAYMENT, properties);
    },
    // for closing the details page
    closeDetailsComponent() {
      this.isHideTooltips = false;
    },
    // updating terms and conditions when customer updates the more repledge
    updateTermsAndConditions() {
      const selectedLELoans = [];
      this.terms = [];
      this.repledgeLoans.map((key) => {
        key.loans.map((loan) => {
          if (loan.netweight > 0) {
            if (loan.defaultRepledge.currentDayLenderPrinciple > 0 || loan.loanEnhancement) {
              selectedLELoans.push('secure');
            }
            if (loan.isSelectedLELoan && loan.loanEnhancement
              && loan.loanEnhancement.currentDayRupeekPrinciple > 0) {
              selectedLELoans.push('unsecure');
            }
          }
          return true;
        });
        return true;
      });
      this.newLoansArray.map((newLoans) => {
        newLoans.map((newLoan) => {
          this.repledgeLoans.map((key) => {
            key.loans.map((loan) => {
              const data = JSON.parse(JSON.stringify(loan));
              if (Number(data.coreid) === newLoan.loanid) {
                data.newLoan = newLoans.map((newloanDetail) => {
                  const newloanObj = newloanDetail;
                  // eslint-disable-next-line
                  if ((!data.replegeAmtUpdated && !data.isSelectedLELoan && (data.defaultRepledge && (newloanObj.type === 'secure') || data.defaultRepledge.currentDayRupeekPrinciple > 0)) || (data.replegeAmtUpdated && !data.isSelectedLELoan && (data.moreRepledge && (newloanObj.type === 'secure') || data.moreRepledge.currentDayRupeekPrinciple > 0)) || (!data.replegeAmtUpdated && data.isEligibleLE && (data.loanEnhancement && (newloanObj.type === 'secure') || selectedLELoans.includes('unsecure')))) {
                    if (!this.terms.length) {
                      this.terms.push({ terms: newloanObj.type === 'secure' ? this.newLoansData.secureterms : this.newLoansData.unsecureterms, lenderName: this.lendersConfig[newloanObj.lender].name, lender: newloanObj.lender });
                    } else if (this.terms.length < 2) {
                      this.terms.map((key1) => {
                        if (key1.lender !== newloanObj.lender) {
                          this.terms.push({ terms: newloanObj.type === 'secure' ? this.newLoansData.secureterms : this.newLoansData.unsecureterms, lenderName: this.lendersConfig[newloanObj.lender].name, lender: newloanObj.lender });
                        }
                        return true;
                      });
                    }
                  }
                  return newloanObj;
                });
              }
              return data;
            });
            return true;
          });
          return true;
        });
        return true;
      });
    },
    openPaymentsOption() {
      if (this.populateAmounts.repledgeAmount >= 100) {
        getPaymentMethodsBasedOnLoansLender(
          this.nonKglSelectedLoans,
          this.paymentOption,
          false,
        );
      } else {
        this.getPaymentsLink(false);
      }
    },
    // fn to check kgl loans
    validateLoans() {
      this.repledgeLoans.map((key) => {
        key.loans.map((loan) => {
          if ((loan.lenderid === 'rupeek' || loan.lenderid === 'yogakshemam') && loan.netweight) {
            this.kglLoan = false;
            this.rupeekSecure = true;
          } else {
            this.kglLoan = true;
            this.rupeekSecure = false;
          }
          return true;
        });
        return true;
      });
    },
    calculateRenewalAmount() {
      this.totalRenewalAmount = 0;
      this.repledgeLoans.map((key) => {
        key.loans.map((loan) => {
          if (!loan.replegeAmtUpdated && !loan.isSelectedLELoan) {
            this.totalRenewalAmount += loan.defaultRepledge && loan.defaultRepledge.repledgeamount
              ? loan.defaultRepledge.repledgeamount : 0;
          } else if (loan.replegeAmtUpdated && !loan.isSelectedLELoan) {
            this.totalRenewalAmount += loan.moreRepledge && loan.moreRepledge.repledgeamount
              ? loan.moreRepledge.repledgeamount : 0;
          } else if (loan.isSelectedLELoan) {
            this.totalRenewalAmount += 0;
          }
          return true;
        });
        return true;
      });
    },
    // for fetching the sign methods
    fetchOrderId() {
      const sendData = { scheme: this.selectedScheme, loans: [] };
      this.repledgeLoans.map((key) => {
        key.loans.map((loan) => {
          if (loan.loanType !== 'N:1' && loan.netweight > 0) {
            if (loan.replegeAmtUpdated && !loan.isSelectedLELoan) {
              sendData.loans.push({
                loanid: loan.loanid,
                coreid: loan.coreid,
                eligibleweight: loan.eligibleweight,
                keyword: loan.newLoan[0].moreRepledge.keyword,
              });
            } else if (!loan.replegeAmtUpdated && !loan.isSelectedLELoan) {
              sendData.loans.push({
                loanid: loan.loanid,
                coreid: loan.coreid,
                eligibleweight: loan.eligibleweight,
                keyword: loan.newLoan[0].defaultRepledge.keyword,
              });
            } else if (loan.isSelectedLELoan) {
              sendData.loans.push({
                loanid: loan.loanid,
                coreid: loan.coreid,
                eligibleweight: loan.eligibleweight,
                keyword: loan.newLoan[0].loanEnhancement.keyword,
              });
              sendData.loanEnhancementScheme = loan.scheme;
            }
          }
          return true;
        });
        return true;
      });
      fetchOrderId(sendData)
        .then((response) => {
          this.orderId = response.data.order;
          this.showDocVerification = true;
          this.trackRepledgeOrderCreated();
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    trackRepledgeOrderCreated() {
      const coreIds = [];
      const lenders = [];
      const loanType = [];
      const coreKeyword = [];
      this.repledgeLoans.map((selectedLoan) => {
        const { loans } = selectedLoan;
        if (!loans[0].isSelectedLELoan) {
          if (!loans[0].replegeAmtUpdated) {
            coreKeyword.push(`${loans[0].coreid}:${loans[0].defaultRepledge.keyword}`);
          } else {
            coreKeyword.push(`${loans[0].coreid}:${loans[0].moreRepledge.keyword}`);
          }
        } else {
          coreKeyword.push(`${loans[0].coreid}:${loans[0].loanEnhancement.keyword}`);
        }
        loans.map((loanComponent) => {
          lenders.push(loanComponent.lenderName);
          coreIds.push(loanComponent.coreid);
          loanType.push(loanComponent.type);
          return true;
        });
        return true;
      });
      const amount = this.kglLoan ? this.totalRenewalAmount
        : this.populateAmounts.repledgeAmount;
      const eventProperties = {
        [events.EVENT_NAME]: events.PAYMENT_RENEWAL_CONTINUE_FROM_SUMMARY_CLICKED,
        [events.PAYMENT_ACTION]: events.CAPABILITY_REPLEDGE,
        [events.PAYMENT_CORE_ID]: coreIds.join(','),
        [events.PAYMENT_AMOUNT]: formatRupeeAmount(amount),
        [events.PAYMENT_LENDER_ID]: _.uniq(lenders).join(' & '),
        [events.PAYMENT_ORDER_ID]: this.orderId,
        [events.PAYMENT_LOAN_TYPE]: _.uniq(loanType).join(' , '),
        [events.PAYMENT_RENEWAL_PARTIAL]: _.get(this.newLoansData, 'ispartial', false),
        [events.PAYMENT_CORE_KEYWORD_MAPPING]: coreKeyword.join(','),
      };
      sendEvent(events.screen.REPLEDGE_LOAN_SUMMARY, events.category.PAYMENT, eventProperties);
    },
    // function call to dispaly modify loan amount button if hasMore has true
    chackingHasMore(item) {
      let ishasMore = false;
      item.loans.map((loan) => {
        if (loan.netweight > 0 && loan.newLoan) {
          loan.newLoan.map((newloan) => {
            if (newloan.hasMore) {
              ishasMore = newloan.hasMore;
            }
            return true;
          });
        }
        return true;
      });
      return ishasMore;
    },
    /* function call to check every repledgeLoan this loan is Eligible for LE Loan or not
      if LE loan is there dispaly LE loan message loan level and modify loan amount button
    */
    loanEnhancements(item) {
      let isLoanEnhancements = false;
      item.loans.map((loan) => {
        if (loan.isEligibleLE) {
          isLoanEnhancements = loan.isEligibleLE;
        }
        return true;
      });
      return isLoanEnhancements;
    },
    closeModel() {
      this.isHideTooltips = false;
    },
    // function call user click get top up amount button
    modifyLoanAmt(item) {
      this.isHideTooltips = true;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_RENEWAL_GET_TOP_UP_AMOUNT_CLICKED,
      };
      sendEvent(events.screen.REPLEDGE_LOAN_SUMMARY, events.category.PAYMENT, properties);
      this.onModifyRepledgeLoanAmountClicked(secureComponent(item).loanid);
    },
    onModifyRepledgeLoanAmountClicked(lploanid) {
      this.showLoanSelectionModal = true;
      this.setCurrentLPLoanID(lploanid);
    },
    onLoanSelectionModalCompleted() {
      this.showLoanSelectionModal = false;
    },
    // function call to get sum of topup amount
    getTotalTopUpAmount() {
      let totalTopUpAmount = 0;
      this.repledgeLoans.map((item) => {
        item.loans.map((loan) => {
          totalTopUpAmount += loan.topUpAmount ? loan.topUpAmount : 0;
          return true;
        });
        return true;
      });
      return totalTopUpAmount;
    },
    setLoanDetails(loans) {
      const loansArray = [];
      loans.forEach((loan) => {
        const loanObj = {
          loanAmount: loan.loanamount,
          lender: loan.lenderid,
          type: loan.netweight ? 'secure' : 'unsecure',
          schemes: loan.oldscheme,
          hasShowPerAnnum: true,
          schemeMessage: 'Starting Interest Rate*',
        };
        loansArray.push(loanObj);
      });
      return loansArray;
    },
    setNewLoanDetails(items) {
      const loansArray = [];
      items.loans.forEach((loan) => {
        if (loan.newLoan) {
          loan.newLoan.forEach((newLoan, index, newLoansInfo) => {
            const { type } = newLoan;
            const loanObj = {
              type,
              loanAmount: this.getLoanAmt(newLoansInfo[0],
                loan.isSelectedLELoan,
                loan.replegeAmtUpdated,
                type)[type],
              lender: newLoan.lender,
              schemes: newLoansInfo[0].scheme,
              hasShowPerAnnum: true,
              schemeMessage: loan.isSelectedLELoan
                ? '*Applied as per repayments history' : 'Starting Interest Rate*',
              items,
              hasShowGetTopUp: (this.loanEnhancements(items) || this.chackingHasMore(items)),
            };
            if (loanObj.loanAmount) {
              loansArray.push(loanObj);
            }
          });
        }
      });
      return loansArray;
    },
    getLoanAmt(newLoan, hasSelectedLELoan, replegeAmtUpdated, type) {
      const loanAmount = {};
      if (hasSelectedLELoan) {
        loanAmount[type] = type === 'secure'
          ? _.get(newLoan, 'loanEnhancement.currentDayLenderPrinciple')
          : _.get(newLoan, 'loanEnhancement.currentDayRupeekPrinciple');
      } else if (replegeAmtUpdated) {
        loanAmount[type] = type === 'secure'
          ? _.get(newLoan, 'moreRepledge.currentDayLenderPrinciple')
          : _.get(newLoan, 'moreRepledge.currentDayRupeekPrinciple');
      } else {
        loanAmount[type] = type === 'secure'
          ? _.get(newLoan, 'defaultRepledge.currentDayLenderPrinciple')
          : _.get(newLoan, 'defaultRepledge.currentDayRupeekPrinciple');
      }
      return loanAmount;
    },
    getPayableAmount(items) {
      let payableAmount = 0;
      if (_.get(items, 'loans[0].isSelectedLELoan')) {
        payableAmount = _.get(items, 'loans[0].loanEnhancement.repledgeamount');
      } else if (_.get(items, 'loans[0].replegeAmtUpdated')) {
        payableAmount = _.get(items, 'loans[0].moreRepledge.repledgeamount');
      } else {
        payableAmount = _.get(items, 'loans[0].defaultRepledge.repledgeamount');
      }
      return payableAmount;
    },
    getPaymentsLink(enachFlag) {
      const requestObj = {};
      const paymentData = {};
      const returnLenderArray = [];
      let kglLoan = false;
      const lendersArray = this.nonKglSelectedLoans.map((key) => {
        key.loans.map((loan) => {
          if (loan.active) {
            if (loan.lenderid === 'federal' && loan.netweight) {
              kglLoan = true;
            }
            returnLenderArray.push(loan.lenderid);
          }
          return true;
        });
        return returnLenderArray;
      });
      requestObj.lender = [...new Set(lendersArray[0])];
      paymentData.enach = enachFlag;
      requestObj.paymentamount = Math.ceil(this.populateAmounts.repledgeAmount);
      paymentData.type = 'repledge';
      paymentData.loans = this.getLoansArray();
      requestObj.paymentdata = paymentData;
      if (kglLoan) {
        requestObj.paymentdata.verificationtype = this.repledgeType;
      }
      getPaymentLink(requestObj)
        .then((response) => {
          if (response.status === 200) {
            const rpkId = response.data.response.link;
            if (response.data.response.link) {
              this.$router.push(`/pay-now/${rpkId}`);
            } else {
              this.$noty.success(response.data.message);
              setTimeout(() => { this.$router.go(); }, 3000);
            }
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    // function to create the request payload for selected loans
    getLoansArray() {
      const loansArray = [];
      this.nonKglSelectedLoans.forEach((key) => {
        key.loans.forEach((loan) => {
          const returnLoansArray = {};
          returnLoansArray.lender = loan.lenderid;
          returnLoansArray.loanid = loan.loanid;
          if (loan.lenderid === 'federal') {
            if (loan.replegeAmtUpdated) {
              returnLoansArray.paidamount = _.get(loan, 'moreRepledge.repledgeamount', 0);
              returnLoansArray.repledgetype = _.get(loan, 'moreRepledge.currentDayPrincipleAmount')
                ? _.get(loan, 'moreRepledge.keyword') : '';
            } else {
              returnLoansArray.paidamount = _.get(loan, 'defaultRepledge.repledgeamount', 0);
              returnLoansArray.repledgetype = _.get(loan, 'defaultRepledge.currentDayPrincipleAmount')
                ? _.get(loan, 'defaultRepledge.keyword') : '';
            }
          } else {
            returnLoansArray.paidamount = _.get(loan, 'repledgeamount', 0);
          }
          loansArray.push(returnLoansArray);
        });
      });
      return loansArray;
    },
  },
  mounted() {
    this.checkPaymentOption();
    this.getAssetsFromFirebase('gold_price_adjustment');
  },
};
</script>
<style lang="scss">
@import "@/scss/repledge/repledge.scss";
.lender-summary {
  margin-left: 20px;
  margin-right: 20px;
}
.theme-bgcolor {
  background-color: rgba(254, 148, 17, 0.1);
}
.bgcolor-white {
  background-color: #f7f8fa;
}
.renewal-summary {
  padding : 20px 0px 30px 0px;
  border-top : 1px solid #D9D9D9;
  border-bottom: 10px solid #f2f2f2;
}
.scheme-change {
  padding: 16px 18px;
  border-radius: 4px;
  background-color: #ffeed9;
  p{
    font-weight: 600;
  }
  span{
    font-size: 11px;
    color: #867765;
  }
}
.top-up-loan {
  background-color: $body-background-color;
  .topup-loan-eligible-info {
    font-size: 12px;
    font-weight: 600;
    color: #50bb7d;
  }
  .topup-loan-eligible-note {
    font-size: 10px;
  }
  .payment-options {
    &.active {
      border-color: #fe9411;
      font-weight: bold;
    }
  }
  .payment-options {
    background-color: $white-color;
    border-color: $white-color;
    font-size: 22px;
   .form-check-label {
     padding: 17px 0;
     line-height: 1;
     span {
       font-size: 16px;
     }
   }
  }
}
.topup-loan-footer {
  border-top: 1px solid #fafafa;
  padding: 10px 16px;
  .interest-rate-info {
    font-size: 10px;
    span {
      font-size: 13px;
    }
    &.w-40 {
      width: 40%;
    }
  }
}
.interest-rate-text {
  font-size: 9px;
  font-weight: 600;
}
.interest-rate-text-small {
  font-size: 9px;
  color:#737373;
}
.top-up-options {
  background-color: $body-background-color;
  height: 40rem;
  overflow-y: scroll;
}
.repledge-summary .footer {
  position: absolute;
  padding: 4px 16px;
  bottom: 0;
  left: 0;
  border: 1px solid #e5e5e5;
}
.amount-details {
  h3 {
    font-size: .8125rem;
    color: #727272;
    margin-bottom: 8px;
  }
  h4 {
    font-size: 3rem;
  }
  h5 {
    font-size: 2rem;
  }
}
.summary-loans {
  &.loans  {
    border: 1px solid #f5f5f5;;
    border-radius: 8px;
    &.basic-details {
      padding: 16px;
      &> .flex-1{
        min-width: 33.33%;
        max-width: 33.33%;
      }
      &.label {
        font-size: 0.687rem;
        color: $tertiary-color;
        margin-bottom: 4px;
      }
      h5 {
        font-size: 0.875rem;
        margin: 0;
      }
      &.part-payment {
        padding: 16px;
        &>.flex-1{
          min-width: 50%;
          max-width: 50%;
          &:first-child {
            border-right: 1px solid #f5f5f5;;
            margin-right: 20px;
            max-width: 45%;
            min-width: 45%;
          }
        }
        h4 {
          font-size: 0.687rem;
        }
      }
    }
    & .selected-loan-amount {
      padding: 20px 16px;
      h5 {
        color: #727272;
        font-size: 1rem;
      }
      h6 {
        font-size: 1.5rem;
      }
    }
  }
}
</style>
