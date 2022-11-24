<template>
  <SelectOption :name="changeScheme.name">
    <template>
      <div class="d-flex">
        <span
          class="interest-card mr-3 text-center font-weight-normal"
          :class="changeScheme.type === 'Retain' ? 'bg-green' : 'bg-red'"
        >
          {{changeScheme.type}}
          <b class="d-block"> {{changeScheme.rate}}%</b>
        </span>
        <div>
          <p class="loan-details-description-txt font-weight-normal">
            {{changeScheme.message}}
          </p>
          <span class="span1"> {{changeScheme.type}} {{changeScheme.rate}}%</span>
        </div>
      </div>
    </template>
  </SelectOption>
</template>

<script>
import SelectOption from '../UIComponents/SelectOption/SelectOption.vue';

export default {
  props: {
    changeScheme: Object,
  },
  data() {
    return {};
  },
  components: {
    SelectOption,
  },
};
</script>

<style lang="scss" scoped>
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
