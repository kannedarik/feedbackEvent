<template>
  <b-modal
    id="bv-modal-loan-details-popup"
    scrollable
    centered
    visible
    static
    lazy
    ok-only
    :ok-disabled="!!!selectedOption"
    content-class="loan-details-pop-up"
    header-class="loan-details-pop-up-header"
    @hidden="$emit('hidden')"
    @ok="$emit('ok')"
  >
  <template #modal-header>
    <span
        class="cursor-pointer custom-close-icon"
        @click="$bvModal.hide('bv-modal-loan-details-popup')"
      >
        <img src="@/assets/loan-details/cross.svg" alt="">
    </span>
    <div class="loan-details-block d-flex justify-content-center align-items-center flex-column">
      <div class="loan-details-img">
        <img
          src="@/assets/loan-details/percentage.svg"
          alt="percentage"
          class="img-responsive"
        >
      </div>
      <h6 class="popup-heading font-weight-bold text-center"
        v-if="schemeComparison.newSchemeSelected && schemeComparison.newSchemeTotal &&
        schemeComparison.newSchemeSelected.interestCalculation.interestRate ===
        schemeComparison.newSchemeTotal.interestCalculation.interestRate">
        Interest rate of pending loans to change on next renewal
      </h6>
      <h6 class="popup-header font-weight-bold text-center">Interest rate about to change</h6>
      <p class="popup-text font-weight-normal text-center"
        v-if="schemeComparison.newSchemeSelected && schemeComparison.newSchemeTotal &&
        schemeComparison.newSchemeSelected.interestCalculation.interestRate ===
        schemeComparison.newSchemeTotal.interestCalculation.interestRate">
        Pending loan amount in this group is
        <span class="medium-font-weight">less than &#8377;
          {{
            schemeComparison.newSchemeTotal
            && schemeComparison.newSchemeTotal.eligibility.ticketSizeMinAmount
            ? schemeComparison.newSchemeTotal.eligibility.ticketSizeMinAmount
              .toLocaleString("en-IN")
            : '-'
          }}
        </span>. This will result in change of interest rate, i.e.,
        <span class="medium-font-weight">
          {{
            `${toMonthlyInterestRate(totalInterest.interestRate) || '-' }% P.M`
          }}
          to
          {{
            `${toMonthlyInterestRate(selectedInterest.interestRate) || '-' }% P.M`
          }}
        </span> on their renewal.
      </p>
      <p class="popup-text font-weight-normal text-center" v-else>
        Your renewal loan amount is
        <span class="medium-font-weight">
          less than &#8377;
          {{
            schemeComparison.newSchemeTotal
            && schemeComparison.newSchemeTotal.eligibility.ticketSizeMinAmount
            ? schemeComparison.newSchemeTotal.eligibility.ticketSizeMinAmount
              .toLocaleString("en-IN")
            : '-'
          }}
        </span>
        and hence current interest rate of
        <span class="medium-font-weight">
          {{
            `${toMonthlyInterestRate(totalInterest.interestRate) || '-'}%`
          }}
          will change to
          {{
            `${toMonthlyInterestRate(selectedInterest.interestRate) || '-'}%`
          }}
        </span>
      </p>
    </div>
  </template>
  <template #default>
    <div class="loan-details-description">
      <SchemeChangeRadioButton
        :selectedValue="selectedOption"
        :value="SelectAllLoansOption"
        :changeScheme="{
          type: 'Retain',
          message: 'Select all the loans belonging to same group',
          totalInterest,
          selectedInterest
        }"
        :scheme="schemeComparison.newSchemeTotal"
        @change="selectedOption = SelectAllLoansOption"
      />
      <SchemeChangeRadioButton
        :selectedValue="selectedOption"
        :value="SelectedLoansOption"
        :changeScheme="{
          type: 'Change',
          message: changeMessage,
          totalInterest,
          selectedInterest
        }"
        :scheme="schemeComparison.newSchemeSelected"
        @change="selectedOption = SelectedLoansOption"
      />
    </div>
    <div class="notification-txt d-flex align-items-center">
      <span>
        <img
          class="info-img mr-1"
          src="@/assets/loan-details/icon_info_Yellow.svg"
          alt="disclaimer"
        />
      </span>
      <p class="normal-font-weight ml-1">
        *Interest rates shown above are post rebate only. Please refer to
        the T&C mentioned on the Renewal Summary for more details.
      </p>
    </div>
  </template>
  </b-modal>
</template>

<script>
import _ from 'lodash';
import { toMonthlyInterestRate } from '@/utils/string';
import SchemeChangeRadioButton from './SchemeChangeRadioButton.vue';

export default {
  props: {
    schemeComparison: null,
  },
  data() {
    return {
      SelectAllLoansOption: 'selectAllLoansOption',
      SelectedLoansOption: 'selectedLoansOption',
      selectedOption: null,
    };
  },
  components: {
    SchemeChangeRadioButton,
    // ExpandableRadioButton,
  },
  computed: {
    changeMessage() {
      return this.schemeComparison.newSchemeSelected
      && this.schemeComparison.newSchemeTotal
      && this.schemeComparison.newSchemeSelected.interestCalculation.interestRate
          === this.schemeComparison.newSchemeTotal.interestCalculation.interestRate
        ? `Continue at ${toMonthlyInterestRate(_.get(this.schemeComparison, 'newSchemeSelected.interestCalculation.interestRate')) || '-'}% for selected loans`
        : 'Continue with the selected loan';
    },
    totalInterest() {
      return this.schemeComparison.newSchemeTotal && _.get(this.schemeComparison, 'newSchemeTotal.interestCalculation');
    },
    selectedInterest() {
      return this.schemeComparison.newSchemeSelected && _.get(this.schemeComparison, 'newSchemeSelected.interestCalculation');
    },
  },
  methods: {
    toMonthlyInterestRate,
  },
};
</script>

<style lang="scss">
  // .modal-content {
  //   display: block;
  //   box-sizing: border-box;
  // }

  header.modal-header {
    position: relative;
    display: block;
    padding: 2rem clamp(3rem, 4vw, 6rem);
    border: none;
    background-color: #fff8ef;
  }

  footer.modal-footer {
    border-top: none;
  }

  .modal-body {
    padding: 0;
  }

  .custom-close-icon {
    position: absolute;
    top: 10%;
    right: 5%;
  }

  .loan-details-description {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding: clamp(2.5rem, 3vw, 4rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 3vw, 3rem);
  }

  .loan-details-block {
    .loan-details-img {
      width: 56px;
      height: 56px;

      img {
        width: 100%;
        height: 100%;
      }
    }
    .popup-header {
      font-size: clamp(1.2rem, 3vw, 1.4rem);
      margin: 1.5rem 0;
    }
    .popup-text {
      font-size: clamp(0.9rem, 3vw, 1.1rem);
      color: #484848;
    }
  }

  .notification-txt {
    padding: 11px 36px;
    margin-top: 2px;
    border: 1px solid #ffeed9;
    background-color: #fff8ef;
    span {
      min-width: 14px;
      max-width: 18px;
      margin-right: clamp(0.5rem, 3vw, 1rem);
      img {
        width: 100%;
        height: 100%;
      }
    }
    p {
      font-size: 9px;
      font-weight: 500;
    }
  }

</style>
