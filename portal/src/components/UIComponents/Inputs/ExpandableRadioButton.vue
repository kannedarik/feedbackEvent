<template>
  <div
    class="expandable-radio-button cursor-pointer"
    :class="{ 'active': isChecked }"
    @click="disabled ? {} : $emit('change', value)"
  >
    <div
      :class="[disabled && 'btn-radio-disabled' , 'btn-radio position-relative' ]"
      :style="{ 'padding-left': reverse && '1.5rem' }"
    >
      <div
        v-bind="$attrs"
        class="radio-btn-content cursor-pointer"
        :class="{ 'flex-row-reverse': reverse }"
      >
        <slot name="radioButtonContent"></slot>
        <div class="expandable-radio-button-wrapper">
          <input
            type="radio"
            class="form-check-input orange"
            :id="id"
            :name="name"
            :value="value"
            :checked="isChecked"
            :disabled="disabled"
          />
          <div class="radio-button"></div>
        </div>
      </div>
    </div>
    <div v-if="isChecked">
      <slot name="radioButtonExpandableView"></slot>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'ExpandableRadioButton',
  model: {
    prop: 'selectedValue',
    event: 'change',
  },
  props: {
    id: null,
    name: null,
    value: null,
    selectedValue: null,
    disabled: null,
    reverse: Boolean,
  },
  emits: ['change'],
  computed: {
    isChecked() {
      const eq = _.isEqual(this.selectedValue, this.value);
      return eq;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/scss/common/mixins';
@import '~@/scss/common/variables';

.expandable-radio-button {
  width: 100%;
  @include box-shadow(0 0 2px 0, rgba(0, 0, 0, 0.2));
  border-radius: 8px;
  border: 1px solid #f5f5f5;

  &.active {
    border-color: #EA5518;
  }
}
.btn-radio {
  padding:
    clamp(0.2rem, 2vw, 0.6rem)
    clamp(1rem, 4vw, 2.5rem)
    clamp(0.2rem, 2vw, 0.6rem)
    clamp(0.2rem, 2vw, 0.6rem);
  border-radius: 7px;
  // box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.25);
  background-color: #ffffff;
  font-weight: 500;
}
.btn-radio-disabled {
  opacity: 0.5;
}

.radio-btn-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.scheme-interest-details {
  padding: 16px;
  background-color: #f2f2f2;
  border-radius: 7px;
  color: #484848;
}
.expandable-radio-button-wrapper {
  position: relative;
  max-width: 20px;
  max-height: 20px;
  input[type="radio"] {
    opacity: 0;
    margin: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
    cursor: pointer;
    &:disabled {
      & ~ .radio-button {
        background-color: transparent;
        border-color: transparent;
        &:after {
          background-color: #727272;
          width: 12px;
          height: 12px;
        }
      }
    }
  }
  .orange {
    &:checked {
      & ~ .radio-button {
        border-color: #EA5518;
        &:after {
          background-color: #EA5518;
        }
      }
    }
  }
  .radio-button {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 2px solid #cccccc;
    position: relative;
    &:after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #ffffff;
    }
  }
}
</style>
