<template>
  <div>
  <div class="payments" :class="{'h-screen' : paymentMethod === 'neft'}">
    <Container :screenType="'body-bg'">
      <div class="header p-6 mt-2">
        <div class="md:flex md:items-center">
          <div>
            <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="backToPreviousScreen()"/>
          </div>
          <div class="sm:mt-3 md:mt-0 md:ml-3">
            <h3 class="font-semibold">
              Choose Payment Option
            </h3>
          </div>
        </div>
      </div>
      <div class="my-4">
        <div class="flex flex-col">
          <div class="payment-options flex items-center justify-between
            w-11/12 md:w-8/12 mx-auto sm:mb-5 md:mb-6 transition duration-500"
            v-for="option in paymentMethods" :key="option.value"
            :class="{active : paymentMethod === option.value}">
            <div class="payment-options-radio-button-wrapper flex items-center w-full">
              <div class="radio-button-wrapper">
                <input type="radio" class="form-check-input"
                  :value="option.value"
                  v-model='paymentMethod'
                  :id='option.value' name="paymentMethods"
                  @change='trackPaymentMethodSelection(option.value)'>
                <div class="radio-button"></div>
              </div>
              <label class="form-check-label py-6 md:py-8 pl-6 pr-0" :for="option.value">
                {{option.paymentOption}}
              </label>
            </div>
          </div>
        </div>
        <div class="van-number-wrapper block flex"
          v-if='paymentMethod === "neft" && virtualAccountNumbers'>
          <div class="flex-1" v-for='van in virtualAccountNumbers'
            :key='van.loanid'>
            <VanCard :van='van' />
          </div>
        </div>
      </div>
    </Container>
  </div>
  <transition enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
    <div class="new-footer" v-if="paymentMethod !== 'neft'">
      <Container>
        <div class="bg-white py-2 px-4 md:p-7 flex justify-between">
          <div class="payment-info flex items-center">
            <span>Pay:</span>
            <h4 class="ml-2">
              <span class="currency">
                {{toRupeeAmount(+payableAmount).currency}}
              </span>
              {{toRupeeAmount(+payableAmount).amount}}
            </h4>
          </div>
          <button class="float-right btn-primary-rupeek w-1/2 md:w-1/4 rounded-full"
            :disabled="!paymentMethod"
            @click="payNow">
            Pay
          </button>
        </div>
      </Container>
    </div>
  </transition>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import VanCard from '@/components/VanCard/VanCard.vue';
import { getPaymentLink, getPartReleasePaymentsLinkForOrderId } from '@/api/paymentGateways.api';
import PaymentType from '@/mixins/PaymentType';
import { toRupeeAmount } from '@/utils/string';
import { sendEvent, mapCleverTapProperty } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'paymentMethod',
  components: {
    Container,
    VanCard,
  },
  data() {
    return {
      paymentMethod: null,
      payableAmount: null,
      paymentMethods: [],
      totalPaymentMethods: [
        {
          paymentOption: 'e-NACH Single Click Pay',
          value: 'enach',
        },
        {
          paymentOption: 'Net banking / Debit Card / UPI',
          value: 'netBanking',
        },
        {
          paymentOption: 'RTGS / NEFT / IMPS',
          value: 'neft',
        },
      ],
      virtualAccountNumbers: [],
    };
  },
  mixins: [PaymentType],
  computed: {
    ...mapGetters({
      populateAmounts: 'loans/populateAmounts',
      selectedLoans: 'loans/selectedLoans',
      paymentOption: 'loans/paymentOption',
      paymentVirtualAccount: 'loans/paymentMethodsVirtualAccount',
      partReleaseOrderId: 'jewels/orderId',
      partPaymentAmount: 'loans/partPaymentAmount',
      hasTakeover: 'loans/hasTakeover',
      renewalFlow: 'renewal/renewalFlow',
    }),
  },
  watch: {
    paymentVirtualAccount() {
      this.updateData();
    },
    payableAmount(value) {
      if (!value) {
        this.getPayableAmount();
      }
    },
    renewalFlow(value) {
      if (value.hasRenewalFlow) {
        this.checkRenewalFlow();
      }
    },
  },
  methods: {
    toRupeeAmount,
    // eslint-disable-next-line
    payNow() {
      if (this.renewalFlow.hasRenewalFlow) {
        this.$emit('makePayment');
      } else if (this.paymentOption === 'partialRelease') {
        this.getPartReleasePaymentsLink();
      } else if (this.paymentMethod === 'enach') {
        this.getPaymentsLink(true);
      } else if (this.paymentMethod === 'netBanking') {
        this.getPaymentsLink(false);
      } else {
        this.$noty.error('Please select a payment method');
        return false;
      }

      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_METHODS_PAY_CLICKED,
      };
      sendEvent(events.screen.PAYMENT_METHODS, events.category.PAYMENT, properties);
    },
    // function to generate the payment link based on orderID.
    getPartReleasePaymentsLink() {
      getPartReleasePaymentsLinkForOrderId(this.partReleaseOrderId)
        .then((response) => {
          if (response.status === 200) {
            const rpkId = response.data.data.link;
            if (response.data.data.link) {
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
    getPaymentsLink(enachFlag) {
      const requestObj = {};
      const paymentData = {};
      const returnLenderArray = [];
      let kglLoan = false;
      const lendersArray = this.selectedLoans.map((key) => {
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
      // eslint-disable-next-line
      switch (this.paymentOption) {
        case 'interest':
          requestObj.paymentamount = Math.ceil(
            this.populateAmounts.interestAmount + this.populateAmounts.rebateAmount,
          );
          paymentData.type = 'interest';
          paymentData.loans = this.getLoansArray();
          requestObj.paymentdata = paymentData;
          break;
        case 'closeLoan':
          requestObj.paymentamount = Math.ceil(
            this.populateAmounts.closingAmount + this.populateAmounts.rebateAmount,
          );
          paymentData.type = 'closing';
          paymentData.loans = this.getLoansArray();
          requestObj.paymentdata = paymentData;
          break;
        case 'rePledge':
          requestObj.paymentamount = Math.ceil(this.populateAmounts.repledgeAmount);
          paymentData.type = 'repledge';
          paymentData.loans = this.getLoansArray();
          requestObj.paymentdata = paymentData;
          if (kglLoan) {
            requestObj.paymentdata.verificationtype = this.repledgeType;
          }
          break;
        case 'partPayment':
          requestObj.paymentamount = Math.ceil(+this.payableAmount);
          paymentData.type = 'partial';
          paymentData.loans = this.getLoansArray();
          requestObj.paymentdata = paymentData;
          break;
        case 'hardrecovery':
          if (this.hasTakeover) {
            requestObj.paymentamount = Math.ceil(
              this.populateAmounts.closingAmount + this.populateAmounts.rebateAmount,
            );
            paymentData.type = 'closing';
            paymentData.loans = this.getLoansArray();
            requestObj.paymentdata = paymentData;
          } else {
            requestObj.paymentamount = Math.ceil(+this.populateAmounts.hardrecovery);
            paymentData.type = 'hardrecovery';
            paymentData.loans = this.getLoansArray();
            requestObj.paymentdata = paymentData;
          }
          break;
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
      this.selectedLoans.map((key) => {
        let prevLoan = {};
        key.loans.map((loan, index) => {
          const returnLoansArray = {};
          returnLoansArray.lender = loan.lenderid;
          returnLoansArray.loanid = loan.loanid;
          if (loan.active) {
            // eslint-disable-next-line
            switch (this.paymentOption) {
              case 'interest':
                returnLoansArray.paidamount = loan.interest;
                loansArray.push(returnLoansArray);
                break;
              case 'closeLoan':
                if (!loan.loanHasDiscrepancy) {
                  returnLoansArray.paidamount = loan.closingamount;
                  loansArray.push(returnLoansArray);
                }
                break;
              case 'rePledge':
                if (loan.lenderid === 'federal') {
                  if (loan.replegeAmtUpdated) {
                    returnLoansArray.paidamount = loan.moreRepledge.repledgeamount
                      ? loan.moreRepledge.repledgeamount : 0;
                    returnLoansArray.repledgetype = loan.moreRepledge.currentDayPrincipleAmount
                      ? loan.moreRepledge.keyword : '';
                  } else {
                    returnLoansArray.paidamount = loan.defaultRepledge.repledgeamount
                      ? loan.defaultRepledge.repledgeamount : 0;
                    returnLoansArray.repledgetype = loan.defaultRepledge.currentDayPrincipleAmount
                      ? loan.defaultRepledge.keyword : '';
                  }
                } else {
                  returnLoansArray.paidamount = loan.repledgeamount ? loan.repledgeamount : 0;
                }
                loansArray.push(returnLoansArray);
                break;
              case 'partPayment':
                returnLoansArray.paidamount = loan.partPaymentAmount || loan.partPaymentCashback
                  ? loan.partPaymentAmount - (loan.partPaymentCashback
                    && (prevLoan.active || index === 0)
                    ? loan.partPaymentCashback : 0) : 0;
                loansArray.push(returnLoansArray);
                break;
              case 'hardrecovery':
                if (this.hasTakeover) {
                  returnLoansArray.paidamount = loan.closingamount;
                } else {
                  returnLoansArray.paidamount = loan.hardrecovery;
                }
                loansArray.push(returnLoansArray);
                break;
            }
          }
          prevLoan = loan;
          return true;
        });
        return true;
      });
      return loansArray;
    },
    trackPaymentMethodSelection(paymentType) {
      let optionSelected = '';
      if (paymentType === 'netBanking') {
        optionSelected = events.PAYMENT_OPTIONS_1_SELECTED;
      } else if (paymentType === 'neft') {
        optionSelected = events.PAYMENT_OPTIONS_2_SELECTED;
      }
      const properties = {
        [events.EVENT_NAME]: optionSelected,
        [events.PAYMENT_ACTION]: mapCleverTapProperty(this.paymentOption).action,
      };
      sendEvent(events.screen.PAYMENT_METHODS, events.category.PAYMENT, properties);
    },
    backToPreviousScreen() {
      this.paymentMethod = null;
      this.$router.go(-1);
    },
    updateData() {
      this.virtualAccountNumbers = _.get(this.paymentVirtualAccount, 'virtualAccount', []);
      const supportedPaymentMethods = _.get(this.paymentVirtualAccount, 'paymentsMethods', []);
      const payAmount = _.get(this.paymentVirtualAccount, 'payableAmount', 0);
      this.payableAmount = payAmount !== 0 ? payAmount : this.payableAmount;
      this.payableAmount = this.payableAmount > 0 ? this.payableAmount : 0;
      this.paymentMethods = this.totalPaymentMethods.filter((option) => {
        const data = supportedPaymentMethods.includes((option.value).toLowerCase());
        return data;
      });
      if (!this.payableAmount) {
        this.getPayableAmount();
      }
    },
    getPayableAmount() {
      // eslint-disable-next-line
      switch (this.paymentOption) {
        case 'interest':
          this.payableAmount = this.populateAmounts.interestAmount;
          break;
        case 'closeLoan':
          this.payableAmount = this.populateAmounts.closingAmount;
          break;
        case 'rePledge':
          this.payableAmount = this.populateAmounts.repledgeAmount;
          break;
        case 'hardrecovery':
          this.payableAmount = this.hasTakeover
            ? this.populateAmounts.toClosureAmount : this.populateAmounts.hardrecovery;
          break;
        case 'partPayment':
          this.payableAmount = this.partPaymentAmount;
          break;
      }
    },
    checkRenewalFlow() {
      const payAmount = _.get(this.renewalFlow, 'payableAmount', 0);
      this.payableAmount = payAmount > 0 ? payAmount : 0;
      this.virtualAccountNumbers = _.get(this.renewalFlow, 'virtualAccount', []);
      this.paymentMethods = this.totalPaymentMethods.filter((option) => {
        const data = this.renewalFlow.methods.includes((option.value).toLowerCase());
        return data;
      });
    },
  },
  activated() {
    if (!_.get(this.$route, 'params.id')) {
      this.checkPaymentOption();
      this.updateData();
    }
  },
};
</script>
<style lang='scss'>
@import '@/scss/payment-options/payment-options.scss';
.new-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
.payments {
  height: 92%;
  overflow: hidden;
  overflow-y: scroll;
  &.h-screen {
    height: 100%;
  }
}
.header {
  background: #FFFFFF;
  border: 1px solid #ECEDEF;
  h3 {
    font-size: 18px;
    font-weight: 700;
  }
  span {
    font-size: 14px;
    color: #727272;
    font-weight: 600;
  }
}
.payment-info {
  span {
    font-size: 12px;
    color: #727272;
  }
  h4 {
    font-size: 18px;
    font-weight: 700;
    .currency {
      font-size: 16px;
      color: #484848;
      opacity: 0.7;
    }
  }
}
</style>
