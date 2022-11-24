<template>
  <ExpandableRadioButton
    :value="value"
    :selectedValue="selectedValue"
    :disabled="loanOption.disabled"
    @change="$emit('change', $event)"
  >
    <template #radioButtonContent>
      <div
        class="d-flex justify-content-between align-items-center"
        style="flex-grow: 1; padding: 1rem"
      >
        <div class="d-flex align-items-center">
          <span class="text-currency-symbol mr-1">
            {{ formattedLoanAmount.currency }}
          </span>
          <span class="text-amount">
            {{ formattedLoanAmount.amount }}
          </span>
        </div>
        <div
          class="d-flex flex-column align-items-end mr-3"
          style="margin-left: auto; margin-top: 1px"
        >
          <div v-if="loanOption.topUpAmount" class="text-scheme-detail">
            <span class="text-scheme-green">Top up</span>
            <span class="text-scheme-grey">{{
              formattedTopUpAmount.currency
            }}</span>
            <span class="text-scheme-green">{{
              formattedTopUpAmount.amount
            }}</span>
          </div>
          <div
            class="
              text-scheme-detail
              text-scheme-grey
              d-flex
              justify-content-center
              align-items-center
              badge-notify
            "
            :class="{
              'badge badge-pill badge-roi-blue':
                interestRateStatus == 'increased',
              'badge badge-pill badge-roi-green':
                interestRateStatus == 'decreased',
            }"
          >
            <span
              v-if="interestRateStatus === 'decreased'"
              class="arrow arrow-green"
            >
              <img
                class="arrow-down transform-y"
                src="@/assets/arrows/arrow-down-white.svg"
              />
            </span>
            <span>ROI {{ interestRatePerMonth }}% P.M</span>
          </div>
        </div>
      </div>
    </template>
    <template #radioButtonExpandableView>
      <div class="scheme-interest-details">
        <div class="d-flex flex-column text-interest-details-h1">
          <div class="d-flex flex-row mb-1">
            <div class="flex-item">Starting ROI</div>
            <div>
              <div>
                <span class="font-weight-bold">{{ interestRatePerMonth }}% P.M</span>
                <small class="interest-rate-pa interest-rate-text-small">
                  ({{loanOption.interestRate}}% P.A)
                </small>
                <span class="font-weight-bold">
                  - Pay {{ loanOption.type === "jumping" ? 'monthly' : 'anytime' }}
                </span>
              </div>
              <div class="text-interest-details-h3">
                * Applied as per repayments history
              </div>
            </div>
          </div>
          <div class="d-flex flex-row mb-1">
            <div class="flex-item">Amount Payable</div>
            <div class="font-weight-bold">₹ {{ loanOption.renewalCharges }}</div>
          </div>
          <div class="d-flex flex-row">
            <div class="flex-item">Tenure</div>
            <div class="font-weight-bold">{{ loanOption.tenure }} Months</div>
          </div>
        </div>
        <div v-if ="loanOption.type === 'jumping'">
          <div class="text-interest-details-h3 mb-1">
            Interest rate increases if payment not done by
          </div>
          <div class="d-flex flex-column text-interest-details-h2">
            <div class="d-flex mb-1">
              <div class="flex-item">Days</div>
              <div
                class="flex-box-item-basis"
                v-for="(interest, index) in loanOption.interestSlabs"
                :key="index"
              >
                {{ interest.fromDay }}-{{ interest.toDay }}
              </div>
            </div>
            <div class="d-flex mb-1">
              <div class="flex-item">ROI (P.M)</div>
              <div
                class="flex-box-item-basis font-weight-bold"
                v-for="(interest, index) in loanOption.interestSlabs"
                :key="index"
              >
                {{ toInterestRatePerMonth(interest.interestRate) }}%
              </div>
            </div>
            <div class="d-flex mb-1 interest-rate-pa">
              <div class="flex-item">ROI (P.A)</div>
              <div
                class="flex-box-item-basis"
                v-for="(interest, index) in loanOption.interestSlabs"
                :key="index"
              >
                {{ interest.interestRate }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ExpandableRadioButton>
</template>

<script>
import ExpandableRadioButton from '@/components/UIComponents/Inputs/ExpandableRadioButton.vue';
import { toRupeeAmount } from '@/utils/string';

export default {
  name: 'LoanAmountRadioButton',
  model: {
    prop: 'selectedValue',
    event: 'change',
  },
  props: {
    selectedValue: null,
    loanOption: null,
    oldInterestRate: null,
    value: null,
  },
  components: {
    ExpandableRadioButton,
  },
  methods: {
    toInterestRatePerMonth(interestRate) {
      return interestRate ? (interestRate / 12).toFixed(2) : '-';
    },
  },
  computed: {
    formattedLoanAmount() {
      return toRupeeAmount(this.loanOption.loanAmount);
    },
    formattedTopUpAmount() {
      return toRupeeAmount(this.loanOption.topUpAmount);
    },

    interestRatePerMonth() {
      return this.loanOption && this.loanOption.interestRate ? (this.loanOption.interestRate / 12).toFixed(2) : '-';
    },

    interestRateStatus() {
      if (this.loanOption.interestRate === this.oldInterestRate) {
        return 'unchanged';
      } if (this.loanOption.interestRate > this.oldInterestRate) {
        return 'increased';
      }
      return 'decreased';
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  vertical-align: middle;
}
.text-currency-symbol {
  font-size: 0.8em;
  opacity: 0.7;
}
.text-amount {
  font-size: 1.4em;
  font-weight: normal;
}
.text-scheme-detail {
  font-size: 10px;
  span.arrow {
    margin-right: 0.5rem;
    font-size: 8px;
    @media screen and (min-width: 700px) {
      font-size: 9px;
    }
  }
  .arrow {
    color: white;
    width: 15px;
    aspect-ratio: 1;
    // padding: 2px;
    margin-right: 2px;
    line-height: 12px;
    text-align: center;
    border-radius: 50%;
    font-weight: bold;
  }
  .arrow-green {
    background-color: #73b888;
  }
  .arrow-blue {
    background-color: #3e8dcc;
  }
  .arrow-orange {
    background-color: #fe9411;
  }
  .arrow-down {
    color: #ffffff;
  }
  .renewal-charge-text {
    margin-right: 5px;
    font-size: 11px;
  }
  .renewal-charge-amount{
    font-weight: bold;
    font-size: 14px;
  }
}
.text-scheme-green {
  color: #50bb7d;
  font-weight: bold;
}
.text-scheme-grey {
  opacity: 0.5;
}
.badge-roi-blue {
  color: #217cc4;
  opacity: 1;
  background-color: rgba(55, 136, 202, 0.2);
}
.badge-roi-green {
  background-color: rgb(206, 231, 211);
  opacity: 1;
  color: #73b888;
}
.badge-notify {
  // width: 95px;
  font-size: 8px;
  @media screen and (min-width: 700px) {
    font-size: 9px;
  }
}
.transform-xy {
  transform: translate(-20%, -10%);
}
.transform-y {
  transform: translateY(10%);
}
.scheme-interest-details {
  padding: 16px;
  background-color: #f2f2f2;
  border-radius: 7px;
  color: #484848;
  .text-interest-details-h1 {
    font-size: 0.8em;
  }
  .interest-rate-pa {
    color:#737373;
  }
  .interest-rate-text-small{
    font-size: 0.8em;
  }
  .text-interest-details-h2 {
    font-size: 0.7em;
  }
  .text-interest-details-h3 {
    font-size: 0.6em;
  }
  .flex-item {
    flex-basis: 33.33%;
  }
  .flex-box-item-basis {
    flex-basis: 13.33%;
  }
}
</style>
