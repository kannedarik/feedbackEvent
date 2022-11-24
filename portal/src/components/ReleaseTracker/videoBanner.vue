<template>
  <div class="white-background d-flex align-items-center
    justify-content-between p-3 w-100 video-section border-box">
    <div>
      <h4 class="text-sm font-bold mb-2">
       {{ assets.title }}
      </h4>
      <p class="text-xs inter-font-family">
       {{ assets.description }}
      </p>
    </div>
    <div class="player ml-1">
      <div class="video_container cursor-pointer" @click="openVideoPlayer()">
        <img :src="assets.thumbnailUrl" alt="video_thumbnail_image"
          :class="[assets.hasPartReleaseInfo ? 'imageheight' : 'imageThumbnail']" />
        <PlayButton @PlayVideo="openVideoPlayer()" :isVideoBanner="true" />
        <div class="duration-chip d-flex justify-content-center
          align-items-center position-absolute" v-if="assets.duration">
          {{ assets.duration }}
        </div>
      </div>
      <VideoPlayerModal :assets="assets" v-if="isVideoPlayerOpened"
        @videoPlayerClosed="isVideoPlayerOpened = false" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import VideoPlayerModal from './VideoInfo/VideoPlayerModal.vue';
import PlayButton from './VideoInfo/PlayButton.vue';

export default {
  name: 'VideoBanner',
  components: {
    PlayButton,
    VideoPlayerModal,
  },
  props: {
    eventDetails: {
      type: Object,
      required: true,
    },
    assets: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isVideoPlayerOpened: false,
    };
  },
  methods: {
    openVideoPlayer() {
      if (!_.isEmpty(this.eventDetails)) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_CLICKED_ON_RELEASE_VIDEO,
          [events.PAYMENT_REDIRECTEDTO]: 'InApp Player',
          [events.PAYMENT_ORDER_ID]: this.$route.params.id,
          [events.PAYMENT_RELATEDLOAN]: this.eventDetails.relatedLoan.join(','),
        };
        sendEvent(events.screen.PAYMENT_STATUS_CARD_DETAILS, events.category.PAYMENT, properties);
      }
      if (this.assets.hasPartReleaseInfo) {
        this.$emit('showPartReleaseInfo');
      } else {
        this.isVideoPlayerOpened = true;
      }
    },
  },
};
</script>
<style scoped lang="scss">
.player {
  position: relative;
  .video_container {
    .imageThumbnail {
      width: 80px;
      border-radius: 8px;
    }
    .imageheight {
      height: 72px;
    }
    .duration-chip {
      background: rgba(196, 196, 196, 0.3);
      border-radius: 4px;
      width: 36px;
      height: 19px;
      bottom: 5px;
      right: 10px;
      z-index: 50;
      color: #fff;
      font-size: 10px;
      opacity: 0.7;
    }
  }
}
</style>
