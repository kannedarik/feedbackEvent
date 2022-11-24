<template>
  <div class="loan-details-wrapper block" @click="showHamburgerMenu = false">
    <nav class="flex items-center justify-between position-relative bg-white sm:px-4 md:px-8 py-3">
      <div class="md:flex md:items-center">
        <div>
          <img src="~@/assets/icons/left_arrow.svg" alt="back"
            class="cursor-pointer" @click="goBack()"/>
        </div>
        <div class="sm:mt-3 md:mt-0 md:ml-3">
          <h2 class="font-semibold text-lg">
            Loan Details
          </h2>
        </div>
      </div>
      <div class="menu position-relative" @click="toggleShowHamburgerMenu"
        v-if="!hasTakeoverLoan">
        <img src="@/assets/dashboard/DotsThree.svg" alt="menu">
        <transition name="nav-menu">
          <DropDownMenu
            v-show="showHamburgerMenu"
            @click="toggleShowHamburgerMenu"
            :hamburgerMenuItems="hamburgerMenuItems">
          </DropDownMenu>
      </transition>
      </div>
    </nav>
    <div class="loan-details-container container-fluid p-0">
      <header class="loan-details__header flex flex-column sm:px-4 md:px-8 py-3">
        <div class="loan-details__header-wrapper">
          <div class="lender-interest-tenure d-flex">
            <div class="d-flex flex-align-center lender-icons">
              <div class="icon" v-for="lender in lendersInfo" :key="lender">
                <img :src="lendersConfig[lender].iconLink" :alt="lender">
              </div>
            </div>
            <div class="d-flex flex-align-center details inter-font-family">
              <h3 class="bold-font">
                {{ _.join(_.map(lendersInfo, (lender) => lendersConfig[lender].name), ' & ') }}
              </h3>
            </div>
          </div>
          <div class="d-flex flex-wrap tags inter-font-family">
            <div class="tag rounded" v-if="hasTakeoverLoan">
              {{schemeName}}
            </div>
            <div class="tag rounded" v-if="!hasTakeoverLoan">
              {{loanType}} Repayment
            </div>
             <div class="tag rounded" v-if="!hasTakeoverLoan">
               {{loanTenure}} Months tenure
              </div>
            <div class="tag rounded"
              v-if="loansArray[0].startingroi && !hasTakeoverLoan">
              Starting interest at {{loanInterestRate}}% p.m. ({{loansArray[0].startingroi}}% p.a.)
            </div>
          </div>
          <div class="loan-date-amount d-flex justify-content-between inter-font-family">
            <div class="loan-detail">
              <label class="loan-detail__title">Loan Date</label>
              <h4 class="loan-detail__value">{{loanDate}}</h4>
            </div>
            <div class="loan-detail">
              <label class="loan-detail__title">Loan Amount</label>
              <h4 class="loan-detail__value">{{loanAmount}}</h4>
            </div>
            <div class="loan-detail">
              <label class="loan-detail__title">Closure Amount</label>
              <h4 class="loan-detail__value">{{loanClosureAmount}}</h4>
            </div>
          </div>
        </div>
      </header>
      <div class="flex loan-details__content sm:px-4 md:px-8 py-2">
        <div class="card rounded-3 loan-details-card inter-font-family">
          <div class="flex card-title__loan-details">
            <div class="flex items-center col-3 loan-component__title"></div>
            <h5 class="flex items-center col loan-component__title ml-5"
              v-for="lender in lenders" :key="lender">
              {{_.join(
                  _.map(combinedLoanDetails.lenders[lender], (lender) =>
                    lendersConfig[lender].name), ' & ')
              }}
            </h5>
          </div>
          <div class="card-body__loan-details" v-for="loanDetails in loanDetailsToShow"
            :key="loanDetails.alias" :class="_.isEmpty(loanDetails.value) ? 'd-none' : 'd-flex'">
            <div class="flex items-center col-3 loan-component__title">
              {{ loanDetails.alias }}
            </div>
            <div v-for="lender in lenders" :key="lender" class="position-relative"
              :class="{'flex items-center col loan-component__detail':
              !_.isEmpty(loanDetails.value[lender])}">
              <p :class="{'flex items-center': (_.get(loanDetails, `hasProcessingFee[${lender}]`)
                && _.get(loanDetails, `hasProcessingFee[${lender}]`).length)
                || _.get(loanDetails, `message[${lender}]`, false)}">
                <span v-html="loanDetails.value[lender]" class="block"
                :class="{'chip__text__danger': !_.isEmpty(loanDetails.valuePreviousIOR)}">
                </span>
                <span v-if="_.get(loanDetails, 'valuePreviousIOR')"
                  class="block previous-IOR"
                  v-html="loanDetails.valuePreviousIOR[lender]">
                </span>
                <span class="cursor-pointer"
                  :class='{"processing-fee" : showHideProcessingFee}'
                  v-if="_.get(loanDetails, `hasProcessingFee[${lender}]`)
                    && _.get(loanDetails, `hasProcessingFee[${lender}]`).length">
                  <img src="@/assets/icons/grey_info_icon.svg" alt="processing-fee-info"
                    v-click-outside="hideProcessingFeeTooltip" @click.stop="showHidePFBreakDown()">
                </span>
                <span class="cursor-pointer"
                  :class='{"processing-fee" : hasShowExcessFundingMessage}'
                  v-if="_.get(loanDetails, `message[${lender}]`)">
                  <img src="@/assets/icons/grey_info_icon.svg" alt="excess_funding_info"
                    v-click-outside="hideExcessFundingMessageTooltip"
                    @click.stop="showHideExcessFundingMessage()">
                </span>
                <span v-if="_.get(loanDetails, 'reason')"
                  v-html="loanDetails.reason[lender]" class="block chip__text__danger">
                </span>
              </p>
              <!-- Excess funding tooltip section -->
              <div class="custom-tooltip excess-funding"
                :class='{"d-block" : hasShowExcessFundingMessage
                && _.get(loanDetails, `message[${lender}]`)}'>
                <span>{{_.get(loanDetails, `message[${lender}]`)}}</span>
              </div>
              <!-- End's excess funding tooltip section -->
              <!-- processing fee tooltip -->
              <div class="custom-tooltip"
                v-if="_.get(loanDetails, `hasProcessingFee[${lender}]`)
                && _.get(loanDetails, `hasProcessingFee[${lender}]`).length"
                :class='{"d-block" : (showHideProcessingFee
                  && _.get(loanDetails, `hasProcessingFee[${lender}]`))}'>
                <div class="d-flex align-items-center justify-content-between pb-3">
                  <p>Loan Amount</p>
                  <p> {{_.get(loanDetails, `amount[${lender}]`)}}</p>
                </div>
                <div class="d-flex align-items-center justify-content-between pb-3">
                  <p>Processing Fee</p>
                  <p>- {{_.get(loanDetails, `processingFee[${lender}]`)}}</p>
                </div>
                <div class="d-flex align-items-center justify-content-between pb-3">
                  <p>GST 18%</p>
                  <p>- {{_.get(loanDetails, `gst[${lender}]`)}}</p>
                </div>
                <div class="d-flex align-items-center justify-content-between font-weight-bold">
                  <p>TOTAL</p>
                  <p>{{_.get(loanDetails, `totalAmount[${lender}]`)}}</p>
                </div>
              </div>
              <!-- End's the processing fee tooltip-->
            </div>
          </div>
        </div>
        <div class="d-flex scheme-details-container" ref="schemeDetails"
          v-if="!hasTakeoverLoan">
          <h3 class="bold-font">Scheme Details</h3>
          <div class="card rounded-3 scheme-details-card p-3 inter-font-family">
            <div class="d-flex scheme-details-card__title">
              <label>Scheme Name</label>
              <h3>{{loanType}} Repayment</h3>
            </div>
            <div class="d-grid scheme-details-grid">
              <div class="flex scheme-details__grid-item"
                v-for="schemeDetail in schemeDetails" :key="schemeDetail.title">
                <div class="flex scheme-detail">
                  <div class="scheme-detail__image">
                    <img :src="schemeDetail.iconLink" :alt="schemeDetail.title">
                  </div>
                  <div class="scheme-detail__text ml-2">
                    <label>{{schemeDetail.title}}</label>
                    <h4 class="text-capitalize interest-rate-slab"
                      v-html="schemeDetail.description">
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mb-2" v-if="hasTakeoverLoan">
          <MessagesBox
            :message="takeoverMessage"
            :hasShowImpinfoIcon="false"
            :hasShowFullWidth="true"
          />
        </div>
        <div ref="jewelSection" v-if="!hasTakeoverLoan">
          <JewelsList class="mb-4" v-if="!_.isEmpty(jewelsList)"
            :jewelsList="_.get(jewelsList, 'selectedLoan[0].jewels', [])"
            :currentStatusCode="0"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
import ClickOutside from 'vue-click-outside';
import { mapGetters } from 'vuex';
import MessagesBox from '@/components/InfoMessagesBoxs/MessagesBox.vue';
import DropDownMenu from '@/components/CommonComponents/DropDownMenu/index.vue';
import JewelsList from '@/components/ReleaseTracker/jewelsList.vue';
import { formatRupeeAmount } from '@/utils/string';
import mixinComponent from '@/mixins/mixinComponent';
import calenderIcon from '@/assets/dashboard/loan-details/CalendarBlank.svg';
import percentIcon from '@/assets/dashboard/loan-details/Percent.svg';
import clockIcon from '@/assets/dashboard/loan-details/ClockClockwise.svg';
import chartIcon from '@/assets/dashboard/loan-details/ChartBar.svg';

export default {
  name: 'LoanDetails',
  data() {
    return {
      // flag to show/hide excess funding tooltip
      excessFunding: false,
      // variable to store the selected jewel index value
      selectedjewelIndex: null,
      // flag to show/hide processing fee tooltip
      isProcessingFee: false,
      // variable to store the processing fee amount
      processingFee: 0,
      // variable to store the GST amount
      gst: 0,
      showHideProcessingFee: false,
      showHamburgerMenu: false,
      hasTakeoverLoan: false,
      takeoverMessage: '',
      hasShowExcessFundingMessage: false,
      hamburgerMenuItems: [
        {
          id: 'schemeDetails',
          name: 'Scheme Details',
          onClickHandler: () => this.slideToView(this.$refs.schemeDetails),
        },
        {
          id: 'viewJewels',
          name: 'View Jewels',
          onClickHandler: () => this.slideToView(this.$refs.jewelSection),
        },
        // {
        //   id: 'pledgeCard',
        //   name: 'Pledge Card',
        //   onClickHandler: () => {},
        // },
        // {
        //   id: 'paymentHistory',
        //   name: 'Payment History',
        //   onClickHandler: () => {},
        // },
      ],
    };
  },
  components: {
    JewelsList,
    MessagesBox,
    DropDownMenu,
  },
  mixins: [mixinComponent],
  computed: {
    ...mapGetters({
      jewelsList: 'jewels/jewelsList',
    }),
    _() {
      return _;
    },
    lendersInfo() {
      const lenders = [];
      _.map(this.loansArray, (loan) => _.map(loan.lenders, (lender) => lenders.push(lender)));
      return [...new Set(lenders)];
    },
    lenders() {
      return _.map(this.loansArray, (loan) => loan.lenderid);
    },
    combinedLoanDetails() {
      const combinedLoans = {};
      _.forEach(this.loansArray, (loan) => {
        _.forEach(loan, (value, key) => {
          if (!combinedLoans[key]) combinedLoans[key] = {};
          combinedLoans[key][loan.lenderid] = value;
        });
      });
      return combinedLoans;
    },
    loanDetailsToShow() {
      const branchAddressValue = {};
      const interestRateValue = {};
      const additionalChargesValue = {};
      const rebateValue = {};
      const totalLoan = {};
      const principalAmt = {};
      const interestAmount = {};
      const closingAmount = {};
      const previousIOR = {};
      const excessFunding = {};
      const excessFundingMessage = {};
      const loanEndDate = {};
      const hasProcessingFee = {};
      const amount = {};
      const processingFee = {};
      const gst = {};
      const totalAmount = {};
      const lenderBranchNotworking = {};
      const penalInterestRate = {};
      _.forEach(this.lenders, (lender) => {
        interestAmount[lender] = formatRupeeAmount(
          this.combinedLoanDetails.interest[lender]
          - _.get(this.combinedLoanDetails, `cashbackamount[${lender}]`, 0),
        );
        if (this.combinedLoanDetails.branch && this.combinedLoanDetails.branch[lender] && lender !== 'rupeek') {
          branchAddressValue[lender] = this.combinedLoanDetails.branch[lender].address;
          lenderBranchNotworking[lender] = !this.combinedLoanDetails.branch[lender].operational
            ? this.combinedLoanDetails.branch[lender].reason : '';
        }
        if (_.get(this.combinedLoanDetails, `penalinterestrate[${lender}]`) && lender !== 'rupeek') {
          penalInterestRate[lender] = `<b>${parseFloat(this.combinedLoanDetails.penalinterestrate[lender] / 12).toFixed(2)}% p.m</b>
            <small class="normal-font interest-rate-text-small">
              (${parseFloat(this.combinedLoanDetails.penalinterestrate[lender]).toFixed(2)}% p.a.)
            </small>`;
        }
        if (_.get(this.combinedLoanDetails, `currentinterestrateV2[${lender}]`) && lender !== 'rupeek') {
          interestRateValue[lender] = `<b>${parseFloat(this.combinedLoanDetails.currentinterestrateV2[lender] / 12).toFixed(2)}% p.m</b>
            <small class="normal-font interest-rate-text-small">
              (${parseFloat(this.combinedLoanDetails.currentinterestrateV2[lender]).toFixed(2)}% p.a.)
            </small>`;
          if (this.combinedLoanDetails.schemedata && this.combinedLoanDetails.schemedata[lender].type === 'jumping'
            && this.combinedLoanDetails.previousinterestrate) {
            previousIOR[lender] = `${(this.combinedLoanDetails.startingroi[lender] / 12).toFixed(2)}% p.m
              <small class="normal-font interest-rate-text-small">
                (${this.combinedLoanDetails.startingroi[lender]}% p.a.)
              </small>`;
          }
        }
        if ((this.combinedLoanDetails.coreDetails
          && this.combinedLoanDetails.coreDetails[lender]
          && this.combinedLoanDetails.coreDetails[lender].charges)) {
          hasProcessingFee[lender] = this.checkChargeType(
            this.combinedLoanDetails.coreDetails[lender].charges,
          );
          amount[lender] = formatRupeeAmount(this.combinedLoanDetails.coreDetails[lender].amount);
          processingFee[lender] = formatRupeeAmount(
            this.getProcessingFeeGST(
              this.combinedLoanDetails.coreDetails[lender].charges,
            ).chargeAmount,
          );
          gst[lender] = formatRupeeAmount(
            this.getProcessingFeeGST(
              this.combinedLoanDetails.coreDetails[lender].charges,
            ).taxAmount,
          );
          totalAmount[lender] = formatRupeeAmount(
            this.combinedLoanDetails.coreDetails[lender].disbursalAmount,
          );
        }
        if (this.combinedLoanDetails.Charges && this.combinedLoanDetails.Charges[lender]) {
          additionalChargesValue[lender] = formatRupeeAmount(
            this.combinedLoanDetails.Charges[lender],
          );
        }
        if (this.combinedLoanDetails.loanamount && this.combinedLoanDetails.loanamount[lender]) {
          totalLoan[lender] = formatRupeeAmount(this.combinedLoanDetails.loanamount[lender]);
        }
        if (this.combinedLoanDetails.balanceamount
          && this.combinedLoanDetails.balanceamount[lender]) {
          principalAmt[lender] = formatRupeeAmount(this.combinedLoanDetails.balanceamount[lender]);
        }
        if (this.combinedLoanDetails.closingamount
          && this.combinedLoanDetails.closingamount[lender]) {
          closingAmount[lender] = formatRupeeAmount(this.combinedLoanDetails.closingamount[lender]);
        }
        if (this.combinedLoanDetails.reconrecovery
          && this.combinedLoanDetails.reconrecovery[lender]) {
          excessFunding[lender] = formatRupeeAmount(this.combinedLoanDetails.reconrecovery[lender]);
          excessFundingMessage[lender] = this.combinedLoanDetails.recoverytext[lender];
        }
        if (this.combinedLoanDetails.loanenddate && this.combinedLoanDetails.loanenddate[lender] && lender !== 'rupeek') {
          loanEndDate[lender] = moment(this.combinedLoanDetails.loanenddate[lender]).utc().format('DD/MM/YYYY');
        }
        rebateValue[lender] = formatRupeeAmount(this.combinedLoanDetails.cashbackamount[lender]);
      });
      return [
        {
          alias: 'Total Loan',
          value: totalLoan,
          hasProcessingFee,
          amount,
          processingFee,
          gst,
          totalAmount,
        },
        {
          alias: 'Loan Id',
          value: this.combinedLoanDetails.coreid,
        },
        {
          alias: 'Branch Address',
          value: branchAddressValue,
          reason: lenderBranchNotworking,
        },
        {
          alias: 'Current Interest Rate',
          value: interestRateValue,
          valuePreviousIOR: previousIOR,
        },
        {
          alias: 'Penal Interest Rate',
          value: penalInterestRate,
        },
        {
          alias: 'Principal Amount',
          value: principalAmt,
        },
        {
          alias: 'Effective Interest Amount',
          value: interestAmount,
        },
        {
          alias: 'Rebate',
          value: rebateValue,
        },
        {
          alias: 'Additional Charges',
          value: additionalChargesValue,
        },
        {
          alias: 'Excess Funding',
          value: excessFunding,
          message: excessFundingMessage,
        },
        {
          alias: 'Closure Amount',
          value: closingAmount,
        },
        {
          alias: 'Loan End Date',
          value: loanEndDate,
        },
      ];
    },
    schemeDetails() {
      let tenure = '';
      let interestRate = '';
      let paymentFrequency = '';
      let iorSlab = '';
      _.forEach(this.lenders, (lender) => {
        if (lender !== 'rupeek') {
          if (
            this.combinedLoanDetails.schemedata
            && this.combinedLoanDetails.schemedata[lender].tenure
          ) {
            tenure = `${this.combinedLoanDetails.schemedata[lender].tenure} Months`;
          }
          if (
            this.combinedLoanDetails.startingroi
            && this.combinedLoanDetails.startingroi[lender]
          ) {
            interestRate = `Starting at ${parseFloat(this.combinedLoanDetails.startingroi[lender] / 12).toFixed(2)}% p.m.
            <small class="normal-font interest-rate-text-small">
              (${parseFloat(this.combinedLoanDetails.startingroi[lender]).toFixed(2)}% p.a.)
            </small>`;
          }
          if (
            this.combinedLoanDetails.paymentfreq
            && this.combinedLoanDetails.paymentfreq[lender]
          ) {
            paymentFrequency = this.checkSchemeType ? 'Pay by 1st of every month'
              : `Every ${this.combinedLoanDetails.paymentfreq[lender]} days`;
          }
          if (this.combinedLoanDetails.jumpingstructure) {
            iorSlab = this.getInRateSlab(this.combinedLoanDetails.jumpingstructure[lender],
              this.combinedLoanDetails.slabindex[lender]);
          }
        }
      });
      const schemeDetailsInfo = [
        {
          iconLink: calenderIcon,
          title: 'Tenure',
          description: tenure,
        },
        {
          iconLink: clockIcon,
          title: 'Payment Frequency',
          description: paymentFrequency,
        },
        {
          iconLink: percentIcon,
          title: 'Interest Rate',
          description: interestRate,
        },
        {
          iconLink: chartIcon,
          title: 'Interest Rate Slab',
          description: iorSlab,
        },
      ];
      return schemeDetailsInfo.filter((item) => item.description);
    },
    loanType() {
      return _.get(this.loansArray[0], 'schemedata.type') === 'jumping' ? 'One Shot' : 'Monthly';
    },
    loanInterestRate() {
      return ((_.get(this.loansArray[0], 'startingroi') / 12)).toFixed(2);
    },
    loanTenure() {
      return _.get(this.loansArray[0], 'schemedata.tenure');
    },
    loanDate() {
      return moment(_.get(this.loansArray[0], 'loanstartedon')).format('DD/MM/YYYY');
    },
    loanAmount() {
      return formatRupeeAmount(_.sumBy(this.loansArray, (key) => key.loanamount));
    },
    loanClosureAmount() {
      const totalClosureAmount = _.sumBy(this.loansArray, (key) => key.closingamount);
      const totalCashbackAmount = _.sumBy(this.loansArray, (key) => key.cashbackamount);
      return formatRupeeAmount(totalClosureAmount - totalCashbackAmount);
    },
    checkSchemeType() {
      return this.loansArray.some((even) => even.schemedata.type === 'monthly');
    },
    schemeName() {
      return _.get(this.loansArray[0], 'schemename');
    },
  },
  props: {
    loansArray: {
      type: Array,
    },
    lendersConfig: {
      type: Object,
    },
  },
  directives: {
    ClickOutside,
  },
  watch: {
    loansArray() {
      this.checkScheme();
      this.checkTakeover();
    },
  },
  methods: {
    moment: (date) => moment(date),
    // emit close loan details component method
    goBack() {
      this.$router.go(-1);
    },
    toggleShowHamburgerMenu(event) {
      event.stopPropagation();
      this.showHamburgerMenu = !this.showHamburgerMenu;
    },
    slideToView(element) {
      element.scrollIntoView();
    },
    getInRateSlab(interestRateSlabs, slabindex) {
      const slabsArray = [];
      _.forEach(interestRateSlabs, (irSlab, index) => {
        const interestRateSlab = `<span class="${slabindex === index ? 'active' : ''}">
          ${(irSlab.interestRate / 12).toFixed(2)}%</span>`;
        slabsArray.push(interestRateSlab);
      });
      return slabsArray.join(', ');
    },
    showHidePFBreakDown() {
      this.showHideProcessingFee = !this.showHideProcessingFee;
    },
    showHideExcessFundingMessage() {
      this.hasShowExcessFundingMessage = !this.hasShowExcessFundingMessage;
    },
    hideProcessingFeeTooltip() {
      if (this.showHideProcessingFee) {
        this.showHideProcessingFee = false;
      }
    },
    hideExcessFundingMessageTooltip() {
      if (this.hasShowExcessFundingMessage) {
        this.hasShowExcessFundingMessage = false;
      }
    },
    getProcessingFeeGST(charges) {
      let chargesObj = {};
      charges.map((charge) => {
        if ((charge.chargeType).toLowerCase() === 'processing-fee') {
          chargesObj = charge;
        }
        return true;
      });
      return chargesObj;
    },
    checkChargeType(charges) {
      let isChargeType = false;
      if (charges) {
        isChargeType = charges.map((charge) => (charge.chargeType).toLowerCase() === 'processing-fee');
      }
      return isChargeType;
    },
    checkTakeover() {
      const takeoverLoan = [];
      this.loansArray.forEach((loan) => {
        takeoverLoan.push(_.get(loan, 'takeover.istakeover'));
        if (_.get(loan, 'takeover.istakeover')) {
          this.takeoverMessage = _.get(loan, 'takeover.schemedescription');
        }
      });
      this.hasTakeoverLoan = takeoverLoan.includes(true);
    },
  },
  mounted() {
    this.checkTakeover();
  },
};
</script>
<style lang='scss'>
@import '@/scss/common/_mixins.scss';
.previous-IOR {
  color: #4B576F;
  text-decoration: line-through;
}
.chip__text__danger {
  color: #D0243C;
}
/** Menu show and hide animation */
@keyframes Scale {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70%{
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.d-grid {
  display: grid;
}
.loan-details__content {
  top: 220px;
  width: 100%;
  flex-direction: column;
  gap: 2rem;
  .card-title__loan-details {
    background-color: #F7BBA3;
    border-radius: 0.7rem 0.7rem 0 0;
    .loan-component__detail,
    .loan-component__title {
      padding: 1rem 0;
    }
    h5.loan-component__title {
      font-size: 0.88rem;
      font-weight: 600;
    }
  }
  .card-body__loan-details {
    padding: clamp(1rem, 3vw, 1.5rem) 1.25rem;
    gap: 1rem;
    & + .card-body__loan-details {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
    .loan-component__title {
      font-size: 0.88rem;
      color: #78819386;
      padding: 0;
    }
    .loan-component__detail {
      margin-left: 24px;
      padding: 0;
      font-size: 0.88rem;
      font-weight: 600;
      b {
        font-weight: 700;
      }
    }
  }
  .scheme-details-container {
    flex-direction: column;
    gap: 0.75rem;
    .scheme-details-card {
      font-size: clamp(0.9rem, 2vw, 1.2rem);
      .scheme-details-card__title {
        flex-direction: column;
        gap: 0.25rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        label {
          margin: 0;
          color: #788193a1;
          font-size: 0.75rem;
        }
        h3 {
          padding-top: 0.25rem;
          padding-bottom: 1rem;
          font-weight: 600;
          font-size: 1rem;
        }
      }
      .scheme-details-grid {
        margin-top: 0.88rem;
        grid-template-columns: 50% 50%;
        grid-gap: 1px;
        background-color: #ffffff;
        .scheme-details__grid-item {
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
          &:nth-child(1),
          &:nth-child(2) {
            padding-top: 0;
          }
          &:last-child,
          &:nth-last-child(2):nth-child(odd) {
            border-bottom: none;
          }
          &:nth-child(odd) {
            border-right: 1px solid rgba(0, 0, 0, 0.12);
          }
          .scheme-detail__text {
            label {
              font-size: clamp(0.75rem, 2vw, 0.88rem);
              margin-bottom: 0.25rem;
              color: #78819386;
              @media screen and (min-width: 769px) {
                font-weight: 400;
              }
            }
            h4 {
              font-size: 0.88rem;
              font-weight: 600;
            }
          }
          .scheme-detail__image {
            width: clamp(20px, 3vw, 2.5rem);
          }
        }
      }
    }
  }
}
.loan-details-wrapper {
  nav {
    .back-btn,
    .menu {
      padding: 0.25rem;
      :hover {
        border-radius: 100%;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.12);
      }
    }
  }
  header {
    position: relative;
    top: 0;
    width: 100%;
    max-height: 280px;
    gap: 1.25rem;
    background-color: #FDEEE8;
    &::before {
      content: "";
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      height: 50px;
      background-color: #FDEEE8;
    }
    .loan-details__header-wrapper {
      display: flex;
      flex-direction: column;
      gap: clamp(0rem, 2vw, 1rem);
      .loan-date-amount {
        .loan-detail {
          label {
            color: #788193;
            font-size: clamp(0.75rem, 2vw, 0.88rem);
          }
          h4 {
            color: $primary-color;
            font-size: clamp(0.88rem, 2vw, 1rem);
            font-weight: 600;
          }
        }
      }
      .tags {
        gap: 0.5rem;
        .tag {
          padding: 0.25rem;
          font-size: clamp(0.65rem, 2vw, 0.75rem);
          background: #FDD5C5;
        }
      }
      .lender-icons {
        img {
          width: 100%;
          height: 100%;
        }
      }
      .details {
        h3 {
          font-size: clamp(1rem, 2vw, 1.125rem);
          font-weight: 600;
        }
      }
    }
    .back-arrow {
      font-size: 0.812rem;
      color: $tertiary-color;
    }
  }
  .tabs {
    .nav-tabs {
      background: $white-color;
      border:none;
      .nav-item {
        width:50%;
        .nav-link {
          padding: 0.5rem 0;
          margin: 0 1rem;
          border:none;
          opacity: 0.5;
        }
        .active {
          border-bottom: 2px solid #fe9411;
          opacity: 1;
        }
      }
    }
  }
  h2 {
    font-size: 1.312rem;
  }
  .grey-background {
    .offer-table {
      width:100%;
      text-align:center;
      tr {
        th {
          font-size: 0.687rem;
          color: $tertiary-color;
        }
        th,td {
          padding: 10px;
          border-right: 1px solid #f2f2f2;
          .table-span1 {
            display: block;
            font-size: 0.75rem;
            color: $primary-color;
          }
          .table-span2 {
            font-size: 0.56rem;
            color: $primary-color;
          }
        }
      }
      .highlighted-scheme{
        background-color: rgba(254, 148, 17, 0.1);
        td {
          border:none;
        }
      }
    }
  }
  .rounded-3 {
    border-radius: 0.75rem;
  }
}
.to-message {
  padding: 16px;
  border-radius: 7px;
  font-size: 10px;
  background-color: #ffeed9;
  color: $secondary-color;
  margin: 0 1rem;
}
// tooltip
.custom-tooltip {
  display: none;
  position: absolute;
  bottom: -145px;
  z-index: 9;
  font-size: 13px;
  width: 224px;
  left: 0%;
  background-color: #000000;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  height: auto;
  min-height: 80px;
  margin: 0 5%;
  padding: 20px 18px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  line-height: 1;
  @media (max-width: 640px) {
    bottom: -145px;
    left: -50%;
  }
  &.excess-funding {
    width: 290px;
    bottom: -105px;
    @media (max-width: 640px) {
      bottom: -98px;
    }
  }
}
.arrow-down {
  position: relative;
  &::before{
    content: '';
    position: absolute;
    top:-22px;
    z-index: 9999;
    left: -15px;
    width: 40px;
    height: 20px;
    background-image: url('~@/assets/arrows/arrow-down.svg');
  }
}
.processing-fee {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    right: -1px;
    top: 15px;
    width: 0;
    z-index: 999;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 12px solid #000000;
  }
}
.renewal-notification {
  span {
    font-size: ($base-font-size-mobile - 4)+px;
    font-weight: $medium-bold-weight;
    color: $primary-color;
  }
}
.jewels-section {
  padding: 10px 16px;
  background-color: $white-color;
  h3 {
    font-size: 18px;
  }
}
.interest-rate-slab {
  font-weight: 600;
  color: #788193;
  span {
    &.active {
      color: #1E2D4B;
    }
  }
}
</style>
