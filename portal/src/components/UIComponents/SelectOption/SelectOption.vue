<template>
  <div class="select-option-wrapper">
    <label
      :for="name"
      class="select-option"
      :class="reverse && 'd-flex-reverse'"
    >
      <slot></slot>
      <div class="radio-button-wrapper">
        <input
          type="radio"
          name="schemeOptions"
          :id="name"
          class="form-check-input orange"
          :value="name"
        >
        <div class="radio-button"></div>
      </div>
    </label>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    name: String,
    reverse: Boolean,
  },
};
</script>

<style lang="scss" scoped>
  .select-option-wrapper {
    background-color: white;
  }
  label.select-option {
    display: flex;
    justify-content: space-between;
    padding:
      clamp(0.2rem, 2vw, 0.6rem)
      clamp(1rem, 4vw, 2.5rem)
      clamp(0.2rem, 2vw, 0.6rem)
      clamp(0.2rem, 2vw, 0.6rem);
    border-bottom: 1px solid rgba(0,0,0, 0.08);
    border-radius: 0.75rem;
    box-shadow: 0px 0px 3px 0px rgba(0,0,0, 0.25);
    cursor: pointer;
    margin: 0;

    .radio-button-wrapper {
      align-self: center;
      margin-left: max(1vw, 1.25rem);
    }
  }
</style>
