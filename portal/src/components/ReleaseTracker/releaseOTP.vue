<template>
  <div class="p-3 w-100 border-box otp">
    <span class="d-block mb-2">Verify this OTP with Loan Manager</span>
    <div class="d-flex" v-if="releaseOTP.length">
      <h2 class="bold-font" v-for="(otp, index) in releaseOTP" :key="index">
        {{otp}}
      </h2>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ReleaseOTP',
  props: {
    releaseOTP: {
      type: Array,
      required: true,
    },
  },
};
</script>
