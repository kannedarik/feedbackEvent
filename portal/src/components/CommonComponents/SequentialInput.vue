<template>
<div class="d-flex gap-4 sm:justify-center md:justify-start">
  <div
    v-for="i in range(length)"
    :key="i"
    :class="['input-box']"
  >
    <input
      :type="inputHidden ? 'password' : 'text'"
      :style="inputHidden && {'font-size': '2rem'}"
      inputmode="numeric"
      pattern="[0-9]*"
      class="form-control text-center"
      :class="{'valid-input': validPIN && !inValidPIN,
      'invalid-input': input[i],
      'invalid-pin': inValidPIN }"
      autocomplete="off"
      placeholder=""
      maxlength="1"
      @keypress="$emit('keypress', $event, input, i)"
      v-model="input[i]"
      :ref="`${uniqueId}-${i}`"
      :id="`${uniqueId}-box-${i}`"
      @keyup="onKeyUpEvent($event, i)"
      @blur="onBlur"
    />
  </div>
</div>
</template>

<script>
import { range, reduce } from 'lodash';

export default {
  props: {
    uniqueId: String,
    length: Number,
    inputHidden: Boolean,
    inValidPIN: Boolean,
  },
  data() {
    return {
      input: [],
      incompletePIN: false,
      validPIN: false,
    };
  },
  watch: {
    incompletePIN(curr) {
      if (curr) this.$emit('incomplete-input');
    },
  },
  activated() {
    this.input = [];
    this.validPIN = this.validPIN && false;
  },
  methods: {
    range,
    onKeyUpEvent(event, index) {
      this.incompletePIN = false;
      const eventCode = event.which || event.keyCode;
      const prevBox = this.$refs[`${this.uniqueId}-${index - 1}`];
      const currentBox = this.$refs[`${this.uniqueId}-${index}`];
      const nextBox = this.$refs[`${this.uniqueId}-${index + 1}`];
      if (this.input && this.input[index].length === 1) {
        if (index < this.length - 1) {
          nextBox[0].focus();
        } else {
          this.input = this.input.filter((data) => data);
          this.validPIN = this.input.length === this.length
            && reduce(this.input, (prev, inp) => prev && inp && inp.length, true);
          this.incompletePIN = false;
        }
        currentBox[0].blur();
        this.input = this.input.filter((data) => data);
        this.validPIN = this.input.length === this.length && this.validPIN;
        if (this.validPIN) {
          this.$emit('done', this.$event, this.input);
        }
      }
      if (eventCode === 8 && index > 0) {
        prevBox[0].focus();
      }
    },
    onBlur() {
      this.incompletePIN = this.input.length !== this.length
        || !reduce(this.input, (prev, inp) => prev && inp && inp.length, true);
    },
    reSetPIN() {
      this.input = [];
      this.$nextTick(this.$refs[`${this.uniqueId}-0`][0].focus());
    },
  },
  mounted() {
    this.$nextTick(this.$refs[`${this.uniqueId}-0`][0].focus());
  },
};
</script>

<style lang="scss" scoped>
@import '@/scss/login.scss';
.input-box {
  width: 56px;
  height: 56px;
  input {
    width: 100%;
    height: 100%;
  }
}
.gap {
  &-3 {
    gap: 0.75rem;
  }
  &-4 {
    gap: 1rem;
  }
}
</style>
