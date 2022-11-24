<template>
  <div>
    <b-modal
      v-if="isVideoPlayerOpened"
      ref="videoModalRef"
      id="videoModal"
      centered
      visible
      static
      hide-footer
      hide-header
      no-fade
      content-class="video-player"
      @shown="showModal"
      @hidden="hideModal"
    >
      <template #default>
        <transition
          name="custom-classes-transition"
          enter-active-class="animated fadeInDown"
          leave-active-class="animated fadeOutUp"
          appear
        >
          <div class="header position-absolute d-flex flex-column" v-if="showHeader">
            <div class="closeBtn cursor-pointer d-flex justify-content-between align-items-center">
              <h2 class="title bold-font">{{ assets.title }}</h2>
              <span @click="hideModal">×</span>
            </div>
            <div class="content">
              <p class="desc">{{ assets.description }}</p>
            </div>
          </div>
        </transition>
        <Player
          :options="{ ...videoOptions, sources: assets.sources }"
          :showHeader="showHeader"
          @playing="hideHeaderText"
          @paused="showHeaderText"
          @active="showHeaderText"
          @inactive="hideHeaderText"
        >
        </Player>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Player from './Player.vue';

export default {
  props: {
    assets: null,
  },
  data() {
    return {
      // show video player
      isVideoPlayerOpened: false,
      // show header message
      showHeader: true,
      // default video options
      videoOptions: {
        controls: true,
        preload: 'auto',
        autoplay: true,
        responsive: true,
        allowFullWindow: true,
        techOrder: ['html5', 'youtube'],
      },
    };
  },
  components: {
    Player,
  },
  methods: {
    // methods to add animation when modal is opened and closed
    showModal() {
      const modal = document.getElementById('videoModal');
      modal.parentElement.parentElement.classList.remove('hidden');
      modal.classList.add('zoomIn');
      modal.classList.add('animated');
    },
    hideModal(event) {
      const modal = document.getElementById('videoModal');
      event.preventDefault();
      modal.classList.add('zoomOut');
      modal.parentElement.parentElement.classList.add('hidden');
      setTimeout(() => {
        this.$refs.videoModalRef.hide();
        modal.parentElement.parentElement.classList.add('hidden');
        this.isVideoPlayerOpened = false;
        this.$emit('videoPlayerClosed');
      }, 1000);
    },
    hideHeaderText() {
      this.showHeader = false;
    },
    showHeaderText() {
      this.showHeader = true;
    },
  },
  mounted() {
    this.isVideoPlayerOpened = true;
  },
};
</script>

<style lang="scss">
.modal-body {
  padding: 0px;
  margin: 0px;
}
.video-player {
  height: calc(100vh - 1rem);
  width: 100vw;
  background: #484848;
  @media only screen and (min-width: 961px) {
    height: 720px;
    width: 360px;
  }
  .header {
    top: 10px;
    left: 0;
    color: #fff;
    z-index: 100;
    width: 100%;
    height: 300px;
    border-bottom: none !important;
    .closeBtn {
      font-size: 40px;
      width: 100%;
      height: 40px;
      padding: 5px;
      .title {
        font-size: 18px;
        line-height: inherit;
        margin-top: 16px;
        background: transparent;
      }
      span {
        margin-right: 8px;
      }
    }
    .content {
      .desc {
        font-size: 14px;
        margin: 20px;
        color: #FAFAFA;
      }
    }
    &::after {
      content: "";
      box-shadow: 0px 10px 80px 20px rgba(0, 0, 0, 0.7);
    }
  }
}
</style>
