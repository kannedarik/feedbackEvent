<template>
  <div :class="{ disabled: disabled}" @click="$emit('click')">
    <ExpandableRadioButton
      :id="id"
      :value="id"
      :selectedValue="selectedValue"
      :disabled="(disabled)"
      :reverse="true"
      name="paymentOptions"
      @change="(value) => $emit('change', value)"
    >
      <template #radioButtonContent>
        <div class="payment-option-content items-center">
          <label class="form-check-label cursor-pointer" :for="id">
            {{value}}
            <span v-if="showTopupLabel">
            / Top Up
            </span>
          </label>
          <label class="info-icon-wrapper cursor-pointer show-amount" v-if="disabled">
            <span class="info info-md d-inline-block" :class="{disabled}">
              i
            </span>
          </label>
          <h5 class="show-amount font-bold" v-if="showAmount">
            <span v-if="amount && !closingAmount">
              {{ formatRupeeAmount(amount) }}
            </span>
            <span v-else-if="!amount && closingAmount">
              {{ formatRupeeAmount(closingAmount) }}
            </span>
            <span v-else>
              {{`${formatRupeeAmount(amount >= 100
                ? amount : 100)} - ${formatRupeeAmount(closingAmount)}`
              }}
            </span>
          </h5>
        </div>
      </template>
    </ExpandableRadioButton>
  </div>
</template>

<script>
import { formatRupeeAmount } from '@/utils/string';
import ExpandableRadioButton from '../UIComponents/Inputs/ExpandableRadioButton.vue';

export default {
  props: {
    id: String,
    value: String,
    disabled: Boolean,
    selectedValue: String,
    amount: Number,
    showTopupLabel: Boolean,
    closingAmount: Number,
  },
  data() {
    return {
      showAmountOptions: ['interest', 'closeLoan', 'partPayment'],
    };
  },
  components: {
    ExpandableRadioButton,
  },
  computed: {
    showAmount() {
      return this.showAmountOptions.includes(this.selectedValue)
        && this.selectedValue === this.id;
    },
  },
  methods: {
    formatRupeeAmount,
  },
};
</script>

<style lang="scss" scoped>
  .payment-option-content {
    display: flex;
    flex-grow: 1;
    padding: clamp(0.3rem, 2vw, 0.5rem) 0;
    font-size: clamp(1rem, 3vw, 1.3rem);
  }
  .show-amount {
    margin-left: auto;
    min-width: max-content;
  }
  label.form-check-label {
    padding: 0;
  }
  .disabled {
    .expandable-radio-button {
      background-color: #cccccc;
      border-color: #cccccc;
    }
  }
</style>
