<template>
  <div>
    <transition name="onboarding">
      <div class="information" v-if="onBoarding">
        <div class="slider-images">
          <img :src="image" alt="swap-image" />
          <div class="close" @click="closeOnboarding"></div>
        </div>
        <div class="text-center text">
          <h3>{{heading}}</h3>
          <p>{{text}}</p>
        </div>
        <div class="footer d-flex flex-align-center">
          <div class="dots flex-1">
            <ul class="d-flex pl-5">
              <li
                v-for="(item, index) in sliders"
                :key="index"
                :class="{'active': nextslider === index }"
                @click="nextslider = index"
              ></li>
            </ul>
          </div>
          <div class="flex-1">
            <button
              class="btn btn-primary-rupeek w-full"
              @click="moveNextSlider"
            >{{btnText}}</button>
          </div>
        </div>
      </div>
    </transition>
    <div
      v-if="onBoarding"
      class="leadform z-index-999"
      @click="closeOnboarding"
    ></div>
  </div>
</template>

<script>
import step1 from '@/assets/onboarding/step1.svg';
import step2 from '@/assets/onboarding/step2.png';
import step3 from '@/assets/onboarding/step3.svg';

export default {
  name: 'OnBoardingScreen',
  props: {
    onBoarding: Boolean,
  },
  data() {
    return {
      vw: 0,
      btnText: 'Next',
      // Array is used to store the text and sliders images
      sliders: [
        {
          image: step1,
          heading: 'Make Payments',
          text: 'Partner branch within 3 KM from your Doorstep.',
        },
        {
          image: step2,
          heading: 'Renew Loans',
          text: 'Renew loans to extend the tenure',
        },
        {
          image: step3,
          heading: 'Payment Methods',
          text: 'Pay online for a seamless experience',
        },
      ],
      // variable is used to store current images
      image: '',
      // variable is used to store current text
      text: '',
      // variable is used to store current heading
      heading: '',
      // variable is used to store count next slider
      nextslider: 0,
    };
  },
  watch: {
    nextslider(val) {
      // looping the sliders array
      this.sliders.map((key, index) => {
        // if index and nextslider value isequle then add the image and text variable
        if (index === val) {
          this.image = key.image;
          this.text = key.text;
          this.heading = key.heading;
        }
        return this.image;
      });
      this.btnText = (this.nextslider === this.sliders.length - 1) ? 'Got It' : 'Next';
    },
  },
  methods: {
    // function call to increase the sliders index if user click next button
    moveNextSlider(event, slideNumber) {
      if (this.btnText === 'Got It') { this.closeOnboarding(); }
      // increaseing by 1
      this.nextslider = slideNumber || this.nextslider + 1;
    },
    closeOnboarding() {
      localStorage.setItem('onboardingVisible', true);
      this.$emit('closeOnboarding', false);
    },
    handleResize() {
      this.vw = window.innerWidth;
    },
  },
  mounted() {
    this.image = this.sliders[0].image;
    this.text = this.sliders[0].text;
    this.heading = this.sliders[0].heading;
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
};
</script>

<style lang="scss" scoped>
.onboarding-enter-active {
  animation: slideUp 300ms linear forwards;
}
.onboarding-leave-active {
  animation: slideUp 300ms linear reverse;
}

.information {
  position: fixed;
  z-index: 9999;
  background-color: #ffffff;
  width: 100%;
  max-width: 500px;
  bottom: 0px;
  left: 50%;
  border-radius: 10px 10px 0px 0px;
  color: #484848;
  transform: translateX(-50%);
  .slider-images {
    position: relative;
    img {
      width: 100%;
    }
    .close {
      position: absolute;
      right: 10px;
      top: 10px;
      height: 24px;
      width: 24px;
      background-image: url("~@/assets/onboarding/close.svg");
      cursor: pointer;
    }
  }
  .text {
    padding: 32px 0;
    h3 {
      font-size: clamp(1.25rem, 2vw, 1.6rem);
      font-weight: 600;
    }
    p {
      margin-top: clamp(0.5rem, 5vw, 0.8rem);
      font-size: clamp(0.9rem, 2vw, 1.1rem);
      color: #727272;
    }
  }
  .footer {
    justify-content: space-around;
    .dots {
      li {
        width: clamp(8px, 2vw, 10px);
        aspect-ratio: 1;
        opacity: 0.5;
        border-radius: 5px;
        background-color: rgba(0, 0, 0, 0.29);
        margin-right: clamp(5px, 3vw, 16px);
        &:hover {
          cursor: pointer;
        }
        &.active {
          background-image: linear-gradient(to bottom, #fe9411, #ff6300);
        }
      }
    }
    .btn-next {
      background-image: linear-gradient(to top, #6cb9f5 1%, #1287e5 99%);
      width: 188px;
      height: 44px;
      border-radius: 60px;
      font-size: clamp(0.75rem, 4vw, 1.75rem);
      color: #ffffff;
    }
  }
}
</style>
