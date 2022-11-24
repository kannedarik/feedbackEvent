<template>
  <b-modal
    scrollable
    centered
    visible
    static
    content-class="loan-amount-selection-modal"
    header-class="loan-amount-selection-modal-header"
    footer-class="loan-amount-selection-modal-footer"
    @hidden="closeModal"
  >
    <template #modal-header>
      <div class="d-flex flex-column header-flex-container">
        <div class="d-flex flex-column header-title">
          <h5 class="popup-heading font-weight-bold text-left">
            Choose New Loan Amount for Renewal
          </h5>
          <p
            class="font-weight-normal text-left"
            v-if="isCurrentLoanEligibleForLE"
          >
            You are eligible for a higher loan amount based on today's Gold
            rate.
          </p>
        </div>

        <div class="d-flex align-items-center header-subtitle">
          <ProgressRing
            v-if="!viewingSummaryScreen"
            :outerCircleRadius="24"
            :strokeWidth="5"
            :value="loanNumber"
            :max="selectedLoans.length"
          />
          <h6 class="mr-3">Loan {{ loanNumber }}-</h6>
          <h2 class="font-weight-bold d-inline">
            {{ formattedCurrentLoanAmount }}
          </h2>
        </div>
      </div>
    </template>

    <template #default>
      <div class="loan-options mb-5">
        <div class="loan-default-options">
          <LoanAmountRadioButton
            v-if="defaultRenewalRadioButtonOption"
            :value="{
              type: SelectionType.RENEWAL,
              renewalOption: RenewalOptions.DEFAULT,
            }"
            :selectedValue="currentLoanSelectionState"
            @change="setCurrentLoanSelectionState"
            :loanOption="defaultRenewalRadioButtonOption"
            :oldInterestRate="oldInterestRate"
          />

          <LoanAmountRadioButton
            v-if="
              newLoansDataOfLoanID(currentLPLoanID) &&
              isMoreRenewalAvailable(currentLPLoanID)
            "
            :value="{
              type: SelectionType.RENEWAL,
              renewalOption: RenewalOptions.MORE,
            }"
            :selectedValue="currentLoanSelectionState"
            @change="setCurrentLoanSelectionState"
            :loanOption="moreRenewalRadioButtonOption"
            :oldInterestRate="oldInterestRate"
          />
        </div>

        <div v-if="loanEnhancementRadioButtonOptions.length > 0" class="loan-enhancement-options">
          <div class="d-flex align-items-center ml-3">
            <div class="mr-2">
              <img
                src="@/assets/icon_Download_Pledge.svg"
                alt="up-arrow-img"
                class="up_arrow"
              />
            </div>
            <div class="text-scheme-green">Top up Options</div>
          </div>
          <div
            v-for="(loanOption, index) in loanEnhancementRadioButtonOptions"
            :key="index"
          >
            <LoanAmountRadioButton
              :value="{
                type: SelectionType.LOAN_ENHANCEMENT,
                schemeID: loanOption.schemeID,
              }"
              :selectedValue="currentLoanSelectionState"
              @change="setCurrentLoanSelectionState"
              :loanOption="loanOption"
              :oldInterestRate="oldInterestRate"
            />
          </div>
        </div>
      </div>
    </template>

    <template #modal-footer>
      <div class="footer-buttons">
        <button class="button-link px-1" @click="onBackButtonClicked">
          {{ viewingSummaryScreen ? "Cancel" : "Back" }}
        </button>
        <button class="btn-primary-rupeek"
          :class="{'disabled-btn': !currentLoanSelectionState}"
          @click="onNextButtonClicked">
          {{ viewingSummaryScreen ? "Confirm" : "Next" }}
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { formatRupeeAmount } from '@/utils/string';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import ProgressRing from '@/components/UIComponents/Progress/ProgressRing.vue';
import LoanAmountRadioButton from './LoanAmountRadioButton.vue';

export const SelectionType = Object.freeze({
  LOAN_ENHANCEMENT: 'le',
  RENEWAL: 'renewal',
});

export const RenewalOptions = Object.freeze({
  MORE: 'more',
  DEFAULT: 'default',
});
export default {
  name: 'LoanAmountSelectionModal',
  components: {
    ProgressRing,
    LoanAmountRadioButton,
  },
  props: {
    // Was the modal opened from the summary screen?
    // If yes, some things need to change.
    viewingSummaryScreen: Boolean,
  },
  mounted() {
    this.loanAmountSelectionModalOpened(this.viewingSummaryScreen);
  },
  computed: {
    // This is done to make the constants available in the template code.
    SelectionType() {
      return SelectionType;
    },
    RenewalOptions() {
      return RenewalOptions;
    },
    currentLoan() {
      return this.selectedLoans[this.currentLoanIndex];
    },
    currentLoanAmount() {
      if (!this.currentLoan) {
        return 0;
      }

      return this.currentLoan.loans.reduce(
        (acc, loanComponent) => acc + loanComponent.loanamount,
        0,
      );
    },
    loanNumber() {
      return this.currentLoanIndex + 1;
    },
    ...mapGetters({
      selectedLoans: 'loans/selectedLoans',
      loanSelectionStateOfLoanID: 'renewal/loanSelectionStateOfLoanID',
      selectedLESchemeID: 'renewal/selectedLESchemeID',
      isMoreRenewalAvailable: 'renewal/isMoreRenewalAvailable',
      loanEnhancementOptions: 'renewal/loanEnhancementOptions',
      newLoansDataOfLoanID: 'renewal/newLoansDataOfLoanID',
      currentLPLoanID: 'renewal/currentLPLoanID',
      currentLoanIndex: 'renewal/currentLoanIndex',
    }),
    formattedCurrentLoanAmount() {
      return formatRupeeAmount(this.currentLoanAmount);
    },
    currentLoanSelectionState() {
      let selectedValue = this.loanSelectionStateOfLoanID(this.currentLPLoanID);
      if (selectedValue && selectedValue.type === SelectionType.LOAN_ENHANCEMENT) {
        selectedValue = { type: selectedValue.type, schemeID: this.selectedLESchemeID };
      }
      return selectedValue;
    },
    newLoanDataOfCurrentLoan() {
      return this.newLoansDataOfLoanID(this.currentLPLoanID);
    },
    isCurrentLoanEligibleForLE() {
      return (
        this.newLoanDataOfCurrentLoan
        && this.newLoanDataOfCurrentLoan.isEligibleForLoanEnhancement
      );
    },
    oldInterestRate() {
      return this.newLoanDataOfCurrentLoan
        ? this.newLoanDataOfCurrentLoan.oldscheme.interestCalculation
          .interestRate
        : null;
    },
    defaultRenewalRadioButtonOption() {
      if (!this.newLoanDataOfCurrentLoan) return null;

      const { defaultRepledge } = this.newLoanDataOfCurrentLoan;
      const { scheme } = this.newLoanDataOfCurrentLoan;

      return {
        loanAmount: defaultRepledge.currentDayPrincipleAmount,
        interestRate: scheme.interestCalculation.interestRate,
        renewalCharges: defaultRepledge.repledgeamount,
        type: scheme.interestCalculation.type,
        tenure: scheme.tenure,
        interestSlabs: scheme.interestCalculation.interestSlabs,
      };
    },
    moreRenewalRadioButtonOption() {
      if (
        !this.newLoanDataOfCurrentLoan
        || !this.isMoreRenewalAvailable(this.currentLPLoanID)
      ) { return null; }

      const { moreRepledge } = this.newLoanDataOfCurrentLoan;
      const { scheme } = this.newLoanDataOfCurrentLoan;

      return {
        loanAmount: moreRepledge.currentDayPrincipleAmount,
        interestRate: scheme.interestCalculation.interestRate,
        renewalCharges: moreRepledge.repledgeamount,
        type: scheme.interestCalculation.type,
        tenure: scheme.tenure,
        interestSlabs: scheme.interestCalculation.interestSlabs,
      };
    },
    loanEnhancementRadioButtonOptions() {
      if (!this.isCurrentLoanEligibleForLE || !this.loanEnhancementOptions) { return []; }

      const options = this.loanEnhancementOptions.map((option) => {
        const loanComponentData = option.loans
          .filter((loanComponentTuple) => loanComponentTuple)
          .map((loanComponentTuple) => loanComponentTuple.find(({ type }) => type === 'secure'))
          .find(({ lploanid }) => lploanid === this.currentLPLoanID);

        if (!loanComponentData) return null;

        const { loanEnhancement } = loanComponentData;
        const { scheme } = option;
        return {
          schemeID: scheme.id,
          loanAmount: loanEnhancement.totalEligibilityAmount,
          interestRate: scheme.interestCalculation.interestRate,
          renewalCharges: loanEnhancement.repledgeamount,
          topUpAmount: loanEnhancement.totalDisbursalAmount,
          type: scheme.interestCalculation.type,
          tenure: scheme.tenure,
          interestSlabs: scheme.interestCalculation.interestSlabs,
        };
      });

      // remove nulls
      return options.filter((option) => option);
    },
  },
  methods: {
    ...mapActions('renewal', [
      'loanAmountSelectionModalOpened',
      'setSelectionStateOfLoanID',
      'setSelectedLESchemeID',
      'viewNextLoan',
      'viewPreviousLoan',
      'setCurrentLPLoanID',
      'confirmModalSelection',
    ]),

    completeModal() {
      this.confirmModalSelection();
      this.$emit('completed');
    },

    closeModal() {
      this.$emit('hidden');
      this.setCurrentLPLoanID(null);
    },

    onNextButtonClicked() {
      const viewingLastLoan = this.currentLoanIndex === this.selectedLoans.length - 1;

      if (this.viewingSummaryScreen || viewingLastLoan) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_RENEWAL_CONFIRM_LOAN_AMOUNT_CLICKED,
        };
        sendEvent(events.screen.LOAN_AMOUNT_SELECTION_MODAL, events.category.PAYMENT, properties);
        this.completeModal();
      } else {
        this.viewNextLoan();
      }
    },

    onBackButtonClicked() {
      const viewingFirstLoan = this.currentLoanIndex === 0;

      if (this.viewingSummaryScreen || viewingFirstLoan) {
        this.closeModal();
      } else {
        this.viewPreviousLoan();
      }
    },

    setCurrentLoanSelectionState(value) {
      let eventProperty = '';
      if (value.type === SelectionType.LOAN_ENHANCEMENT) {
        this.setSelectedLESchemeID(value.schemeID);
        this.setSelectionStateOfLoanID({
          loanid: this.currentLPLoanID,
          value: { type: value.type },
        });
        eventProperty = events.PAYMENT_LE_TOP_UP_OPTION_SELECTED;
      } else {
        this.setSelectionStateOfLoanID({ loanid: this.currentLPLoanID, value });
        eventProperty = value.renewalOption === RenewalOptions.DEFAULT
          ? events.PAYMENT_RENEWAL_LOWER_AMOUNT_OPTION_SELECTED
          : events.PAYMENT_RENEWAL_HIGHER_AMOUNT_OPTION_SELECTED;
      }
      const properties = {
        [events.EVENT_NAME]: eventProperty,
      };
      sendEvent(events.screen.LOAN_AMOUNT_SELECTION_MODAL, events.category.PAYMENT, properties);
    },
  },
};
</script>

<style lang="scss">
@import "@/scss/components.scss";

/**
  This should be scoped css but scoping breaks the modal UI,
  because some custom border classes are not getting applied.
*/
.loan-amount-selection-modal {
  height: calc(100vh - 50px);
  width: calc(100vw - 30px);
  max-width: 400px;
  background-color: #fafafa;

  .loan-amount-selection-modal-header {
    border-bottom: none;
    padding: 0;
    width: 100%;
    background-color: #fafafa;

    .header-flex-container {
      width: 100%;

      .header-title {
        width: 100%;
        background-color: #fff8ef;
        padding: 2rem;
        padding-bottom: 1rem;

        h5.popup-heading {
          margin-bottom: 11px;
          font-size: 1.5rem;
        }
        p {
          font-size: 1.1rem;
        }
      }

      .header-subtitle {
        padding: 12px 15px 5px 15px;
        margin-bottom: 7px;
        font-size: 1.5rem;
        h6 {
          font-size: 1.25rem;
        }
      }
    }
  }

  .loan-amount-selection-modal-body {
    padding-bottom: 30px;
  }

  .rounded-orange-circle {
    height: 2em;
    font-size: 1.2em;
    width: 2em;
    border-radius: 1em;
    line-height: 2.1em;
    text-align: center;
    background-color: #fe9411;
    color: white;
    font-weight: bold;
  }

  .text-scheme-green {
    color: #50bb7d;
    font-weight: bold;
  }

  .modal-body {
    padding: 13px;
  }

  .loan-amount-selection-modal-footer {
    border-top: none;

    .footer-buttons {
      position: absolute;
      bottom: 0;
      left: 0;
      background: $white-color;
      width: 100%;
      margin: 0px;
      padding: 8px 15px;
      display: flex;

      button {
        width: 100%;
      }
    }
  }

  .loan-options {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .loan-enhancement-options,
  .loan-default-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
