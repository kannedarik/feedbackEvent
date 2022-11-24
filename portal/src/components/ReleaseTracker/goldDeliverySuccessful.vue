<template>
  <div class="w-100">
    <div class="p-2 delivery-success-bg"></div>
    <div class="delivery-successful mb-4">
      <img src="@/assets/icons/closing_icon.svg" alt="closeing_icon"
        class="float-right mt-3 mr-3 cursor-pointer" @click="moveToHome()" />
      <div class="p-5 text-center">
        <div class="checkmark-circle">
          <div class="background"></div>
          <div class="checkmark draw"></div>
        </div>
        <h3 class="my-3 bold-font white-color">Gold Delivery Successful</h3>
        <p class="bold-font white-color">Thank you for taking a Loan from Rupeek</p>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'GoldDeliverySuccessful',
  methods: {
    moveToHome() {
      this.$router.push('/dashboard');
    },
  },
};
</script>
<style lang='scss'>
@import "../../scss/common/mixins";

.checkmark-circle {
  width: 80px;
  height: 80px;
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin: 40px 0;
  .background {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #FFFFFF;
    position: absolute;
    animation: animate 1700ms linear infinite;
  }
  .checkmark {
    border-radius: 5px;
    &.draw:after {
      @include animation-delay(100ms);
      @include animation-duration(1200ms);
      @include animation-timing-function(ease);
      @include animation-name(checkmark);
      @include transform(scaleX(-1) rotate(180deg + -45deg));
      @include animation-fill-mode(forwards);
    }
    &:after {
      opacity: 0;
      height: 0;
      width: 0;
      @include transform-origin(left, top);
      border-right: 8px solid #76C11B;
      border-top: 8px solid #76C11B;
      border-radius: 2px;
      content: "";
      left: 16px;
      top: 44px;
      position: absolute;
    }
  }
}

@include keyframes(checkmark) {
  0% { height: 0; width: 0; opacity: 1; }
  50% { height: 0; width: 24px; opacity: 1; }
  100% { height: 46px; width: 24px; opacity: 1; }
}

@include keyframes(animate) {
  0% { box-shadow: 0 0 0 0 #91cd49ed, 0 0 0 0  #91cd49d4; }
  40% { box-shadow: 0 0 0 40px #91cd4908, 0 0 0 12px #91cd49d4; }
  80% { box-shadow: 0 0 0 120px #91cd4908, 0 0 0 40px #91cd4908; }
  100% { box-shadow: 0 0 0 0 #91cd4908, 0 0 0 40px  #91cd4908; }
}
</style>
