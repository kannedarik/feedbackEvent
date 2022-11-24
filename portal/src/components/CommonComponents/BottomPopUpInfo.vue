<template>
  <Container class="information">
    <div class="position-relative">
      <div class="close-icon cursor-pointer" @click="closeOnboarding()"></div>
    </div>
    <div class="sm:px-3 md:px-8" v-if="!hasPartReleaseSummary">
      <div>
        <h3 class="text-center my-3 text-lg font-bold">
          What is Part Release?
        </h3>
        <img src="@/assets/part_release_gif/bottomsheet.gif"
          alt="video_thumbnail_image" class="w-full md:w-7/12 md:mx-auto"/>
      </div>
      <div class="flex items-center my-3 p-3 note-info inter-font-family">
        <img :src="infoIcon" alt="infoIcon" class="w-8" />
        <p class="text-sm ml-2">
          Note: The remaining gold after part release will be booked as a new loan
        </p>
      </div>
    </div>
    <div class="sm:px-4 md:px-8" v-else-if="hasProceedPartRelease">
      <div>
        <h3 class="my-3 text-lg font-bold">
          Part Release Confirmation
        </h3>
      </div>
      <div class="flex items-start my-3 p-3 note-part-release inter-font-family">
        <img :src="infoIcon" alt="infoIcon" class="w-8" />
        <p class="text-sm ml-2">
          {{getMessage}}<br />
          Do you want to proceed?
        </p>
      </div>
      <div class="new-loan-card p-3">
        <div class="font-secondary flex items-center justify-between pb-3.5 border-bottom">
          Gold for Part Release
          <span class="total-loans rounded-md inter-font-family px-2 font-semibold">
            {{partReleaseInfo.goldPartReleaseCount}}
          </span>
        </div>
        <div class="font-secondary flex items-center justify-between pt-3.5">
          Total Payable Amount
          <span class="inter-font-family font-semibold">
            {{partReleaseInfo.payableAmount}}
          </span>
        </div>
      </div>
      <div class="flex items-center justify-around my-3">
        <button class="btn-rounded-secondary text-sm md:text-base rounded-full w-full"
          @click="closeOnboarding()">
          Go Back
        </button>
        <button class="btn-primary-rupeek text-sm md:text-base rounded-full w-full ml-5"
          @click="continueToPay()">
          {{ partReleaseInfo.payableAmount
            ? `Pay ${partReleaseInfo.payableAmount}` : 'Confirm'
          }}
        </button>
      </div>
    </div>
    <div v-else class="sm:px-4 md:px-8 py-4">
      <div class="font-secondary">
        <h4 class="mb-4 bold-font">
          Gold for New Loan
          <span class="total-loans rounded-md inter-font-family ml-2 px-2 font-semibold">
            {{goldRelease.length}}
          </span>
        </h4>
      </div>
      <JewelsList class="mt-3"
        :jewelsList="goldRelease"
        :index="0"
      />
    </div>
  </Container>
</template>

<script>
import _ from 'lodash';
import infoIcon from '@/assets/icons/info_icon.svg';
import JewelsList from '@/components/ReleaseTracker/jewelsCarousel.vue';
import Container from './Container.vue';

export default {
  name: 'BottomPopUpInfo',
  data() {
    return {
      infoIcon,
    };
  },
  components: {
    JewelsList,
    Container,
  },
  computed: {
    _() {
      return _;
    },
    getMessage() {
      return this.partReleaseInfo.payableAmount ? 'You cannot change the gold jewels after making payment.'
        : 'You cannot change the gold jewels after confirmation.';
    },
  },
  props: {
    hasPartReleaseSummary: {
      type: Boolean,
    },
    hasProceedPartRelease: {
      type: Boolean,
    },
    goldRelease: {
      type: Array,
    },
    partReleaseInfo: {
      type: Object,
    },
  },
  methods: {
    // function call to close the address/view jewels screen
    closeOnboarding() {
      localStorage.setItem('partReleaseFlowInfo', true);
      this.$emit('closeOnboarding');
    },
    continueToPay() {
      this.$emit('continueToPay');
    },
  },
};
</script>
<style lang="scss">
.information {
  position: fixed;
  z-index: 99999;
  width: 100%;
  height: auto !important;
  bottom: 0;
  left: 0;
  right: 0;
  color: #1E2D4B;
  .close-icon {
    position: absolute;
    right: 5px;
    opacity: 1;
    top: -55px;
    height: 40px;
    width: 40px;
    background-image: url("../../assets/icons/new_closing_icon.svg");
  }
  .br {
    border-radius: 16px 16px 0px 0px;
  }
  .note-info {
    background: #fafafa;
    border-radius: 4px;
  }
  .note-part-release {
    background: #FEF6E6;
    border: 1px solid #FBC441;
    border-radius: 4px;
  }
}
</style>
