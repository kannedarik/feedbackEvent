<template>
  <div class="container">
    <div class="row">
      <div class="col-12 m-auto col-lg-9 p-0">
        <div class="delivery-successful" v-if="!hasShowLoader">
          <div class="py-5 px-3 text-center">
            <div class="checkmark-circle">
              <div class="background"></div>
              <div class="checkmark-icon draw"></div>
            </div>
            <h3 class="my-4 bold-font white-color">
               {{ $t(`${paymentSuccess.title}`) }}!
            </h3>
            <div class="payment-box m-auto d-flex justify-content-center md:w-50">
              <span class="inter-font-family mb-2">
                Amount Paid
              </span>
              <p class="bold-font inter-font-family paid-amount">
                {{formatRupeeAmount(paymentSuccess.amount)}}
              </p>
            </div>
          </div>
        </div>
        <div class="loader-slot-booking" v-else-if="hasGoToSlotBooking">
          <div class="stage">
            <div class="dot-spin m-auto"></div>
            <p class="text-center inter-font-family">
              Taking you to Slot Booking
              <br />for your Gold delivery
            </p>
          </div>
        </div>
        <PaymentSuccess v-else
          :paymentSuccess="paymentSuccess"
          :paymentSummaryInfo="paymentSummaryInfo"
          :paymentMessages="paymentMessages"
          :securedLoanClosed="securedLoanClosed"
        />
      </div>
    </div>
  </div>
</template>
<script>
import PaymentSuccess from '@/components/paymentStatus/PaymentSuccess.vue';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'ReleaseSucessful',
  data() {
    return {
      hasShowLoader: false,
      referenceId: '',
      paymentStatusSuccess: false,
    };
  },
  components: {
    PaymentSuccess,
  },
  props: {
    paymentSuccess: null,
    paymentSummaryInfo: {
      type: Array,
      required: false,
    },
    paymentMessages: {
      type: Array,
      required: false,
    },
    securedLoanClosed: {
      type: Boolean,
      required: false,
    },
    slotBookingLaunched: {
      type: Boolean,
      required: false,
    },
  },
  computed: {
    hasGoToSlotBooking() {
      return this.paymentStatusSuccess && this.paymentSuccess
        && this.paymentSuccess.type === 'closing'
        && this.slotBookingLaunched && this.securedLoanClosed;
    },
  },
  methods: {
    formatRupeeAmount,
    showLoaderScreen() {
      this.hasShowLoader = true;
      if (this.hasGoToSlotBooking) {
        setTimeout(() => { this.moveToSlotbookingScreen(); }, 3000);
      }
    },
    moveToSlotbookingScreen() {
      this.$router.push(`/release-slot-booking?referenceId=${this.$route.query.requestid}`);
    },
  },
  mounted() {
    this.paymentStatusSuccess = this.$route.query.success === 'true';
    setTimeout(() => { this.showLoaderScreen(); }, 3000);
  },
};
</script>
<style lang='scss'>
@mixin animation-delay($value) {
  -webkit-animation-delay: $value;
     -moz-animation-delay: $value;
          animation-delay: $value;
}

@mixin animation-duration($value) {
  -webkit-animation-duration: $value;
     -moz-animation-duration: $value;
          animation-duration: $value;
}
@mixin animation-timing-function($value) {
  -webkit-animation-timing-function: $value;
     -moz-animation-timing-function: $value;
          animation-timing-function: $value;
}
@mixin animation-fill-mode($value) {
  -webkit-animation-fill-mode: $value;
     -moz-animation-fill-mode: $value;
          animation-fill-mode: $value;
}
@mixin animation-name($value) {
  -webkit-animation-name: $value;
     -moz-animation-name: $value;
          animation-name: $value;
}
@mixin transform($property) {
  -webkit-transform: $property;
      -ms-transform: $property;
          transform: $property;
}
@mixin transform-origin($firstposition, $secondPosition) {
  -webkit-transform-origin: $firstposition $secondPosition;
     -moz-transform-origin: $firstposition $secondPosition;
      -ms-transform-origin: $firstposition $secondPosition;
       -o-transform-origin: $firstposition $secondPosition;
          transform-origin: $firstposition $secondPosition;
}
@mixin keyframes($animationName) {
  @-webkit-keyframes #{$animationName} {
    $browser: '-webkit-' !global;
    @content;
  }
  @-moz-keyframes #{$animationName} {
    $browser: '-moz-' !global;
    @content;
  }
  @-o-keyframes #{$animationName} {
    $browser: '-o-' !global;
    @content;
  }
  @keyframes #{$animationName} {
    $browser: '' !global;
    @content;
  }
} $browser: null;
.paid-amount {
  color: #5DA513;
}
.delivery-successful {
  background: #76C11B;
  height: 100vh;
  h3 {
    font-size: 28px;
  }
  .payment-box {
    background: #fff;
    border-radius: 12px;
    height: 104px;
    flex-direction: column;
    span  {
      font-weight: 600;
      font-size: 14px;
      opacity: 0.8;
    }
    p {
      font-size: 24px;
    }
  }
}
.loader-slot-booking {
  background: #fff;
  height: 100vh;
  position: relative;
  .stage {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -30%);
  }
  p {
    font-weight: 600;
    font-size: 16px;
    color: #1E2D4B;
    margin: 56px 0;
  }
}

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
    &.error {
      background: #F2323C;
      animation: animateerror 1700ms linear infinite;
    }
  }
  .checkmark-icon {
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
  .crossmark {
    position: relative;
    top: 47%;
    left: 25%;
    &:after{
      position: absolute;
      content: '';
      display: block;
      width: 40px;
      height: 0px;
      border: solid #FFF;
      border-width: 0 0px 6px 0;
      transform: rotate(45deg);
      left:0;
      top:0;
    }
    &:before{
      position: absolute;
      content: '';
      display: block;
      width: 40px;
      height: 0px;
      border: solid #FFF;
      border-width: 0 0px 6px 0;
      transform: rotate(-45deg);
      left:0;
      top:0;
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
@include keyframes(animateerror) {
  0% { box-shadow: 0 0 0 0 #F2323C, 0 0 0 0  #F2323C; }
  40% { box-shadow: 0 0 0 20px #f2323c73, 0 0 0 10px #f2323c73; }
  80% { box-shadow: 0 0 0 40px #f2323c42, 0 0 0 20px #f2323c42; }
  100% { box-shadow: 0 0 60px  #f2323c00, 0 0 0 30px  #f2323c00; }
}
/**
 * ==============================================
 * Dot Spin
 * ==============================================
 */
.dot-spin {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: transparent;
  color: transparent;
  animation: dotSpin 1.5s infinite linear;
}

@keyframes dotSpin {
  0% {
    box-shadow: 0 -27px 0 0 rgba(253, 238, 232, 0.2),
    19px -19px 0 0 rgba(251, 221, 209, 0.3),
    27px 0 0 0 rgba(247, 187, 163, 0.5),
    19px 19px 0 0 rgba(247, 187, 163, 0.7),
    0 27px 0 0 rgba(247, 187, 163, 0.8),
    -19px 19px 0 0 rgba(242, 153, 116, 0.9),
    -27px 0 0 0 #EE7746,
    -19px -19px 0 0 #EA5518;
  }
  12.5% {
    box-shadow: 0 -27px 0 0 #EA5518,
    19px -19px 0 0 rgba(253, 238, 232, 0.2),
    27px 0 0 0 rgba(251, 221, 209, 0.3),
    19px 19px 0 0 rgba(247, 187, 163, 0.5),
    0 27px 0 0 rgba(247, 187, 163, 0.7),
    -19px 19px 0 0 rgba(247, 187, 163, 0.8),
    -27px 0 0 0 rgba(242, 153, 116, 0.9),
    -19px -19px 0 0 #EE7746;
  }
  25% {
    box-shadow: 0 -27px 0 0 #EE7746,
    19px -19px 0 0 #EA5518,
    27px 0 0 0 rgba(253, 238, 232, 0.2),
    19px 19px 0 0 rgba(251, 221, 209, 0.3),
    0 27px 0 0 rgba(247, 187, 163, 0.5),
    -19px 19px 0 0 rgba(247, 187, 163, 0.7),
    -27px 0 0 0 rgba(247, 187, 163, 0.8),
    -19px -19px 0 0 rgba(242, 153, 116, 0.9);
  }
  37.5% {
    box-shadow: 0 -27px 0 0 rgba(242, 153, 116, 0.9),
    19px -19px 0 0 #EE7746, 27px 0 0 0 #EA5518,
    19px 19px 0 0 rgba(253, 238, 232, 0.2),
    0 27px 0 0 rgba(251, 221, 209, 0.3),
    -19px 19px 0 0 rgba(247, 187, 163, 0.5),
    -27px 0 0 0 rgba(247, 187, 163, 0.7),
    -19px -19px 0 0 rgba(247, 187, 163, 0.8);
  }
  50% {
    box-shadow: 0 -27px 0 0 rgba(247, 187, 163, 0.8),
    19px -19px 0 0 rgba(242, 153, 116, 0.9),
    27px 0 0 0 #EE7746, 19px 19px 0 0 #EA5518,
    0 27px 0 0 rgba(253, 238, 232, 0.2),
    -19px 19px 0 0 rgba(251, 221, 209, 0.3),
    -27px 0 0 0 rgba(247, 187, 163, 0.5),
    -19px -19px 0 0 rgba(247, 187, 163, 0.7);
  }
  62.5% {
    box-shadow: 0 -27px 0 0 rgba(247, 187, 163, 0.7),
    19px -19px 0 0 rgba(247, 187, 163, 0.8),
    27px 0 0 0 rgba(242, 153, 116, 0.9),
    19px 19px 0 0 #EE7746, 0 27px 0 0 #EA5518,
    -19px 19px 0 0 rgba(253, 238, 232, 0.2),
    -27px 0 0 0 rgba(251, 221, 209, 0.3),
    -19px -19px 0 0 rgba(247, 187, 163, 0.5);
  }
  75% {
    box-shadow: 0 -27px 0 0 rgba(247, 187, 163, 0.5),
    19px -19px 0 0 rgba(247, 187, 163, 0.7),
    27px 0 0 0 rgba(247, 187, 163, 0.8),
    19px 19px 0 0 rgba(242, 153, 116, 0.9), 0 27px 0 0 #EE7746,
    -19px 19px 0 0 #EA5518,
    -27px 0 0 0 rgba(253, 238, 232, 0.2),
    -19px -19px 0 0 rgba(251, 221, 209, 0.3);
  }
  87.5% {
    box-shadow: 0 -27px 0 0 rgba(251, 221, 209, 0.3),
    19px -19px 0 0 rgba(247, 187, 163, 0.5),
    27px 0 0 0 rgba(247, 187, 163, 0.7),
    19px 19px 0 0 rgba(247, 187, 163, 0.8),
    0 27px 0 0 rgba(242, 153, 116, 0.9),
    -19px 19px 0 0 #EE7746,
    -27px 0 0 0 #EA5518,
    -19px -19px 0 0 rgba(253, 238, 232, 0.2);
  }
  100% {
    box-shadow: 0 -27px 0 0 rgba(253, 238, 232, 0.2),
    19px -19px 0 0 rgba(251, 221, 209, 0.3),
    27px 0 0 0 rgba(247, 187, 163, 0.5),
    19px 19px 0 0 rgba(247, 187, 163, 0.7),
    0 27px 0 0 rgba(247, 187, 163, 0.8),
    -19px 19px 0 0 rgba(242, 153, 116, 0.9),
    -27px 0 0 0 #EE7746,
    -19px -19px 0 0 #EA5518;
  }
}
@media screen and (min-width: 641px) {
  .md {
    &\:w-50 {
      width: 50%;
    }
  }
}
</style>
