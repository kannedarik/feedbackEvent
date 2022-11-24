<template>
  <div>
    <div v-if="!_.get(closeInfoDetails, 'hasInfo', false)">
      <transition name="payment-options-wrapper">
        <section class="block payment-options-wrapper bg-white" v-if="visible">
          <div class="header block position-relative">
            <h3 class="bold-font px-3 pt-3">
              {{selectedLoansList.length ? 'Choose an Action' : 'Select Payment Action'}}
            </h3>
            <div class="new-close-icon cursor-pointer"
              @click="$emit('hide-payments-options')">
            </div>
            <div class="loan-selection__actions d-flex flex-column sm:mx-4 md:mx-10 my-4">
              <PaymentOptionsRadio
                v-for="paymentOption in paymentOptions"
                :key="paymentOption.id"
                :id="paymentOption.id"
                :value="paymentOption.value"
                :disabled="paymentOption.disabled"
                :selectedValue="paymentOption.selectedValue"
                :amount="paymentOption.amount"
                :closingAmount="paymentOption.closingAmount"
                :disableInfoWrapperVisibility="disableInfoWrapperVisibility"
                :showTopupLabel="showTopupLabel(paymentOption.type)"
                @click="paymentOption.onClick"
                @change="(value) => $emit('change', value)"
              />
              <h4 v-if="!paymentOptions.length" class="font-secondary text-sm">
                No payment option not available for selected loans
              </h4>
            </div>
          </div>
          <div class="header block" v-if="!visible">
            <div class="federal-bank-message block">
              <p class="m-0 text-center">
                  <span class="block text-center margin-bottom-10px">
                  <img src="@/assets/icons/new_icon.svg" alt="new_icon" />
                  </span>
                  {{ federalBankCallUsBack && federalBankCallUsBack.msg }}
              </p>
            </div>
          </div>
          <div class="block text-right py-2 sm:px-4 md:px-10">
            <transition
              enter-active-class="animated slideInUp"
              leave-active-class="animated slideOutDown">
              <div class="msg-info text-left bottom-0" v-if="repledgeInfo">
                <p class="info-text p-4" v-if="disabledPaymentOptionType === 'repledgeInfo'">
                  {{ repledgeMessage }}
                </p>
                <p class="info-text p-4" v-if="disabledPaymentOptionType === 'closure'">
                  {{closureDiscrepancyMessage}}
                </p>
                <p class="info-text p-4" v-if="disabledPaymentOptionType === 'partPayment'">
                  <span v-if="disablePartPayment">
                    {{ partPaymentsMessage }}
                  </span>
                  <span v-else>
                    {{ _.get(discrepancyMessage, 'part_payment.msg.SLAB2.app', '') }}
                  </span>
                </p>
                <p class="info-text p-4" v-if="disabledPaymentOptionType === 'partialRelease'">
                  {{ partReleaseMessage }}
                </p>
                <p class="info-text p-4" v-if="disabledPaymentOptionType === 'interest'">
                  Interest amount is already paid.
                </p>
              </div>
            </transition>
            <button class="btn btn-primary-rupeek w-full md:w-1/2 mx-auto"
              :class="{'disabled-btn': !paymentOption}"
              @click="showPaymentSummaryComponent">
              Continue To Pay
            </button>
          </div>
        </section>
      </transition>
    </div>
    <DiscrepancyInClosureFlow v-else
      :closeInfoDetails="closeInfoDetails"
      @hidePaymentOptions="$emit('hide-payments-options')"
      @moveToCloseLoan="$emit('moveToCloseLoan')"
    />
    <div
      class="payment-options-wrapper-back-drop"
      v-if="visible"
      @click="$emit('hide-payments-options')"
    ></div>
  </div>
</template>

<script>
import _ from 'lodash';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent, mapCleverTapProperty } from '@/utils/clevertap/EventTracker';
import PaymentOptionsRadio from './PaymentOptionsRadio.vue';
import DiscrepancyInClosureFlow from './discrepancyInClosureFlow.vue';

export default {
  props: {
    visible: Boolean,
    selectedLoansList: Array,
    lenderConfigs: Array,
    populateAmounts: Object,
    isDisablingRenewalCovid: Boolean,
    paymentOption: String,
    disableRepledge: Boolean,
    isEligibleForRenewal: Boolean,
    showPaymentSummaryComponent: Function,
    checkDiscrepancyClosure: Boolean,
    partReleaseFeatureFlag: Object,
    hideDisablePartReleaseInfo: Boolean,
    disablePartRelease: Boolean,
    discrepancyMessage: Object,
    checkDiscrepancyPartPayment: Boolean,
    disablePartPayment: Boolean,
    repledgeMessage: String,
    partReleaseMessage: String,
    partPaymentsMessage: String,
    closeInfoDetails: Object,
    closureDiscrepancyMessage: String,
  },
  components: {
    PaymentOptionsRadio,
    DiscrepancyInClosureFlow,
  },
  data() {
    return {
      disableInfoWrapperVisibility: '',
      disabledPaymentOptionType: '',
      repledgeInfo: false,
      timeout: 5000,
      timerId: null,
    };
  },
  watch: {
    repledgeInfo(value) {
      if (value) {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
          this.repledgeInfo = false;
        }, this.timeout);
      }
    },
  },
  methods: {
    showTopupLabel(currType) {
      return currType === 'repledge' && !!this.lenderConfigs.find(
        (config) => config.type === 'repledge' && config.display && config.showTopupLabel,
      );
    },
    // function to hide the payment options component
    hidePaymentOptionsComponent() {
      this.repledgeInfo = false;
      this.disabledPaymentOptionType = '';
    },
    viewDisableMessage(type) {
      this.disabledPaymentOptionType = this.disabledPaymentOptionType !== type ? type : '';
      this.repledgeInfo = this.disabledPaymentOptionType !== '';
      if (this.repledgeInfo) {
        let coreIds = [];
        let lenders = [];
        this.selectedLoansList.map((selectedLoan) => {
          selectedLoan.loans.map((loanComponent) => {
            lenders.push(loanComponent.lenderName);
            coreIds.push(loanComponent.coreid);
            return true;
          });
          return true;
        });
        lenders = ([...new Set(lenders)]).join(' & ');
        coreIds = coreIds.join(',');
        const eventProperty = mapCleverTapProperty(this.paymentOption, this.populateAmounts);
        const eventProperties = {
          [events.EVENT_NAME]: events.PAYMENT_REPAYMENT_OPTION_DISABLED_CASE_I_ICON_CLICKED,
          [events.PAYMENT_ACTION]: eventProperty.action,
          [events.PAYMENT_CORE_ID]: coreIds,
          [events.PAYMENT_LENDER_ID]: lenders,
        };
        sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, eventProperties);
      }
    },
  },
  computed: {
    _() {
      return _;
    },
    paymentOptions() {
      let options = this.lenderConfigs;
      options.map((option) => {
        const optionData = option;
        optionData.selectedValue = this.paymentOption;
        optionData.id = optionData.type;
        if (optionData.type === 'interest') {
          const hasDisable = (!this.populateAmounts.totalInterestAmount
            || this.populateAmounts.totalInterestAmount < 0);
          optionData.value = 'Pay Interest';
          optionData.id = 'interest';
          optionData.amount = this.populateAmounts.totalInterestAmount;
          optionData.disabled = hasDisable;
          optionData.onClick = hasDisable ? this.viewDisableMessage.bind(this, 'interest')
            : () => {};
        } else if (optionData.type === 'close_loan') {
          const hasDisable = (this.checkDiscrepancyClosure
            || !this.populateAmounts.totalClosingAmount
            || this.populateAmounts.totalClosingAmount < 0);
          optionData.value = 'Close Loan';
          optionData.id = 'closeLoan';
          optionData.amount = this.populateAmounts.totalClosingAmount;
          optionData.disabled = hasDisable;
          optionData.onClick = this.checkDiscrepancyClosure
            ? this.viewDisableMessage.bind(this, 'closure') : () => {};
        } else if (optionData.type === 'repledge') {
          const hasDisable = (this.disableRepledge
          || !this.isDisablingRenewalCovid
          || !this.isEligibleForRenewal);
          optionData.value = 'Renew Loan';
          optionData.id = 'rePledge';
          optionData.disabled = hasDisable;
          optionData.onClick = hasDisable ? this.viewDisableMessage.bind(this, 'repledgeInfo')
            : () => {};
        } else if (optionData.type === 'part-release') {
          const hasDisable = (this.disablePartRelease && !this.hideDisablePartReleaseInfo);
          optionData.value = 'Part Release';
          optionData.id = 'partialRelease';
          optionData.disabled = hasDisable;
          optionData.onClick = hasDisable
            ? this.viewDisableMessage.bind(this, 'partialRelease') : () => {};
        } else if (optionData.type === 'part_payment') {
          const hasDisable = (this.disablePartPayment
            || (this.checkDiscrepancyPartPayment && this.discrepancyMessage
            && this.discrepancyMessage.part_payment.blockPayment));
          optionData.value = 'Part Payment';
          optionData.id = 'partPayment';
          optionData.amount = this.populateAmounts.totalInterestAmount >= 100
            ? this.populateAmounts.totalInterestAmount : 100;
          optionData.closingAmount = this.populateAmounts.partPaymentClosingAmount;
          optionData.disabled = hasDisable;
          optionData.onClick = hasDisable
            ? this.viewDisableMessage.bind(this, 'partPayment') : () => {};
        }
        return optionData;
      });
      options.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
      options = options.filter((option) => option.display);
      return options;
    },
  },
};
</script>

<style lang="scss">
  .payment-options-wrapper {
    max-width: 855px;
  }
  .loan-selection__actions {
    gap: 0.75rem;
  }
  .bottom-0 {
    bottom: 0 !important;
  }
  .new-close-icon {
    position: absolute;
    opacity: 1;
    top: -50px;
    right: 10px;
    height: 40px;
    width: 40px;
    background-image: url("../../assets/icons/new_closing_icon.svg");
  }
</style>
