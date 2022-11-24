<template>
  <div class="md:my-4">
    <div class="flex items-center text-left p-3 md:w-9/12 lg:w-4/6 mx-auto mb-4 info-wrapper"
      :class="width" v-for="(payment, index) in messages" :key="index">
      <img src="@/assets/icons/info_icon.svg" alt="error_info_icon" />
      <p class="m-0 just-line-break">
        {{payment.message}}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'OutlineMessagesBox',
  props: {
    messages: {
      type: Array,
      required: true,
    },
    width: {
      type: String,
      required: false,
    },
  },
};
</script>
<style scoped lang='scss'>
.info-wrapper {
  padding: 20px 15px;
  letter-spacing: 1px;
  border-radius: 8px;
  border: solid 1px #fe9411;
  &.w-full {
    p {
      font-size: 1rem;
      @media (max-width: 640px) {
        font-size: .625rem;
      }
    }
  }
  p {
    font-size: .625rem;
    color: #727272;
  }
  img {
    margin-right: 20px;
  }
}
.w-full {
  width: 100% !important;
}
.just-line-break {
  white-space: pre-line;
}
</style>
