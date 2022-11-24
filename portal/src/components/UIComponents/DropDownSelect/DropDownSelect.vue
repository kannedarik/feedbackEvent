<template>
  <div>
    <div @click="$emit('toggle-selection')">
      <slot name="option"></slot>
    </div>
    <!-- [TODO]: add transition -->
    <div v-if="selection">
      <slot name="option-details"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selection: Boolean,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>

</style>
