<template>
  <div class="form-group d-flex flex-direction-column mb-1">
    <label :for="inputId">
      <slot name="input-title"></slot>
    </label>
    <div
      class="input-wrapper d-flex px-2"
      :class="[inputFocus ? 'active' : 'invalid-input']"
    >
      <span class="input-boilerplate d-flex align-items-center">
        <slot name="input-label"></slot>
      </span>
      <input
        :type="hidden ? 'password' : 'text'"
        class="form-control"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :inputmode="inputMode"
        :pattern="inputPattern"
        :id="inputId"
        :ref="inputId"
        @keypress="onKeyPress"
        @blur="(e) => { inputFocus = false; onBlur(e); }"
        v-model="input"
      />
      <span
        class="close cursor-pointer d-flex"
        @click="input = ''"
      >
        <img src="~@/assets/icons/closing_icon.svg" alt="close"
          :class="[clearable && input && input.length > 0
            ? 'visibility-visible' : 'visibility-hidden']"
        />
      </span>
    </div>
    <div>
      <label class="mt-2 error-text" v-if="hasShowErrorMessage"
        v-html="errorMessage">
      </label>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    title: String,
    inputId: String,
    maxLength: Number,
    placeholder: String,
    errorMessage: String,
    required: Boolean,
    onKeyPress: Function,
    onBlur: Function,
    checkInput: Function,
    clearable: Boolean,
    autofocus: Boolean,
    inputPattern: String,
    inputMode: String,
    hidden: Boolean,
    hasShowErrorMessage: Boolean,
  },
  data() {
    return {
      inputFocus: this.autoFocus,
    };
  },
  computed: {
    input: {
      get() { return this.value; },
      set(val) { this.$emit('input', val); },
    },
  },
  mounted() {
    this.$nextTick(this.$refs[this.inputId].focus());
  },
};
</script>

<style lang="scss" scoped>
@import '~@/scss/common/_variables.scss';
  .input-wrapper {
    font-size: 18px;
    font-weight: 600;
    border-radius: 5px;
    border: 2px solid #0000001f;
    background-color: #f2f2f2;
    input {
      border: none;
      background-color: transparent;
      font-size: 18px;
      font-weight: 600;
      &::placeholder {
        color: #A5ABB7;
      }
    }
    &.active,
    &.invalid-input {
        border: 2px solid $theme-border-color;
    }
    &.active {
        background-color: white;
    }
  }
</style>
