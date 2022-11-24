<template>
  <ExpandableRadioButton
    :selectedValue="selectedValue"
    :value="value"
    :disabled="disabled"
    @change="$emit('change', value)"
    >
    <template #radioButtonContent>
        <label
          :for="value"
          class="
            d-flex
            border-bottom-gray
            scheme-card align-items-center
            justify-content-between
            cursor-pointer
          "
        >
        <div class="d-flex">
            <span
            class="interest-card mr-3 text-center font-weight-normal"
            :class="changeScheme.type === 'Retain' ? 'bg-green' : 'bg-red'"
            >
              <span v-if="changeScheme.type === 'Retain'">Retain</span>
              <span v-else-if="
                changeScheme.selectedInterest
                && changeScheme.totalInterest
                && changeScheme.selectedInterest.interestRate
                    === changeScheme.totalInterest.interestRate"
              >
                Continue
              </span>
              <span v-else>Change</span>
              <b class="d-block"> {{
                toMonthlyInterestRate(
                    changeScheme.type === 'Retain'
                    ? changeScheme.totalInterest.interestRate
                    : changeScheme.selectedInterest.interestRate
                )
              }}%</b>
            </span>
            <div>
              <p class="loan-details-description-txt font-weight-normal">
                {{changeScheme.message}}
              </p>
              <span  v-if="changeScheme.type === 'Retain'" class="normal-font span1">
                Retain
                {{
                  toMonthlyInterestRate(
                    changeScheme.type === 'Retain'
                    ? changeScheme.totalInterest.interestRate
                    : changeScheme.selectedInterest.interestRate
                  )
                }}%
                <span
                  v-if="
                    changeScheme.totalInterest && changeScheme.selectedInterest
                    && changeScheme.totalInterest === changeScheme.selectedInterest
                  "
                > for all loans
                </span>
              </span>
              <span
                class="span1"
                v-else-if="
                  changeScheme.type === 'Change'
                  && changeScheme.selectedInterest
                  && changeScheme.totalInterest
                  && changeScheme.selectedInterest.interestRate
                    === changeScheme.totalInterest.interestRate
                "
              >
                Continue with Selection
              </span>
              <span class="span1" v-else-if="changeScheme.type === 'Change'">Change to {{
                toMonthlyInterestRate(changeScheme.selectedInterest.interestRate) || '-'
              }}%</span>
            </div>
        </div>
        </label>
    </template>
    <template #radioButtonExpandableView>
      <ChangeSchemeDetails
        :schemes="scheme"
      />
    </template>
  </ExpandableRadioButton>
</template>

<script>
import { toMonthlyInterestRate } from '@/utils/string';
import ChangeSchemeDetails from '../ChangeSchemeDetails/ChangeSchemeDetails.vue';
import ExpandableRadioButton from '../UIComponents/Inputs/ExpandableRadioButton.vue';

export default {
  props: {
    selectedValue: null,
    value: null,
    disabled: null,
    changeScheme: null,
    scheme: null,
  },
  components: {
    ExpandableRadioButton,
    ChangeSchemeDetails,
  },
  methods: {
    toMonthlyInterestRate,
  },
};
</script>

<style lang="scss" scoped>
  label{
    margin: 0;
  }
  .bg-green {
    background-color: #e7fdf0;
    color: #175030;
    border: 1px solid #17503010;
  }

  .bg-red {
    background-color: rgba(248, 223, 223, 0.89);
    color: #d1281e;
    border: 1px solid rgba(248, 223, 223);
  }

  .interest-card {
    align-self: center;
    padding: clamp(0.25rem, 3vw, 0.75rem);
    border-radius: 0.5rem;
    font-size: clamp(0.8rem, 2vw, 1rem);
  }

  .loan-details-description-txt {
    font-size: clamp(0.9rem, 3vw, 1.2rem);
    color: #727272;
  }

  .span1 {
    font-size: clamp(0.9rem, 2vw, 1.25rem);
    color: #484848;
    font-weight: 500;
  }
</style>
