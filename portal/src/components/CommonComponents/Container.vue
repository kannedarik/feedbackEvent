<template>
  <div class="container p-0">
    <div class="row m-0">
      <div class="col-12 p-0 col-lg-9 m-auto br bg-white"
      :class="screenType">
        <slot></slot>
       </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'container',
  props: {
    screenType: {
      type: String,
      required: false,
    },
  },
};
</script>
