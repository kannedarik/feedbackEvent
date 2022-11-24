<template>
  <div class="loan__group__card" v-if="groupLoans.length > 0">
    <div class="loan__group__header">
      <div class="flex items-center justify-between w-100">
        <div class="flex items-center justify-start">
          <div class="icon lender-logo" v-for="lender in lendersInfo" :key="lender">
            <img :src="lendersConfig[lender].iconLink" :alt="lender">
          </div>
          <div class="lender__name">
            {{ _.join(_.map(lendersInfo, (loan) => lendersConfig[loan].name), ' & ')}}
          </div>
        </div>
      </div>
      <div class="loan__details inter-font-family">
        <p>
          {{ moment(groupLoans[0].bookedDate).format("DD/MM/YYYY") }}
        </p>
        <p v-if="_.get(groupLoans[0], 'loans[0].schemedata.tenure')">
          {{
            _.get(groupLoans[0], 'loans[0].schemedata.tenure')
              ? `${groupLoans[0].loans[0].schemedata.tenure} Months` : "-"
          }}
        </p>
        <p v-if="_.get(groupLoans[0], 'loans[0].startingroi')">
          {{
            _.get(groupLoans[0], 'loans[0].startingroi')
              ? `${toMonthlyInterestRate(groupLoans[0].loans[0].startingroi)}% p.m
                (${groupLoans[0].loans[0].startingroi}% p.a.)` : "-"
          }}
        </p>
      </div>
      <div class="w-100">
        <div class="checkbox__container position-relative">
          <label class="container-checkbox">
            <input type="checkbox"
              :checked="areAllChecked"
              @click="enableAllLoanSelection || (checkSelectedLoanStatus && !areAllChecked)
                || hideLoanSelection || enableRenewal || !checkAllLoanActionEnable
                || monthlyInterestLoan || enableDisablePartRelease
                ? emitLoanSelectionMessage(
                    $event,
                    {
                      type: 'header',
                      hasRenewlDisable: enableRenewal,
                      hasActionEnable: !checkAllLoanActionEnable,
                      hasLoanDisable: enableAllLoanSelection,
                      hasMIPLoan: monthlyInterestLoan,
                      hasEnablePartRelease: enableDisablePartRelease,
                    }
                  )
                : onLoanSelectionAll($event)"
            />
            <span class="checkmark cursor-pointer"
              :class="{'disable' : enableAllLoanSelection
              || (checkSelectedLoanStatus && !areAllChecked)
              || hideLoanSelection || enableRenewal || !checkAllLoanActionEnable
              || monthlyInterestLoan || enableDisablePartRelease }">
            </span>
          </label>
          <span class="disable-message" :class="{'renewal-eligible': hasNotRenewalEligible}"
            v-if="(hideLoanSelection || hasNotRenewalEligible)
            && showErrorMessageType === 'header'">
            {{
              hasNotRenewalEligible
              ? renewalNotEligibleMessage
              : 'Loan selection is disabled till you clear your dues'
            }}
          </span>
        </div>
        <div class="loan__properties text-grey text__header inter-font-family">
          <p>
            Total Loan <br class="block md:hidden"/>Amount
          </p>
          <p>
            <span v-if="checkSchemeType && hasInterstOverDueMIP">
              Overdue <br class="block md:hidden"/>Amount
            </span>
            <span v-else-if="checkSchemeType">
              Effective Interest on Due Date
            </span>
            <span v-else>
              Total Interest <br class="block md:hidden"/>Amount
            </span>
          </p>
          <p class="pl-3">
            Total Closing <br class="block md:hidden"/>Amount
          </p>
        </div>
        <div class="loan__properties mt-1 text__header text-new inter-font-family">
          <p>
            {{formatRupeeAmount(totalLoanAmount)}}
          </p>
          <p>
            {{ formatRupeeAmount(totalInterestAmount) }}
          </p>
          <p class="pl-3">
            {{formatRupeeAmount(totalClosingAmount)}}
          </p>
        </div>
      </div>
    </div>
    <div class="loan__group__body">
      <div v-for="(item, index) in groupLoans" :key="index">
        <div class="loan-update-message w-100" v-if="showRcplMessage(item)">
          {{rcplRepledgeMessage}}
        </div>
        <div class="checkbox__container position-relative">
          <label class="container-checkbox">
            <input type="checkbox"
              :checked="item.isSelected"
              @click="item.isDisabled || (checkSelectedLoanStatus && !(item.isSelected))
                || hideLoanSelection || checkRenewlDisable(item)
                || !checkActionEnable(item) || checkMIPLoan(item) || enableDisablePartRelease
                ? emitLoanSelectionMessage(
                    $event,
                    {
                      type: `${index}-body`,
                      hasRenewlDisable: checkRenewlDisable(item),
                      hasActionEnable: !checkActionEnable(item),
                      hasLoanDisable: item.isDisabled,
                      hasMIPLoan: checkMIPLoan(item),
                      hasEnablePartRelease: enableDisablePartRelease,
                    }
                  )
                  : onLoanSelection($event, item, index)"
            />
            <span class="checkmark cursor-pointer"
              :class="{'disable': item.isDisabled
                || (checkSelectedLoanStatus && !(item.isSelected))
                || hideLoanSelection || checkRenewlDisable(item)
                || !checkActionEnable(item) || checkMIPLoan(item) || enableDisablePartRelease}">
            </span>
          </label>
          <span class="disable-message" :class="{'renewal-eligible': hasNotRenewalEligible}"
            v-if="(hideLoanSelection || hasNotRenewalEligible)
              && showErrorMessageType === `${index}-body`">
            {{
              hasNotRenewalEligible
              ? renewalNotEligibleMessage
              : 'Loan selection is disabled till you clear your dues'
            }}
          </span>
        </div>
        <div class="loan__properties inter-font-family">
          <p>
            {{formatRupeeAmount(getLoanAmount(item.loans))}}
          </p>
          <p>
            {{formatRupeeAmount(getLoanInterest(item.loans))}}
          </p>
          <p class="pl-3">
            {{formatRupeeAmount(getClosureAmount(item.loans))}}
          </p>
        </div>
        <div class="loan__properties align-items-center justify-between inter-font-family
        info-messages">
          <span>
             <span class="chip__text__danger"
              v-if="_.get(item, 'loans[0].auctionAction.message')">
              {{auctionMessage(_.get(item, 'loans[0].auctionAction.message'))}}
            </span>
            <span class="chip__text__danger"
              v-else-if="hideLoanSelection && recoveryMessage
              && _.get(item, 'loans[0].hardrecovery')
              && !_.get(item, 'loans[0].auctionAction.message')"
            >
              {{recoveryMessage}}
            </span>
            <span class="chip__text" :class="checkInterestDue(item.loans).textColor"
              v-else-if="checkInterestDue(item.loans).dueDateText
              && !_.get(item, 'loans[0].auctionAction.message')">
              <span
                v-if="checkInterestDue(item.loans).interestType === InterestType.INTEREST_OVERDUE">
                <TimerCountdown
                  :dueDate="checkInterestDue(item.loans).dueDateText"
                  :schemeType="item.loans[0].schemedata.type"
                  />
              </span>
              <span v-html="checkInterestDue(item.loans).dueDateText" v-else></span>
            </span>
          </span>
          <span class="cursor-pointer icon-size" @click="$emit('showloandetail', item.loans)">
            <img src="@/assets/arrows/right-arrow-grey.svg" alt="arrow-next"
              class="float-right"/>
          </span>
        </div>
        <div class="text-small chip__text__danger flex items-start"
          v-if="takeoverLoanMessage(item.loans)">
          <img src="@/assets/takeover_msg_icon.svg"
            alt="warning" class="mr-1"/>
          {{takeoverLoanMessage(item.loans)}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import _ from 'lodash';
import { formatRupeeAmount, toMonthlyInterestRate } from '@/utils/string';
import { checkInterestDue, InterestType } from '@/utils/interestDue';
import TimerCountdown from './TimerCountdown.vue';

export default {
  name: 'LoanGroupCard',
  data() {
    return {
      timeout: 5000,
      timerId: null,
      showErrorMessageType: '',
      selectedLoans: [],
      hasNotRenewalEligible: false,
      renewalNotEligibleMessage: '',
    };
  },
  components: {
    TimerCountdown,
  },
  props: {
    groupLoans: [],
    recoveryMessage: String,
    selectedLoansFromGroup: [],
    rcplRepledgeMessage: String,
    hideLoanSelection: Boolean,
    lendersConfig: null,
    paymentOption: null,
    staticMessage: Object,
    repledgeMessage: String,
  },
  computed: {
    _() {
      return _;
    },
    InterestType() {
      return InterestType;
    },
    totalLoanAmount() {
      return this.groupLoans.reduce((amount, item) => amount + this.getLoanAmount(item.loans), 0);
    },
    totalInterestAmount() {
      return this.groupLoans.reduce((amount, item) => amount + this.getLoanInterest(item.loans), 0);
    },
    totalClosingAmount() {
      // eslint-disable-next-line max-len
      return this.groupLoans.reduce((amount, item) => amount + this.getClosureAmount(item.loans), 0);
    },
    areAllChecked() {
      return this.groupLoans.every((loan) => loan.isSelected);
    },
    enableAllLoanSelection() {
      return this.groupLoans.every((loan) => (!!loan.isDisabled));
    },
    enableRenewal() {
      return this.groupLoans.every((loan) => (!!this.checkRenewlDisable(loan)));
    },
    checkAllLoanActionEnable() {
      return this.groupLoans.every((loan) => (!!this.checkActionEnable(loan)));
    },
    monthlyInterestLoan() {
      return this.groupLoans.every((loan) => (!!this.checkMIPLoan(loan)));
    },
    checkSchemeType() {
      let hasMIPLoan = false;
      this.groupLoans.forEach((loansData) => {
        hasMIPLoan = loansData.loans.some((even) => _.get(even, 'schemedata.type') === 'monthly');
      });
      return hasMIPLoan;
    },
    hasInterstOverDueMIP() {
      const hasMIPLoan = [];
      this.groupLoans.forEach((loansData) => {
        loansData.loans.forEach((even) => {
          hasMIPLoan.push(_.get(even, 'stage'));
        });
      });
      return hasMIPLoan.every((type) => type === 'interestoverduemip');
    },
    checkSelectedLoanStatus() {
      let hasDisableloans = false;
      if (this.selectedLoans.length === 1
        && (this.paymentOption === 'rePledge' || this.paymentOption === 'partPayment')) {
        hasDisableloans = true;
      } else {
        hasDisableloans = false;
      }
      return hasDisableloans;
    },
    enableDisablePartRelease() {
      let branchIds = [];
      this.selectedLoans.forEach((loanGroup) => {
        loanGroup.loans.forEach((loan) => {
          if (loan.netweight > 0) branchIds.push(loan.branch.id);
        });
      });
      this.groupLoans.forEach((loanGroup) => {
        loanGroup.loans.forEach((loan) => {
          if (loan.netweight > 0) branchIds.push(loan.branch.id);
        });
      });
      branchIds = [...new Set(branchIds)];
      return branchIds.length !== 1 && this.paymentOption === 'partialRelease';
    },
    lendersInfo() {
      const lenders = [];
      this.groupLoans.forEach((mainLoans) => {
        mainLoans.loans.forEach((loan) => _.map(loan.lenders, (lender) => lenders.push(lender)));
      });
      return [...new Set(lenders)];
    },
  },
  watch: {
    selectedLoansFromGroup: {
      immediate: true,
      handler(data) {
        this.selectedLoans = [...data];
      },
    },
  },
  methods: {
    toMonthlyInterestRate,
    formatRupeeAmount,
    checkInterestDue,
    moment: (date) => moment(date),
    checkDisabledStatus(loans) {
      return loans.some((loanComponent) => _.get(loanComponent, 'auctionAction.enable') === false);
    },
    takeoverLoanMessage(loans) {
      let takeoverLoanMessage = '';
      if (loans.length === 1) {
        loans.map((key) => {
          if (!key.netweight) {
            takeoverLoanMessage = (key.takeover && key.takeover.takeovermessage && key.takeover.istakeover) ? key.takeover.takeovermessage : '';
          }
          return true;
        });
      }
      return takeoverLoanMessage;
    },
    showRcplMessage(data) {
      let showmessage = false;
      data.loans.map((key) => {
        if (!key.netweight && key.showmessage) {
          showmessage = true;
        }
        return true;
      });
      return showmessage;
    },
    getClosureAmount(loan) {
      let totalClosingAmount = 0;
      loan.map((key) => {
        if (key.schemedata && key.schemedata.cashback) {
          totalClosingAmount += key.closingamount - key.cashbackamount;
        } else {
          totalClosingAmount += key.closingamount;
        }
        return true;
      });
      return totalClosingAmount;
    },
    getLoanInterest(loan) {
      let totatLoanInterest = 0;
      loan.forEach((key) => {
        if (key.schemedata && key.schemedata.cashback) {
          totatLoanInterest += key.interest - key.cashbackamount;
        } else {
          totatLoanInterest += key.interest;
        }
      });
      return totatLoanInterest;
    },
    getLoanAmount(loan) {
      let totalLoanAmount = 0;
      loan.map((key) => {
        totalLoanAmount += key.loanamount;
        return true;
      });
      return totalLoanAmount;
    },
    removeLoanGroupEntriesFromLoanSelection() {
      this.groupLoans.forEach((loan) => {
        this.filterSelectedLoans(loan);
      });
    },
    filterSelectedLoans(loan) {
      // eslint-disable-next-line max-len
      this.selectedLoans = this.selectedLoans.filter((selectedLoan) => selectedLoan.loans[0].uloanId !== loan.loans[0].uloanId);
    },
    onLoanSelectionAll(event) {
      const areallchecked = event.target.checked;
      this.removeLoanGroupEntriesFromLoanSelection();
      if (areallchecked) {
        this.selectedLoans = [...this.selectedLoans, ...this.groupLoans];
      }
      this.$emit('loanselection', { selectedLoans: this.selectedLoans, group: true, areAllChecked: areallchecked });
    },
    onLoanSelection(event, loan, index) {
      const ischecked = event.target.checked;
      if (!ischecked) {
        this.filterSelectedLoans(loan);
      } else {
        this.selectedLoans.push(loan);
      }
      this.$emit('loanselection', { selectedLoans: this.selectedLoans, index });
    },
    emitLoanSelectionMessage(event, data) {
      if (data.hasRenewlDisable || this.hideLoanSelection) {
        this.hasNotRenewalEligible = data.hasRenewlDisable;
        this.showErrorMessageType = this.showErrorMessageType === data.type ? '' : data.type;
      } else if (!data.hasActionEnable) {
        if (!data.hasMIPLoan) {
          this.$noty.show(!data.hasLoanDisable
            ? 'Please select loans belonging to the same grouping'
            : 'Loans from different banks cannot be selected at same time');
        } else {
          this.$noty.show(data.hasEnablePartRelease
            ? 'Please select loans from same branches for part release'
            : 'Renewal and partial-release options are not available for this loan');
        }
      }
      event.preventDefault();
    },
    auctionMessage(type) {
      return _.get(this.staticMessage[`${type}`], 'content.message');
    },
    checkRenewlDisable(item) {
      let hasRenewalEligible = false;
      item.loans.forEach((loan) => {
        if (loan.netweight) {
          this.renewalNotEligibleMessage = loan.renewalNotEligibleMessage;
          hasRenewalEligible = !loan.renewalEligible && this.paymentOption === 'rePledge';
        }
      });
      return hasRenewalEligible;
    },
    checkActionEnable(item) {
      let hasActionEnable = true;
      item.loans.forEach((loan) => {
        if (loan.netweight) {
          hasActionEnable = _.get(loan, 'auctionAction.enable', true);
        }
      });
      return hasActionEnable;
    },
    checkMIPLoan(item) {
      let monthlyInterest = [];
      item.loans.forEach((loan) => {
        if (loan.netweight) {
          monthlyInterest.push(_.get(loan, 'schemedata.type', ''));
        }
      });
      monthlyInterest = [...new Set(monthlyInterest)];
      return monthlyInterest.includes('monthly')
        && (this.paymentOption === 'rePledge' || this.paymentOption === 'partialRelease');
    },
  },
};
</script>

<style lang="scss">
    .loan__group__card {
        width: 100%;
        border: 1px solid rgba(0,0,0,0.16);
        border-radius: 16px;
        /* box-shadow: 0 3px 3px rgba(0,0,0,0.16), 0 3px 3px rgba(0,0,0,0.23); */
        background: #FFFFFF;
    }

    .loan__group__header {
        width: 100%;
        padding: 1rem;
        background: #FDEBE4;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        @media screen and (min-width: 700px) {
          padding: 1.5rem;
        }
        > div:last-child {
          margin-top: clamp(1rem, 3vw, 1.5rem);
        }
    }

    .icon {
        width: 32px;
        background-repeat: no-repeat;
        background-size: contain;
        height: 32px;
        &.lender-logo {
          img {
            width: 100%;
            height: 100%;
          }
        }
    }

    .loan__details {
        width: 100%;
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 1rem;
        font-size: 10px;
    }

    .text-grey {
        color: #969696;
    }

    .loan__group__body {
        padding: 0 1rem;
        @media screen and (min-width: 700px) {
          padding: 0 1.5rem;
        }
        padding-top: 0;
        > div {
          padding: 1rem 0;
          &:not(:last-child) {
            border-bottom: 1px solid #eee;
          }
        }
    }

    .checkbox__container {
        width : 25px;
    }

    .loan__details > p {
        border-radius: 4px;
        padding: 4px;
        background-color: #fdd5c6;
        font-size: clamp(0.65rem, 2vw, 0.75rem);
        color: #1E2D4B;
    }

    .loan__properties {
        margin-left: 35px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        font-size: clamp(0.88rem, 2vw, 1rem);
        p {
          width: 33.33%;
        }
        &:last-child {
          margin-top: 10px;
          @media screen and (max-width: 700px) {
            margin-top: 13px;
          }
        }
        &.info-messages span{
          font-size: 0.75rem;
        }
        &.text-new {
          color: #1E2D4B;
        }
    }

    > p {
        font-weight: 600;
        flex:1;
    }

    .loan__separator {
        /* margin : 16px auto; */
        width: 100%;
        height: 1px;
        border: 1px solid #F5F5F5;
    }

     .text__header {
        font-size: clamp(0.75rem, 2vw, 0.88rem);
    }

    .lender__name {
      font-weight: 600;
      font-size: 1.125rem;
    }

    .text-small {
        font-size: 10px;
    }

    @media screen and (min-width: 480px) {
        .text-small {
            font-size: 16px;
        }
    }

    .chip__text {
      color:#788193;
    }

    .chip__text__danger {
        color: #D0243C;
    }
    .disable-message {
      position: absolute;
      background-color: #000;
      color: #fff;
      border-radius: 8px;
      padding: 12px;
      left: -12px;
      z-index: 9;
      font-size: 12px;
      width: 300px;
      top: 34px;
      height: auto;
      &.renewal-eligible {
        width: 500px;
        @media screen and (max-width: 600px) {
          width: 350px;
        }
      }
      &::after {
        content: "";
        position: absolute;
        top: -13px;
        left: 13px;
        width: 0;
        z-index: 999;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 16px solid #000000;
      }
    }
    .icon-size {
      width: 24px;
    }
</style>
